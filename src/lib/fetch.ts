import { createServerClient } from "@/lib/supabase-server";
import { staticCategories, staticBusinesses, Category, Business } from "@/lib/data";
import {
  getSeasonTheme,
  applySeasonalContent,
  isoWeekKey,
  type SeasonTheme,
  type SeasonalContent,
} from "@/lib/season";

function mapBusiness(b: Record<string, unknown>): Business {
  return {
    id: b.id as string,
    name: b.name as string,
    categoryId: b.category_id as string,
    description: b.description as string,
    phone: b.phone as string,
    email: b.email as string,
    website: (b.website as string) ?? undefined,
    address: b.address as string,
    initials: b.initials as string,
    boosted: b.boosted as boolean,
    featured: b.featured as boolean,
    rating: Number(b.rating),
    reviewCount: b.review_count as number,
  };
}

function mapCategory(c: Record<string, unknown>): Category {
  return {
    id: c.id as string,
    name: c.name as string,
    icon: c.icon as string,
    color: c.color as string,
    bgColor: c.bg_color as string,
    sortOrder: c.sort_order as number,
  };
}

export async function getDirectoryData(): Promise<{ categories: Category[]; businesses: Business[] }> {
  let categories: Category[] = staticCategories;
  let businesses: Business[] = staticBusinesses;

  try {
    const supabase = await createServerClient();
    const [catsResult, bizResult] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("businesses").select("*").eq("active", true),
    ]);

    if (catsResult.data && catsResult.data.length > 0) {
      categories = catsResult.data.map(mapCategory);
    }
    if (bizResult.data && bizResult.data.length > 0) {
      businesses = bizResult.data.map(mapBusiness);
    }
  } catch {
    // Use static fallback when Supabase isn't configured
  }

  return { categories, businesses };
}

// Resolve the current season theme, layering AI-generated copy for this ISO week
// on top when it's been cached. Always returns a usable theme — the deterministic
// fallback means the site looks seasonal even with no DB and no AI.
export async function getSeasonalTheme(now: Date = new Date()): Promise<SeasonTheme> {
  const base = getSeasonTheme(now);

  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("seasonal_content")
      .select("*")
      .eq("week_key", isoWeekKey(now))
      .maybeSingle();

    if (data) {
      const content: SeasonalContent = {
        heroTitle: data.hero_title,
        heroSubtitle: data.hero_subtitle,
        spotlightTitle: data.spotlight_title,
        spotlightBody: data.spotlight_body,
        chatGreeting: data.chat_greeting,
      };
      return applySeasonalContent(base, content);
    }
  } catch {
    // Fall back to the deterministic theme when Supabase isn't reachable.
  }

  return base;
}

export async function getBusiness(id: string): Promise<{ business: Business | null; categories: Category[] }> {
  const { categories, businesses } = await getDirectoryData();
  const business = businesses.find((b) => b.id === id) ?? null;
  return { business, categories };
}
