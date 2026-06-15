"use client";
import { Search } from "lucide-react";
import VisitorCounter from "./VisitorCounter";

type Props = {
  search: string;
  onSearch: (v: string) => void;
};

export default function Hero({ search, onSearch }: Props) {
  return (
    <section className="relative overflow-hidden bg-[var(--primary)] text-white">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--accent)] opacity-20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#1B3A4B] opacity-30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="mb-4">
            <VisitorCounter />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4">
            Hitta rätt företag{" "}
            <span className="text-[#6ECFA8]">i Tanum</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed">
            Bohusländsk kust, lokalt hjärta. Bläddra bland hundratals lokala företag —
            från hantverkare till restauranger och upplevelser.
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Sök företag eller kategori..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-[var(--primary)] placeholder:text-[var(--muted)] text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
