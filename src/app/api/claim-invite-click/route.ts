export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Klickspårning för inbjudningsmejlet: stämplar clicked_at i claim_invite_log
// och skickar vidare till claim-sidan. Selektiv — bara business_id + kampanj i
// URL:en, inga personuppgifter. Misslyckad loggning får aldrig blockera
// redirecten; mottagaren ska alltid komma vidare till sin profil.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("b") ?? "";
  const campaign = searchParams.get("c") ?? "invite-2026-07";

  const dest = /^[0-9a-f-]{36}$/i.test(businessId)
    ? `https://tanumsnaringsliv.com/foretag/${businessId}/ta-over`
    : "https://tanumsnaringsliv.com/";

  if (/^[0-9a-f-]{36}$/i.test(businessId)) {
    try {
      const admin = createAdminClient();
      if (admin) {
        // Bara första klicket stämplas (clicked_at is null-villkor).
        await admin
          .from("claim_invite_log")
          .update({ clicked_at: new Date().toISOString() })
          .eq("business_id", businessId)
          .eq("campaign", campaign)
          .is("clicked_at", null);
      }
    } catch { /* logga aldrig-fel: gå ändå vidare */ }
  }

  return Response.redirect(dest, 302);
}
