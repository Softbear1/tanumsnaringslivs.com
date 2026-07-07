import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BoardList from "@/components/BoardList";

// Statisk sida — annonserna hämtas klient-side i BoardList. Medvetet val:
// varje edge-renderad sida kostar ~1,7 MB av Cloudflares 25 MB-tak, och
// tavlans innehåll mår bra av att alltid vara färskt i webbläsaren.
export const metadata: Metadata = {
  title: "Anslagstavlan – köp, sälj och hyr i Tanum | Tanums Näringsliv",
  description:
    "Gratis radannonser i Tanums kommun: köpes, säljes, uthyres, arbete utföres, loppis och bortskänkes. Som tidningens anslagstavla — fast gratis och alltid aktuell.",
  alternates: { canonical: "https://tanumsnaringsliv.com/anslagstavlan" },
};

export default function AnslagstavlanPage() {
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
          <BoardList />
        </div>
      </main>
      <Footer />
    </>
  );
}
