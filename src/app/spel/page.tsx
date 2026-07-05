import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSection from "@/components/GameSection";

export const metadata: Metadata = {
  title: "KOBBVAKT — Försvara Grebbestad! | Tanums Näringsliv",
  description:
    "Mobilspelet KOBBVAKT: bygg torn på kobbarna, håll havsvarelserna borta från Grebbestads brygga och lär dig om Bohusläns arter på köpet.",
  openGraph: {
    title: "KOBBVAKT — Försvara Grebbestad!",
    description:
      "Tower defense i Bohuslän: bygg torn på kobbarna och försvara bryggan mot havsvarelser.",
    type: "website",
    locale: "sv_SE",
  },
  alternates: { canonical: "https://tanumsnaringsliv.com/spel" },
};

export default function SpelPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <GameSection variant="hero" />
      </main>
      <Footer />
    </>
  );
}
