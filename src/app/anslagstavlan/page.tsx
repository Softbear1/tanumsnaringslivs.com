export const runtime = "edge";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BoardList, { type BoardAd } from "@/components/BoardList";

export const metadata: Metadata = {
  title: "Anslagstavlan – köp, sälj och hyr i Tanum | Tanums Näringsliv",
  description:
    "Gratis radannonser i Tanums kommun: köpes, säljes, uthyres, arbete utföres, loppis och bortskänkes. Som tidningens anslagstavla — fast gratis och alltid aktuell.",
  alternates: { canonical: "https://tanumsnaringsliv.com/anslagstavlan" },
};

export default async function AnslagstavlanPage() {
  const supabase = await createServerClient();
  // Endast publika kolumner — kontaktmejl och tokens lämnar aldrig servern.
  const { data } = await supabase
    .from("board_ads")
    .select("id, category, title, body, contact_phone, created_at")
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  const ads = (data ?? []) as BoardAd[];

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">Anslagstavlan</h1>
            <p className="text-[var(--muted)] max-w-2xl">
              Köp, sälj, hyr ut och erbjud tjänster i Tanums kommun — gratis.
              Annonserna ligger uppe i 30 dagar.
            </p>
          </div>
          <BoardList ads={ads} />
        </div>
      </main>
      <Footer />
    </>
  );
}
