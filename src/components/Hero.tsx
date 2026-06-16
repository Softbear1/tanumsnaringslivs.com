"use client";
import { Search } from "lucide-react";
import type { SeasonTheme } from "@/lib/season";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  theme: SeasonTheme;
};

export default function Hero({ search, onSearch, theme }: Props) {
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
      {/* Glow — tinted by the current season */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 opacity-20 rounded-full blur-3xl"
        style={{ backgroundColor: theme.glow }}
      />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#1B3A4B] opacity-30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <span
            className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full text-xs font-semibold text-white/90 ring-1 ring-white/15"
            style={{ backgroundColor: `${theme.glow}22` }}
          >
            <span aria-hidden>{theme.emoji}</span> {theme.label} på Bohuskusten
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4">
            {theme.heroTitle}{" "}
            <span style={{ color: theme.glow }}>{theme.heroAccentWord}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed">
            {theme.heroSubtitle}
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
