"use client";
import {
  Hammer, UtensilsCrossed, Sparkles, ShoppingBag,
  Truck, Monitor, Home, Map, LayoutGrid,
} from "lucide-react";
import { Category, Business } from "@/lib/data";
import { getCategoryCount } from "@/lib/directory";
import clsx from "clsx";

const iconMap: Record<string, React.ElementType> = {
  Hammer, UtensilsCrossed, Sparkles, ShoppingBag, Truck, Monitor, Home, Map,
};

type Props = {
  categories: Category[];
  businesses: Business[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

export default function CategoryGrid({ categories, businesses, selected, onSelect }: Props) {

  return (
    <section id="kategorier" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--primary)]">Bläddra efter kategori</h2>
        <p className="text-[var(--muted)] mt-1">Välj en kategori för att filtrera listan nedan</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3">
        {/* All categories pill */}
        <button
          onClick={() => onSelect(null)}
          className={clsx(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 group",
            selected === null
              ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md"
              : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] hover:shadow-sm card-shadow"
          )}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-xs font-medium text-center leading-tight">Alla</span>
        </button>

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={clsx(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 group",
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md scale-[1.02]"
                  : "border-[var(--border)] bg-white hover:border-[var(--primary)]/30 hover:shadow-sm hover:scale-[1.01] card-shadow"
              )}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-white/20" : ""
                )}
                style={!isActive ? { backgroundColor: cat.bgColor } : {}}
              >
                {Icon && (
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? "white" : cat.color }}
                  />
                )}
              </div>
              <span className={clsx(
                "text-xs font-medium text-center leading-tight",
                isActive ? "text-white" : "text-[var(--primary)]"
              )}>
                {cat.name}
              </span>
              <span className={clsx(
                "text-[10px]",
                isActive ? "text-white/70" : "text-[var(--muted)]"
              )}>
                {getCategoryCount(businesses, cat.id)} st
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
