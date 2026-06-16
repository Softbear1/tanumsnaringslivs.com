export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Only allow relative paths to prevent open redirect
  const redirectPath = next.startsWith("/") ? next : "/admin";
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
