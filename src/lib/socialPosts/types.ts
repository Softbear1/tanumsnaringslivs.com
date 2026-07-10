// Typ-agnostisk kärna för de dagliga Facebook-inläggen. Varje inläggstyp
// (företagspresentation, nytt-företag, omröstning …) implementerar samma
// PostTypeHandler-kontrakt och registreras i registry.ts. Cron-routen
// /api/social/post-daily och superadmin dispatchar via typen — så nya format
// läggs till utan att röra route, tabell eller UI.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

export type AdminClient = SupabaseClient<Database>;

export type ScheduledPostRow = Database["public"]["Tables"]["scheduled_posts"]["Row"];

export type PostContext = {
  admin: AdminClient;
  /** Publik bas-URL utan avslutande slash, t.ex. https://tanumsnaringsliv.com */
  siteUrl: string;
};

/** Vad som ska postas — resultatet av ett auto-urval eller en manuell köning. */
export type PostDraft = {
  business_id?: string | null;
  payload?: Record<string, unknown> | null;
};

/** Färdigt innehåll att posta till Facebook. */
export type PostContent = {
  caption: string;
  /** Absolut bild-URL som Facebook hämtar. null → text/länk-fallback. */
  imageUrl: string | null;
  /** Länk för text-fallback (och som CTA i captionen). */
  link: string;
};

export interface PostTypeHandler {
  type: string;
  /** Etikett i superadmin. */
  label: string;
  /** Auto-välj dagens innehåll. null = inget att posta idag. */
  selectAuto(ctx: PostContext): Promise<PostDraft | null>;
  /** Bygg caption + bild-URL för en köad eller auto-vald rad. */
  build(row: ScheduledPostRow, ctx: PostContext): Promise<PostContent>;
}
