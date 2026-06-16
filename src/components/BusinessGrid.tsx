"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Category, Business, getCategory } from "@/lib/data";
import { filterBusinesses, sortBoostedFirst } from "@/lib/directory";
import BusinessCard from "./BusinessCard";
import { SlidersHorizontal } from "lucide-react";

const AD_POSITIONS = [5, 12]; // inject mock ad at these indices

const mockAd: Business = {
  id: "ad-1",
  name: "Bohus Fönster & Dörr",
  categoryId: "bygg",
  description: "Sveriges ledande fönsterleverantör nu även i Tanum. Energieffektiva lösningar med 10 års garanti och fritt montage i hela Bohuslän.",
  phone: "020-123 456",
  email: "tanum@bohusfonsterdorr.se",
  website: "www.bohusfonsterdorr.se",
  address: "Riksvägen 44, Tanumshede",
  initials: "BF",
  boosted: true,
  featured: false,
  rating: 4.7,
  reviewCount: 203,
};

type Props = {
  categories: Category[];
  businesses: Business[];
  categoryFilter: string | null;
  search: string;
};

export default function BusinessGrid({ categories, businesses, categoryFilter, search }: Props) {
  const filtered = filterBusinesses(businesses, categories, categoryFilter, search);

  // Sort: boosted first
  const sorted = sortBoostedFirst(filtered);

  // Inject ad cards
  const items: (typeof sorted[0] | { isAd: true; id: string })[] = [];
  sorted.forEach((b, i) => {
    items.push(b);
    if (!categoryFilter && !search && AD_POSITIONS.includes(i + 1)) {
      items.push({ isAd: true, id: `ad-slot-${i}` });
    }
  });

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
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] bg-white border border-[var(--border)] px-3 py-2 rounded-lg card-shadow">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Sorterat: Boost först
        </div>
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
              if ("isAd" in item) {
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BusinessCard business={mockAd} categories={categories} isAd />
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
                >
                  <BusinessCard business={item} categories={categories} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
