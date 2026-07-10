export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { runDailyPost } from "@/lib/socialPosts/run";

export const maxDuration = 30;

const SITE_URL = "https://tanumsnaringsliv.com";

// Publicerar dagens schemalagda inlägg på Facebook-sidan (t.ex. "Dagens
// företagspresentation"). Tänkt att triggas en gång på morgonen (svensk tid) av
// pg_cron via pg_net. Skyddad av SOCIAL_POST_SECRET (Bearer), samma mönster som
// post-deals och season-routerna. Idempotent — se runDailyPost.
//
// ?dry=1 bygger caption + bild-URL utan att posta (för test).

async function handle(request: NextRequest): Promise<Response> {
  const secret = process.env.SOCIAL_POST_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY saknas" }, { status: 503 });
  }

  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const result = await runDailyPost(admin, SITE_URL, { dry });

  if (result.status === "not_configured") {
    return Response.json({ error: "Facebook är inte konfigurerat (FB_PAGE_ID/FB_PAGE_TOKEN)" }, { status: 503 });
  }
  const httpStatus = result.status === "failed" ? 500 : 200;
  return Response.json(result, { status: httpStatus });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
