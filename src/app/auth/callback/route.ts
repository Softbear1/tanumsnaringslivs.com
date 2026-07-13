export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { logClaimAttempt } from "@/lib/claim-log";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Only allow relative paths to prevent open redirect
function safeNext(next: string | null): string {
  return next && next.startsWith("/") ? next : "/admin";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNext(searchParams.get("next"));

  // token_hash-länkar (magiska länkar från mejl) verifieras INTE här på GET.
  // Mejlsäkerhetsfilter (Outlook Safe Links m.fl.) förhandshämtar länkar och
  // skulle förbruka engångskoden innan mottagaren själv hinner klicka. Skicka
  // till en bekräftelsesida där verifieringen sker först vid ett aktivt klick.
  if (tokenHash && type) {
    const confirmUrl = new URL("/auth/bekrafta", request.url);
    confirmUrl.searchParams.set("token_hash", tokenHash);
    confirmUrl.searchParams.set("type", type);
    confirmUrl.searchParams.set("next", next);
    return NextResponse.redirect(confirmUrl);
  }

  // PKCE-flödet (code) kräver en cookie i samma webbläsare och kan inte
  // förbrukas av ett mejlfilter — här är direkt utbyte på GET ofarligt.
  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Ogiltig eller ofullständig länk: tillbaka till inloggningen med tydligt
  // fel. `next` följer med så att t.ex. ett företagsövertagande fortfarande
  // slutförs när användaren begär en ny länk.
  const loginUrl = new URL("/admin/logga-in", request.url);
  loginUrl.searchParams.set("error", "expired_link");
  loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

// Förbrukar engångskoden från den magiska länken. Nås via formulär-POST från
// /auth/bekrafta — aldrig via GET — så att mejlens länkskannrar inte kan
// logga in i användarens ställe och bränna länken. (Ligger i samma route som
// GET-hanteraren: en egen route-fil kostar ~540 KiB i Pages Functions-bundlen
// och den totala gränsen är 25 MiB.)
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = String(form.get("type") ?? "");
  const next = safeNext(String(form.get("next") ?? ""));

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
