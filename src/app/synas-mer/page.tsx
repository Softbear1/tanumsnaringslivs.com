import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap, Megaphone, Star, Check, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Synas mer – Tanums Näringsliv",
  description:
    "Allt på Tanums Näringsliv är gratis. Här är vad som kommer för företag som vill synas ännu mer.",
};

const boostIncludes = [
  "Garanterad annonsplats i företagsgalleriet",
  "Pinnat blixterbjudande överst på erbjudandesidan",
  "Topplacering i din kategori",
  "Utökad statistik",
];

export default function SynasMer() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till admin
          </Link>

          <h1 className="text-3xl font-bold text-[var(--primary)] mb-3">Vill du synas mer?</h1>
          <p className="text-[var(--muted)] leading-relaxed mb-10 max-w-xl">
            Allt på Tanums Näringsliv är gratis — profil, annonser, blixterbjudanden och
            sommarjobb — och grunderna förblir gratis. För företag som vill sticka ut extra
            planerar vi ett frivilligt Boost-paket. Anmäl intresse så hör vi av oss innan det lanseras.
          </p>

          <div className="rounded-2xl border-2 border-[var(--boost-border)] bg-white p-6 card-shadow mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--boost)] text-white">
                <Star className="w-4 h-4 fill-current" />
              </span>
              <h2 className="font-bold text-[var(--primary)] text-lg">Boost — kommer snart</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-5">
              Mer synlighet i katalogen, erbjudandena och din kategori.
            </p>
            <ul className="space-y-2.5 mb-6">
              {boostIncludes.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Check className="w-4 h-4 text-[var(--boost)] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:elias.bengtsson@live.com?subject=Intresserad%20av%20Boost%20p%C3%A5%20Tanums%20N%C3%A4ringsliv"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--boost)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              Anmäl intresse
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-center gap-2 mb-2 text-[var(--boost)]">
                <Zap className="w-4 h-4" />
                <h3 className="font-semibold text-[var(--primary)] text-sm">Under tiden: blixterbjudanden</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">
                Skapa dagsfärska erbjudanden gratis — de syns på startsidan och postas
                automatiskt till Facebook.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                <Megaphone className="w-4 h-4" />
                <h3 className="font-semibold text-[var(--primary)] text-sm">Under tiden: annonser</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">
                Skapa kategori-riktade annonser gratis — de visas i galleriet och i AI-chatten
                när kunder söker i din bransch.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
