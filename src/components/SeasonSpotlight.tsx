"use client";
import {
  Hammer, UtensilsCrossed, Sparkles, ShoppingBag,
  Briefcase, Fish, Factory,
  Truck, Monitor, Home, Map,
} from "lucide-react";
import { Category } from "@/lib/data";
import type { SeasonTheme } from "@/lib/season";

const iconMap: Record<string, React.ElementType> = {
  Hammer, UtensilsCrossed, Sparkles, ShoppingBag,
  Briefcase, Fish, Factory, Truck, Monitor, Home, Map,
};

type Props = {
  theme: SeasonTheme;
  categories: Category[];
  onSelect: (id: string | null) => void;
};

// "I säsong just nu" — a season-tinted band that surfaces the categories that
// matter most right now, with a one-click filter into each.
export default function SeasonSpotlight({ theme, categories, onSelect }: Props) {
  const featured = theme.categoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c));

  if (featured.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 -mb-2">
      <div
        className="rounded-2xl border p-6 md:p-8"
        style={{
          backgroundColor: theme.accentLight,
          borderColor: `${theme.accent}33`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
              style={{ color: theme.accent }}
            >
              <span aria-hidden>{theme.emoji}</span> {theme.spotlightTitle}
            </span>
            <p className="mt-2 text-[var(--primary)] leading-relaxed">{theme.spotlightBody}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {featured.map((cat) => {
              const Icon = iconMap[cat.icon];
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className="inline-flex items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--primary)] card-shadow hover:scale-[1.02] transition-transform"
                >
                  {Icon && <Icon className="w-4 h-4" style={{ color: cat.color }} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
