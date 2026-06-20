export const runtime = "edge";
import { getDirectoryData, getSeasonalTheme } from "@/lib/fetch";
import { createServerClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import DirectoryClient from "@/components/DirectoryClient";
import RegisterCTA from "@/components/RegisterCTA";
import VisitorCTAs from "@/components/VisitorCTAs";
import JobSpotlight from "@/components/JobSpotlight";
import JobAlertSignup from "@/components/JobAlertSignup";
import Footer from "@/components/Footer";
import type { Ad } from "@/components/AdCard";
import type { FlashDeal, FlashTeaser } from "@/components/FlashDeals";
import { stockholmToday, endOfStockholmDayISO, relativeDayLabel } from "@/lib/time";

export default async function Home() {
  const { categories, businesses } = await getDirectoryData();
  const theme = await getSeasonalTheme();

  // Fetch active ads, then enrich with business name/initials
  const supabase = await createServerClient();
  const { data: adRows } = await supabase
    .from("ads")
    .select("id, headline, body, cta_label, cta_url, category_id, business_id")
    .eq("active", true)
    .or("starts_at.is.null,starts_at.lte.now()")
    .or("ends_at.is.null,ends_at.gt.now()");

  const adBusinessIds = [...new Set((adRows ?? []).map((r) => r.business_id))];
  const { data: adBizRows } = adBusinessIds.length
    ? await supabase.from("businesses").select("id, name, initials").in("id", adBusinessIds)
    : { data: [] };
  const bizById = Object.fromEntries((adBizRows ?? []).map((b) => [b.id, b]));

  const ads: Ad[] = (adRows ?? []).map((row) => ({
    id: row.id,
    headline: row.headline,
    body: row.body,
    cta_label: row.cta_label,
    cta_url: row.cta_url,
    category_id: row.category_id,
    business_id: row.business_id,
    business_name: bizById[row.business_id]?.name ?? "",
    business_initials: bizById[row.business_id]?.initials ?? "?",
  }));

  // Logga en sidvisning för hela katalogen (utan business_id) — underlag för
  // "sidans visningar"-statistiken i admin. Fire and forget.
  supabase.from("page_views").insert({}).then(() => {});

  // Shuffle ad order server-side so different advertisers lead on different loads
  // when there are more relevant ads than display slots. Done here (not in the
  // client grid) to keep the SSR and hydrated order identical.
  for (let i = ads.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ads[i], ads[j]] = [ads[j], ads[i]];
  }

  // Flash deals (blixterbjudanden). Today's deals are read in full (RLS only
  // exposes today's active rows; we also pin deal_date so a logged-in owner
  // never sees their own future deal here). Upcoming deals come from the
  // teaser view, which exposes business + date but never the offer itself.
  const today = stockholmToday();
  const [{ data: dealRows }, { data: teaserRows }] = await Promise.all([
    supabase
      .from("flash_deals")
      .select("id, headline, description, business_id")
      .eq("active", true)
      .eq("deal_date", today),
    supabase
      .from("flash_deal_upcoming")
      .select("id, business_id, deal_date")
      .order("deal_date", { ascending: true })
      .limit(12),
  ]);

  const dealBizIds = [
    ...new Set([...(dealRows ?? []), ...(teaserRows ?? [])].map((r) => r.business_id as string)),
  ];
  const { data: dealBizRows } = dealBizIds.length
    ? await supabase.from("businesses").select("id, name, initials, logo_url").in("id", dealBizIds)
    : { data: [] };
  const dealBizById = Object.fromEntries((dealBizRows ?? []).map((b) => [b.id, b]));

  const flashDeals: FlashDeal[] = (dealRows ?? []).map((r) => ({
    id: r.id,
    headline: r.headline,
    description: r.description,
    business_id: r.business_id,
    business_name: dealBizById[r.business_id]?.name ?? "",
    business_initials: dealBizById[r.business_id]?.initials ?? "?",
    business_logo: dealBizById[r.business_id]?.logo_url ?? null,
  }));

  const flashTeasers: FlashTeaser[] = (teaserRows ?? []).map((r) => ({
    id: r.id as string,
    business_name: dealBizById[r.business_id as string]?.name ?? "",
    business_initials: dealBizById[r.business_id as string]?.initials ?? "?",
    business_logo: dealBizById[r.business_id as string]?.logo_url ?? null,
    dayLabel: relativeDayLabel(r.deal_date as string),
  }));

  const dealsEndAt = endOfStockholmDayISO();

  // Featured jobs for homepage spotlight (newest 3 active)
  const { data: featuredJobRows } = await supabase
    .from("jobs")
    .select("id, title, location, job_type")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);
  const featuredJobs = (featuredJobRows ?? []) as { id: string; title: string; location: string; job_type: string }[];

  return (
    <>
      <Header />
      <main className="flex-1">
        <DirectoryClient
          categories={categories}
          businesses={businesses}
          ads={ads}
          theme={theme}
          flashDeals={flashDeals}
          flashTeasers={flashTeasers}
          dealsEndAt={dealsEndAt}
        />
        {featuredJobs.length > 0 && <JobSpotlight jobs={featuredJobs} />}
        <VisitorCTAs />
        <JobAlertSignup />
        <RegisterCTA />
      </main>
      <Footer />
    </>
  );
}
