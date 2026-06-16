export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "recovery" | "invite" | null;
  const next = searchParams.get("next") ?? "/admin";

  const supabase = await createServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    // Email OTP magic link flow
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  }

  // Only allow relative paths to prevent open redirect
  const redirectPath = next.startsWith("/") ? next : "/admin";
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
