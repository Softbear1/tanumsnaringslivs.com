export const runtime = "edge";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { createServerClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlashDeals, { type FlashDeal, type FlashTeaser } from "@/components/FlashDeals";
import { stockholmToday, endOfStockholmDayISO, relativeDayLabel } from "@/lib/time";

export const metadata: Metadata = {
  title: "Blixterbjudanden – Tanums Näringsliv",
  description: "Dagens blixterbjudanden från lokala företag i Tanum — och en förhandstitt på vad som kommer.",
};

export default async function BlixterbjudandenPage() {
  const supabase = await createServerClient();
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
      .limit(50),
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
  const hasAny = flashDeals.length > 0 || flashTeasers.length > 0;

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Till startsidan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--primary)] mb-2">Blixterbjudanden</h1>
          <p className="text-[var(--muted)] mb-6">
            Dagens erbjudanden gäller bara idag. Imorgon ser du <em>vilka</em> företag som har något på gång — men inte vad. 👀
          </p>
        </div>

        {hasAny ? (
          <FlashDeals deals={flashDeals} teasers={flashTeasers} endsAt={dealsEndAt} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="bg-white rounded-2xl border border-[var(--border)]">
              <EmptyState
                icon={<Zap className="w-10 h-10" />}
                title="Inga blixterbjudanden just nu"
                subtitle="Kika in igen snart — nya erbjudanden dyker upp löpande."
                action={{ label: "Utforska företagen", href: "/" }}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
