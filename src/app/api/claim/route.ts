export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { logClaimAttempt } from "@/lib/claim-log";
import { svAuthError } from "@/lib/auth-errors";
import { orgNrMatches } from "@/lib/orgnr";
import { sendEmail } from "@/lib/email";

// Claim-flödets backend. Tidigare låg detta som server actions, men
// action-POST:ar svarar 404 på Cloudflare Pages-deployen (next-on-pages
// stödjer inte Next 16:s server actions) — varje övertagandeförsök under
// kampanjen dog därför i ett fel. Vanliga route handlers fungerar bevisat
// i produktion, så flödet går via den här endpointen i stället.

type Body = {
  op?: "send-link" | "verify-orgnr" | "manual";
  businessId?: string;
  email?: string;
  orgNr?: string;
  message?: string;
};

const UUID_RE = /^[0-9a-f-]{36}$/i;

async function origin(req: NextRequest): Promise<string> {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "tanumsnaringsliv.com";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const businessId = body.businessId ?? "";
  if (!UUID_RE.test(businessId)) {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ ok: false, error: "Tjänsten är inte konfigurerad." }, { status: 503 });
  }

  const redirectBase = await origin(req);

  // Gammalt flöde — skickar länk till företagets registrerade e-post.
  if (body.op === "send-link") {
    try {
      const { data: biz } = await admin
        .from("businesses")
        .select("id, claimed, owner_id, claim_email")
        .eq("id", businessId)
        .maybeSingle();

      if (!biz) return Response.json({ status: "error", message: "Företaget hittades inte." });
      if (biz.owner_id || biz.claimed) {
        await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "already" });
        return Response.json({ status: "already" });
      }
      if (!biz.claim_email) {
        await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "no_email" });
        return Response.json({ status: "no-email" });
      }

      const supabase = await createServerClient();
      const next = `/foretag/${businessId}/slutfor`;
      const { error } = await supabase.auth.signInWithOtp({
        email: biz.claim_email,
        options: { emailRedirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}` },
      });

      if (error) {
        await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "error", targetEmail: biz.claim_email, detail: error.message });
        return Response.json({ status: "error", message: svAuthError(error.message) });
      }
      await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "sent", targetEmail: biz.claim_email });
      return Response.json({ status: "sent", email: biz.claim_email });
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Okänt fel";
      await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "error", detail });
      return Response.json({ status: "error", message: "Något gick fel på vägen. Försök igen om en stund." });
    }
  }

  // Elias-flödet: verifiera org-nr, skicka magisk länk till angiven e-post.
  if (body.op === "verify-orgnr") {
    const cleanEmail = (body.email ?? "").trim().toLowerCase();
    const orgNr = (body.orgNr ?? "").trim();
    if (!cleanEmail.includes("@") || !orgNr) {
      return Response.json({ ok: false, error: "Ange e-postadress och organisationsnummer." });
    }

    try {
      const { data: biz } = await admin
        .from("businesses")
        .select("id, name, claimed, owner_id, claim_email, scb_org_nr")
        .eq("id", businessId)
        .maybeSingle();

      if (!biz) return Response.json({ ok: false, error: "Företaget hittades inte." });
      if (biz.owner_id || biz.claimed) {
        await logClaimAttempt(admin, { businessId, source: "elias", outcome: "already", targetEmail: cleanEmail });
        return Response.json({ ok: false, error: "Det här företaget har redan en ägare." });
      }

      // Utan org-nr i registret kan vi aldrig verifiera automatiskt. Säg det
      // ärligt (i stället för "numret stämmer inte") så klienten kan gå direkt
      // till manuell granskning.
      if (!biz.scb_org_nr) {
        await logClaimAttempt(admin, { businessId, source: "elias", outcome: "no_orgnr_on_record", targetEmail: cleanEmail });
        return Response.json({ ok: false, code: "no_orgnr", error: "Vi saknar organisationsnummer för den här listningen och kan inte verifiera automatiskt." });
      }

      if (!orgNrMatches(orgNr, biz.scb_org_nr)) {
        await logClaimAttempt(admin, { businessId, source: "elias", outcome: "org_mismatch", targetEmail: cleanEmail, detail: `angivet: ${orgNr}` });
        return Response.json({ ok: false, error: "Organisationsnumret stämmer inte. Kontrollera och försök igen." });
      }

      // Sätt claim_email till angiven adress så att slutfor-sidan kan verifiera.
      // Den tidigare adressen bevaras i loggen om något behöver nystas upp.
      if (biz.claim_email && biz.claim_email.toLowerCase() !== cleanEmail) {
        await logClaimAttempt(admin, { businessId, source: "elias", outcome: "claim_email_replaced", targetEmail: cleanEmail, detail: `tidigare: ${biz.claim_email}` });
      }
      await admin.from("businesses").update({ claim_email: cleanEmail }).eq("id", businessId);

      const supabase = await createServerClient();
      const next = `/foretag/${businessId}/slutfor`;
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: { emailRedirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}` },
      });

      if (error) {
        await logClaimAttempt(admin, { businessId, source: "elias", outcome: "error", targetEmail: cleanEmail, detail: error.message });
        return Response.json({ ok: false, error: svAuthError(error.message) });
      }
      await logClaimAttempt(admin, { businessId, source: "elias", outcome: "sent", targetEmail: cleanEmail });
      return Response.json({ ok: true });
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Okänt fel";
      await logClaimAttempt(admin, { businessId, source: "elias", outcome: "error", targetEmail: cleanEmail, detail });
      return Response.json({ ok: false, error: "Något gick fel på vägen. Försök igen om en stund." });
    }
  }

  // Fallback: manuell begäran för granskning.
  if (body.op === "manual") {
    const email = (body.email ?? "").trim().toLowerCase();
    const message = (body.message ?? "").trim();
    if (!email || !email.includes("@")) {
      return Response.json({ ok: false, error: "Ange en giltig e-postadress." });
    }

    try {
      const { error } = await admin.from("claim_requests").insert({
        business_id: businessId,
        claimant_email: email,
        message: message || null,
        method: "manual",
        status: "pending",
      });

      if (error) {
        await logClaimAttempt(admin, { businessId, source: "manual", outcome: "error", targetEmail: email, detail: error.message });
        return Response.json({ ok: false, error: "Något gick fel på vägen. Försök igen om en stund." });
      }
      await logClaimAttempt(admin, { businessId, source: "manual", outcome: "requested", targetEmail: email });

      // Ingen bevakar claim_requests-tabellen — mejla Elias direkt så att
      // begäran inte blir liggande. Misslyckat mejl får inte fälla svaret.
      const { data: biz } = await admin.from("businesses").select("name").eq("id", businessId).maybeSingle();
      await sendEmail({
        to: "elias.bengtsson@live.com",
        subject: `Manuell övertagandebegäran: ${biz?.name ?? businessId}`,
        html: `<p>${email} vill ta över <strong>${biz?.name ?? businessId}</strong>.</p><p>Meddelande: ${message || "(inget)"}</p><p><a href="https://tanumsnaringsliv.com/foretag/${businessId}">Till listningen</a></p>`,
        text: `${email} vill ta över ${biz?.name ?? businessId}.\nMeddelande: ${message || "(inget)"}\nhttps://tanumsnaringsliv.com/foretag/${businessId}`,
        replyTo: email,
      });

      return Response.json({ ok: true });
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Okänt fel";
      await logClaimAttempt(admin, { businessId, source: "manual", outcome: "error", targetEmail: email, detail });
      return Response.json({ ok: false, error: "Något gick fel på vägen. Försök igen om en stund." });
    }
  }

  return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
}
