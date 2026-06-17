export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { facebookConfigured, postPhotoToPage, postLinkToPage } from "@/lib/facebook";
import { stockholmToday } from "@/lib/time";

export const maxDuration = 30;

const SITE_URL = "https://tanumsnaringsliv.com";

// Publicerar dagens aktiva blixterbjudanden som inlägg på Facebook-sidan.
// Tänkt att triggas en gång på morgonen (svensk tid) av pg_cron via pg_net.
// Skyddad av SOCIAL_POST_SECRET (Bearer-token), samma mönster som season-routen.
//
// Idempotent: bara erbjudanden där fb_post_id är null postas, och id:t sparas
// direkt efter lyckad post — så en upprepad körning samma dag skapar inga
// dubbletter.

type DealRow = {
  id: string;
  headline: string;
  description: string | null;
  business_id: string;
  businesses: { name: string | null; logo_url: string | null } | null;
};

function buildCaption(businessName: string, headline: string, description: string | null, link: string): string {
  const lines = [`⚡ Blixterbjudande idag hos ${businessName}!`, headline];
  if (description) lines.push(description);
  lines.push("", `👉 ${link}`, "Gäller bara idag.");
  return lines.join("\n");
}

async function handle(request: NextRequest): Promise<Response> {
  const secret = process.env.SOCIAL_POST_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!facebookConfigured()) {
    return Response.json({ error: "Facebook är inte konfigurerat (FB_PAGE_ID/FB_PAGE_TOKEN)" }, { status: 503 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY saknas" }, { status: 503 });
  }

  const today = stockholmToday();
  const { data, error } = await admin
    .from("flash_deals")
    .select("id, headline, description, business_id, businesses(name, logo_url)")
    .eq("active", true)
    .eq("post_to_fb", true)
    .eq("deal_date", today)
    .is("fb_post_id", null);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const deals = (data ?? []) as unknown as DealRow[];
  const results: Array<{ id: string; status: "posted" | "failed"; error?: string }> = [];

  for (const deal of deals) {
    const businessName = deal.businesses?.name ?? "Lokalt företag";
    const link = `${SITE_URL}/foretag/${deal.business_id}`;
    const caption = buildCaption(businessName, deal.headline, deal.description, link);
    try {
      const logo = deal.businesses?.logo_url;
      const postId = logo
        ? await postPhotoToPage(logo, caption)
        : await postLinkToPage(caption, link);
      await admin.from("flash_deals").update({ fb_post_id: postId }).eq("id", deal.id);
      results.push({ id: deal.id, status: "posted" });
    } catch (e) {
      results.push({ id: deal.id, status: "failed", error: e instanceof Error ? e.message : "okänt fel" });
    }
  }

  const posted = results.filter((r) => r.status === "posted").length;
  return Response.json({ date: today, total: deals.length, posted, results });
}

export async function POST(request: NextRequest) {
  return handle(request);
}
