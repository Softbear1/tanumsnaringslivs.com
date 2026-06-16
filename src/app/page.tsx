export const runtime = "edge";
import { getDirectoryData, getSeasonalTheme } from "@/lib/fetch";
import { createServerClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import DirectoryClient from "@/components/DirectoryClient";
import RegisterCTA from "@/components/RegisterCTA";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import type { Ad } from "@/components/AdCard";

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
    business_name: bizById[row.business_id]?.name ?? "",
    business_initials: bizById[row.business_id]?.initials ?? "?",
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        <DirectoryClient
          categories={categories}
          businesses={businesses}
          ads={ads}
          theme={theme}
        />
        <RegisterCTA />
      </main>
      <Footer />
      <ChatWidget businesses={businesses} categories={categories} ads={ads} greeting={theme.chatGreeting} />
    </>
  );
}
