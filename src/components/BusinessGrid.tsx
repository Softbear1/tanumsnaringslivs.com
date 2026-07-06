"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Category, Business, getCategory } from "@/lib/data";
import { filterBusinesses, sortBusinesses, selectRelevantAds, SORT_OPTIONS, type SortKey } from "@/lib/directory";
import BusinessCard from "./BusinessCard";
import AdCard, { Ad } from "./AdCard";
import { SlidersHorizontal, Plus } from "lucide-react";

// How many businesses to show before the first "Visa fler". A multiple of 3 so
// the grid stays balanced across 1/2/3 columns and the ad-injection cadence lands
// cleanly. Rendering all 900+ cards at once is both endless scroll and slow.
const PAGE_SIZE = 24;

type Props = {
  categories: Category[];
  businesses: Business[];
  ads: Ad[];
  categoryFilter: string | null;
  search: string;
};

export default function BusinessGrid({ categories, businesses, ads, categoryFilter, search }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const filtered = filterBusinesses(businesses, categories, categoryFilter, search);
  const sorted = sortBusinesses(filtered, sortKey);

  // Whenever the result set changes (filter/search/sort), collapse back to the
  // first page. Adjusting state during render (React's documented pattern) avoids
  // the flash of briefly showing the previous page's card count.
  const resetKey = `${categoryFilter ?? ""}|${search}|${sortKey}`;
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setVisible(PAGE_SIZE);
  }

  const shown = sorted.slice(0, visible);
  const remaining = sorted.length - shown.length;

  // Category-aware ad pool: keeps category-targeted and general ads relevant even
  // while filtering. Each ad is shown at most once per view (cursor never wraps).
  const pool = selectRelevantAds(ads, categoryFilter, search, filtered);

  // Inject one ad every 3rd position (after the 3rd, 6th … business).
  type GridItem = { type: "business"; item: typeof sorted[0] } | { type: "ad"; item: Ad; key: string };
  const items: GridItem[] = [];
  let cursor = 0;

  shown.forEach((biz, i) => {
    items.push({ type: "business", item: biz });
    if ((i + 1) % 3 === 0 && cursor < pool.length) {
      items.push({ type: "ad", item: pool[cursor], key: `ad-${pool[cursor].id}` });
      cursor++;
    }
  });

  // Small result sets (1–2 businesses) never hit a 3rd slot — still surface one
  // relevant ad so advertisers aren't invisible when a category is filtered.
  if (cursor === 0 && pool.length > 0 && shown.length > 0) {
    items.push({ type: "ad", item: pool[0], key: `ad-${pool[0].id}` });
  }

  const activeCategoryName = categoryFilter ? getCategory(categories, categoryFilter)?.name : undefined;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--primary)]">
              {filtered.length} företag
            </h2>
            {categoryFilter && (
              <span className="text-xs bg-[var(--accent-light)] text-[var(--accent)] font-medium px-2.5 py-1 rounded-full">
                {activeCategoryName}
              </span>
            )}
            {search && (
              <span className="text-xs bg-[var(--accent-light)] text-[var(--accent)] font-medium px-2.5 py-1 rounded-full">
                &ldquo;{search}&rdquo;
              </span>
            )}
          </div>
          {!categoryFilter && !search && (
            <p className="text-sm text-[var(--muted)] mt-0.5">Visar alla {businesses.length} listade företag</p>
          )}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-[var(--muted)] bg-white border border-[var(--border)] pl-3 pr-2 py-2 rounded-lg card-shadow cursor-pointer">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sortera:</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-transparent font-medium text-[var(--primary)] focus:outline-none cursor-pointer pr-1"
            aria-label="Sortera företag"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <p className="text-lg font-medium">Inga företag hittades</p>
          <p className="text-sm mt-1">Prova en annan sökning eller kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => {
              if (item.type === "ad") {
                return (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdCard ad={item.item} variant="gallery" />
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={item.item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min((idx % PAGE_SIZE) * 0.03, 0.2) }}
                >
                  <BusinessCard business={item.item} categories={categories} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[var(--border)] text-[var(--primary)] font-medium text-sm card-shadow hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Visa fler företag
          </button>
          <p className="text-xs text-[var(--muted)]">
            Visar {shown.length} av {filtered.length}
          </p>
        </div>
      )}
    </section>
  );
}
