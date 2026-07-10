// Delad kärna för den dagliga postningen. Används av både cron-routen
// (/api/social/post-daily) och superadmins "Posta nu"-knapp, så logiken finns
// på ett ställe.

import { facebookConfigured, postPhotoToPage, postLinkToPage } from "@/lib/facebook";
import { stockholmToday } from "@/lib/time";
import { getHandler, DEFAULT_POST_TYPE } from "./registry";
import type { AdminClient, PostContext, ScheduledPostRow } from "./types";

export type RunResult = {
  date: string;
  status:
    | "posted"
    | "already_posted"
    | "skipped"
    | "nothing_to_post"
    | "failed"
    | "dry"
    | "not_configured";
  type?: string;
  business_id?: string | null;
  fb_post_id?: string | null;
  caption?: string;
  imageUrl?: string | null;
  error?: string;
};

/**
 * Kör (eller förhandsvisa) dagens inlägg. Idempotent: en redan postad dag
 * postas aldrig om. `dry` bygger caption + bild-URL utan att posta eller skriva.
 */
export async function runDailyPost(
  admin: AdminClient,
  siteUrl: string,
  opts: { dry?: boolean } = {},
): Promise<RunResult> {
  const dry = Boolean(opts.dry);
  const today = stockholmToday();
  const ctx: PostContext = { admin, siteUrl };

  if (!facebookConfigured() && !dry) {
    return { date: today, status: "not_configured" };
  }

  const { data: existing } = await admin
    .from("scheduled_posts")
    .select("*")
    .eq("scheduled_date", today)
    .maybeSingle();

  let row = existing as ScheduledPostRow | null;

  if (row?.fb_post_id) {
    return { date: today, status: "already_posted", fb_post_id: row.fb_post_id, business_id: row.business_id, type: row.post_type };
  }
  if (row?.status === "skipped") {
    return { date: today, status: "skipped" };
  }

  // Ingen rad → auto-välj via standardtypen.
  if (!row) {
    const handler = getHandler(DEFAULT_POST_TYPE);
    if (!handler) return { date: today, status: "failed", error: `Okänd inläggstyp: ${DEFAULT_POST_TYPE}` };

    const draft = await handler.selectAuto(ctx);
    if (!draft) return { date: today, status: "nothing_to_post" };

    if (dry) {
      const preview = await handler.build(
        { post_type: handler.type, business_id: draft.business_id ?? null, payload: draft.payload ?? null } as ScheduledPostRow,
        ctx,
      );
      return { date: today, status: "dry", type: handler.type, business_id: draft.business_id ?? null, caption: preview.caption, imageUrl: preview.imageUrl };
    }

    const { data: inserted, error: insErr } = await admin
      .from("scheduled_posts")
      .insert({
        post_type: handler.type,
        business_id: draft.business_id ?? null,
        scheduled_date: today,
        status: "queued",
        source: "auto",
        payload: draft.payload ?? null,
      })
      .select("*")
      .maybeSingle();

    if (insErr || !inserted) {
      // Samtidig körning la troligen redan in raden — läs om.
      const { data: reread } = await admin.from("scheduled_posts").select("*").eq("scheduled_date", today).maybeSingle();
      row = reread as ScheduledPostRow | null;
      if (row?.fb_post_id) {
        return { date: today, status: "already_posted", fb_post_id: row.fb_post_id, business_id: row.business_id, type: row.post_type };
      }
    } else {
      row = inserted as ScheduledPostRow;
    }
  }

  if (!row) return { date: today, status: "failed", error: "Kunde inte skapa dagens inlägg" };

  const handler = getHandler(row.post_type);
  if (!handler) return { date: today, status: "failed", error: `Okänd inläggstyp: ${row.post_type}` };

  const content = await handler.build(row, ctx);

  if (dry) {
    return { date: today, status: "dry", type: row.post_type, business_id: row.business_id, caption: content.caption, imageUrl: content.imageUrl };
  }

  try {
    const fbPostId = content.imageUrl
      ? await postPhotoToPage(content.imageUrl, content.caption)
      : await postLinkToPage(content.caption, content.link);
    await admin
      .from("scheduled_posts")
      .update({
        status: "posted",
        fb_post_id: fbPostId,
        image_url: content.imageUrl,
        caption: content.caption,
        posted_at: new Date().toISOString(),
        error: null,
      })
      .eq("id", row.id);
    return { date: today, status: "posted", type: row.post_type, business_id: row.business_id, fb_post_id: fbPostId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "okänt fel";
    await admin
      .from("scheduled_posts")
      .update({ status: "failed", error: message, caption: content.caption, image_url: content.imageUrl })
      .eq("id", row.id);
    return { date: today, status: "failed", error: message };
  }
}
