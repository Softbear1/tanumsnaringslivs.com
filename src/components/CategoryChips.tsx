"use client";
import {
  Hammer, UtensilsCrossed, Sparkles, ShoppingBag,
  Truck, Monitor, Home, Map, LayoutGrid,
} from "lucide-react";
import { Category } from "@/lib/data";
import clsx from "clsx";

const iconMap: Record<string, React.ElementType> = {
  Hammer, UtensilsCrossed, Sparkles, ShoppingBag, Truck, Monitor, Home, Map,
};

type Props = {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  featuredIds?: string[];
  accentColor?: string;
};

export default function CategoryChips({ categories, selected, onSelect, featuredIds = [], accentColor }: Props) {
  return (
    <div id="kategorier" className="bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap gap-2">
          {/* Alla */}
          <button
            onClick={() => onSelect(null)}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all",
              selected === null
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-[var(--bg)] text-[var(--primary)] hover:bg-[var(--primary)]/10 border border-[var(--border)]"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Alla
          </button>

          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            const isActive = selected === cat.id;
            const isFeatured = featuredIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(isActive ? null : cat.id)}
                className={clsx(
                  "relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--bg)] text-[var(--primary)] hover:bg-[var(--primary)]/10 border border-[var(--border)]"
                )}
              >
                {Icon && (
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: isActive ? "white" : cat.color }}
                  />
                )}
                {cat.name}
                {isFeatured && !isActive && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white"
                    style={{ backgroundColor: accentColor ?? cat.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
