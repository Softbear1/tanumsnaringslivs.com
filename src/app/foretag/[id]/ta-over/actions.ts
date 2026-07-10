"use server";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { logClaimAttempt } from "@/lib/claim-log";

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "tanumsnaringsliv.com";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export type ClaimResult =
  | { status: "sent"; email: string }
  | { status: "already" }
  | { status: "no-email" }
  | { status: "error"; message: string };

// Gammalt flöde — skickar länk till företagets registrerade e-post.
export async function sendClaimLink(businessId: string): Promise<ClaimResult> {
  const admin = createAdminClient();
  if (!admin) return { status: "error", message: "Tjänsten är inte konfigurerad." };

  try {
    const { data: biz } = await admin
      .from("businesses")
      .select("id, claimed, owner_id, claim_email")
      .eq("id", businessId)
      .maybeSingle();

    if (!biz) return { status: "error", message: "Företaget hittades inte." };
    if (biz.owner_id || biz.claimed) {
      await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "already" });
      return { status: "already" };
    }
    if (!biz.claim_email) {
      await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "no_email" });
      return { status: "no-email" };
    }

    const supabase = await createServerClient();
    const next = `/foretag/${businessId}/slutfor`;
    const { error } = await supabase.auth.signInWithOtp({
      email: biz.claim_email,
      options: { emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (error) {
      await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "error", targetEmail: biz.claim_email, detail: error.message });
      return { status: "error", message: error.message };
    }
    await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "sent", targetEmail: biz.claim_email });
    return { status: "sent", email: biz.claim_email };
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Okänt fel";
    await logClaimAttempt(admin, { businessId, source: "ta_over", outcome: "error", detail });
    return { status: "error", message: "Något gick fel på vägen. Försök igen om en stund." };
  }
}

// Nytt Elias-flöde: verifiera org-nr, skicka magic link till angiven e-post.
export async function verifyAndSendClaim(
  businessId: string,
  email: string,
  orgNr: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Tjänsten är inte konfigurerad." };

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data: biz } = await admin
      .from("businesses")
      .select("id, name, claimed, owner_id, scb_org_nr")
      .eq("id", businessId)
      .maybeSingle();

    if (!biz) return { ok: false, error: "Företaget hittades inte." };
    if (biz.owner_id || biz.claimed) {
      await logClaimAttempt(admin, { businessId, source: "elias", outcome: "already", targetEmail: cleanEmail });
      return { ok: false, error: "Det här företaget har redan en ägare." };
    }

    const normalize = (s: string) => s.replace(/\D/g, "");
    if (!biz.scb_org_nr || normalize(orgNr) !== normalize(biz.scb_org_nr)) {
      await logClaimAttempt(admin, { businessId, source: "elias", outcome: "org_mismatch", targetEmail: cleanEmail, detail: `angivet: ${orgNr}` });
      return { ok: false, error: "Organisationsnumret stämmer inte. Kontrollera och försök igen." };
    }

    // Sätt claim_email till angiven adress så att slutfor-sidan kan verifiera.
    await admin.from("businesses").update({ claim_email: cleanEmail }).eq("id", businessId);

    const supabase = await createServerClient();
    const next = `/foretag/${businessId}/slutfor`;
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (error) {
      await logClaimAttempt(admin, { businessId, source: "elias", outcome: "error", targetEmail: cleanEmail, detail: error.message });
      return { ok: false, error: error.message };
    }
    await logClaimAttempt(admin, { businessId, source: "elias", outcome: "sent", targetEmail: cleanEmail });
    return { ok: true };
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Okänt fel";
    await logClaimAttempt(admin, { businessId, source: "elias", outcome: "error", targetEmail: cleanEmail, detail });
    return { ok: false, error: "Något gick fel på vägen. Försök igen om en stund." };
  }
}

// Fallback: manuell begäran för super-admin-granskning.
export async function requestManualClaim(
  businessId: string,
  claimantEmail: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Tjänsten är inte konfigurerad." };

  const email = claimantEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) return { ok: false, error: "Ange en giltig e-postadress." };

  try {
    const { error } = await admin.from("claim_requests").insert({
      business_id: businessId,
      claimant_email: email,
      message: message.trim() || null,
      method: "manual",
      status: "pending",
    });

    if (error) {
      await logClaimAttempt(admin, { businessId, source: "manual", outcome: "error", targetEmail: email, detail: error.message });
      return { ok: false, error: error.message };
    }
    await logClaimAttempt(admin, { businessId, source: "manual", outcome: "requested", targetEmail: email });
    return { ok: true };
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Okänt fel";
    await logClaimAttempt(admin, { businessId, source: "manual", outcome: "error", targetEmail: email, detail });
    return { ok: false, error: "Något gick fel på vägen. Försök igen om en stund." };
  }
}
