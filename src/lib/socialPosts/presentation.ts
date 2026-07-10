// "Dagens företagspresentation" — den första (och tills vidare enda) inläggstypen.
//
// Urval: round-robin över verifierade, aktiva företag som inte tackat nej till
// marknadsföring. Företag som aldrig visats går först, därefter det som väntat
// längst. Företag som redan är köade idag eller framåt hoppas över.
//
// Caption: en lugn, saklig presentation (ingen fråga/tagga-uppmaning), med en
// rad om vad man kan göra på hemsidan och en länk till företagsprofilen.

import { stockholmToday } from "@/lib/time";
import { staticCategories, getCategory } from "@/lib/data";
import type { PostTypeHandler, PostContext, PostDraft } from "./types";
import { rankPool, type PoolBusiness, type HistoryRow } from "./ranking";

type BizForCaption = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  postort: string | null;
};

// Deterministisk rotation så dagliga inlägg inte ser identiska ut, utan att bli
// gimmickiga. Alla är påståenden — inga frågor (ren presentation).
const MOJLIGHETER = [
  "På tanumsnaringsliv.com hittar du hela Tanums näringsliv samlat — och som företagare kan du lägga upp blixterbjudanden, annonsera på anslagstavlan och ta emot offertförfrågningar helt gratis.",
  "Visste du att du som Tanumsföretag kan synas gratis på tanumsnaringsliv.com — med egen profil, blixterbjudanden, jobbannonser och plats på anslagstavlan.",
  "tanumsnaringsliv.com samlar kommunens företag på ett ställe. Ta över din listning gratis och lägg till erbjudanden, lediga jobb och annonser.",
];

/** Dagsindex sedan epok — stabilt per datum, för deterministisk rotation. */
function dayIndex(today: string): number {
  const [y, m, d] = today.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

function truncate(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

export function buildPresentationCaption(biz: BizForCaption, siteUrl: string): string {
  const catName = getCategory(staticCategories, biz.category_id)?.name ?? biz.category_id;
  const place = biz.postort ? `${catName} · ${biz.postort}` : catName;
  const link = `${siteUrl}/foretag/${biz.id}`;
  const mojlighet = MOJLIGHETER[dayIndex(stockholmToday()) % MOJLIGHETER.length];

  return [
    `Dagens företagspresentation: ${biz.name}`,
    "",
    truncate(biz.description, 220),
    place,
    "",
    "Hela Tanum. Ett näringsliv.",
    "",
    mojlighet,
    `👉 ${link}`,
  ].join("\n");
}

// Rangordnade kandidater ur databasen. Delas av selectAuto och superadmins
// "på tur"-lista.
async function rankedCandidates(
  admin: PostContext["admin"],
): Promise<Array<{ id: string; name: string }>> {
  const { data: pool } = await admin
    .from("businesses")
    .select("id, name, created_at")
    .eq("active", true)
    .eq("claimed", true)
    .eq("reklamsparr", false);
  if (!pool || pool.length === 0) return [];

  const { data: history } = await admin
    .from("scheduled_posts")
    .select("business_id, scheduled_date")
    .eq("post_type", "presentation");

  return rankPool(pool as PoolBusiness[], (history ?? []) as HistoryRow[], stockholmToday());
}

/** De N företag som står näst på tur i auto-rotationen (för superadmin). */
export async function getUpcomingAutoPicks(
  admin: PostContext["admin"],
  n: number,
): Promise<Array<{ id: string; name: string }>> {
  return (await rankedCandidates(admin)).slice(0, n);
}

export const presentationHandler: PostTypeHandler = {
  type: "presentation",
  label: "Företagspresentation",

  async selectAuto({ admin }: PostContext): Promise<PostDraft | null> {
    const candidates = await rankedCandidates(admin);
    if (candidates.length === 0) return null;
    return { business_id: candidates[0].id };
  },

  async build(row, { admin, siteUrl }) {
    const link = `${siteUrl}/foretag/${row.business_id ?? ""}`;
    if (!row.business_id) {
      return { caption: `Dagens företagspresentation — ${siteUrl}`, imageUrl: null, link };
    }
    const { data: biz } = await admin
      .from("businesses")
      .select("id, name, description, category_id, postort")
      .eq("id", row.business_id)
      .maybeSingle();
    if (!biz) {
      return { caption: `Dagens företagspresentation — ${siteUrl}`, imageUrl: null, link };
    }
    return {
      caption: buildPresentationCaption(biz, siteUrl),
      imageUrl: `${siteUrl}/api/og/foretag/${biz.id}`,
      link,
    };
  },
};
