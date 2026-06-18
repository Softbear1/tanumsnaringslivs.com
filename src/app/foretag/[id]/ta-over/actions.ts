"use server";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

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

  const { data: biz } = await admin
    .from("businesses")
    .select("id, claimed, owner_id, claim_email")
    .eq("id", businessId)
    .maybeSingle();

  if (!biz) return { status: "error", message: "Företaget hittades inte." };
  if (biz.owner_id || biz.claimed) return { status: "already" };
  if (!biz.claim_email) return { status: "no-email" };

  const supabase = await createServerClient();
  const next = `/foretag/${businessId}/slutfor`;
  const { error } = await supabase.auth.signInWithOtp({
    email: biz.claim_email,
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error) return { status: "error", message: error.message };
  return { status: "sent", email: biz.claim_email };
}

// Nytt Elias-flöde: verifiera org-nr, skicka magic link till angiven e-post.
export async function verifyAndSendClaim(
  businessId: string,
  email: string,
  orgNr: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Tjänsten är inte konfigurerad." };

  const { data: biz } = await admin
    .from("businesses")
    .select("id, name, claimed, owner_id, scb_org_nr")
    .eq("id", businessId)
    .maybeSingle();

  if (!biz) return { ok: false, error: "Företaget hittades inte." };
  if (biz.owner_id || biz.claimed) return { ok: false, error: "Det här företaget har redan en ägare." };

  const normalize = (s: string) => s.replace(/\D/g, "");
  if (!biz.scb_org_nr || normalize(orgNr) !== normalize(biz.scb_org_nr)) {
    return { ok: false, error: "Organisationsnumret stämmer inte. Kontrollera och försök igen." };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Sätt claim_email till angiven adress så att slutfor-sidan kan verifiera.
  await admin.from("businesses").update({ claim_email: cleanEmail }).eq("id", businessId);

  const supabase = await createServerClient();
  const next = `/foretag/${businessId}/slutfor`;
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
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

  const { error } = await admin.from("claim_requests").insert({
    business_id: businessId,
    claimant_email: email,
    message: message.trim() || null,
    method: "manual",
    status: "pending",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
