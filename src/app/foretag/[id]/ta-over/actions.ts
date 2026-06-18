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

// Skickar en inloggningslänk till företagets SCB-registrerade e-post. Den som
// kan ta emot mejlet bevisar därmed ägarskap — själva inloggningen är beviset.
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

// Fallback: man har inte tillgång till den registrerade adressen och begär
// manuellt övertagande. Hamnar i super-admin för granskning.
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
