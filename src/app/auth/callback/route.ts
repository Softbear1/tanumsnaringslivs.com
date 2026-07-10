export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { logClaimAttempt } from "@/lib/claim-log";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "recovery" | "invite" | null;
  const next = searchParams.get("next") ?? "/admin";

  const supabase = await createServerClient();

  let authError: string | null = null;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error?.message ?? null;
  } else if (tokenHash && type) {
    // Email OTP magic link flow
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    authError = error?.message ?? null;
  } else {
    authError = "Länken saknar inloggningsuppgifter.";
  }

  if (authError) {
    // Om länken var för ett företagsövertagande, logga det — annars syns
    // aldrig när en magisk länk gått ut eller redan använts (t.ex. om ett
    // mejlsäkerhetsfilter förbrukar länken innan mottagaren själv klickar).
    const claimMatch = next.match(/^\/foretag\/([0-9a-f-]{36})\/slutfor$/i);
    if (claimMatch) {
      const admin = createAdminClient();
      if (admin) {
        await logClaimAttempt(admin, {
          businessId: claimMatch[1],
          source: "callback",
          outcome: "link_invalid",
          detail: authError,
        });
      }
    }

    // Skicka tillbaka till inloggningssidan med ett tydligt fel i stället för
    // att tyst landa på en skyddad sida utan session (studsar annars runt
    // utan förklaring om länken är för gammal eller redan använd).
    const loginUrl = new URL("/admin/logga-in", request.url);
    loginUrl.searchParams.set("error", "expired_link");
    return NextResponse.redirect(loginUrl);
  }

  // Only allow relative paths to prevent open redirect
  const redirectPath = next.startsWith("/") ? next : "/admin";
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
