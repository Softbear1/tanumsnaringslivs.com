export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { logClaimAttempt } from "@/lib/claim-log";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Förbrukar engångskoden från den magiska länken. Nås via formulär-POST från
// /auth/bekrafta — aldrig via GET — så att mejlens länkskannrar inte kan
// logga in i användarens ställe och bränna länken.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = String(form.get("type") ?? "");
  const rawNext = String(form.get("next") ?? "/admin");
  const next = rawNext.startsWith("/") ? rawNext : "/admin";

  let authError: string | null = null;
  if (tokenHash && type) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    authError = error?.message ?? null;
  } else {
    authError = "Länken saknar inloggningsuppgifter.";
  }

  if (authError) {
    // Om länken var för ett företagsövertagande, logga det — annars syns
    // aldrig när en magisk länk gått ut eller redan använts.
    const claimMatch = next.match(/^\/foretag\/([0-9a-f-]{36})\/slutfor$/i);
    if (claimMatch) {
      const admin = createAdminClient();
      if (admin) {
        await logClaimAttempt(admin, {
          businessId: claimMatch[1],
          source: "confirm",
          outcome: "link_invalid",
          detail: authError,
        });
      }
    }

    const loginUrl = new URL("/admin/logga-in", request.url);
    loginUrl.searchParams.set("error", "expired_link");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl, 303);
  }

  return NextResponse.redirect(new URL(next, request.url), 303);
}
