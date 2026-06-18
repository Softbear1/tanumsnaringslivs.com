"use client";
import { useState, useTransition } from "react";
import { Category, Business } from "@/lib/data";
import type { SeasonTheme } from "@/lib/season";
import Hero from "./Hero";
import CategoryChips from "./CategoryChips";
import BusinessGrid from "./BusinessGrid";
import ChatPanel from "./ChatPanel";
import FlashDeals, { type FlashDeal, type FlashTeaser } from "./FlashDeals";
import type { Ad } from "./AdCard";

type Props = {
  categories: Category[];
  businesses: Business[];
  ads: Ad[];
  theme: SeasonTheme;
  flashDeals: FlashDeal[];
  flashTeasers: FlashTeaser[];
  dealsEndAt: string;
};

export default function DirectoryClient({ categories, businesses, ads, theme, flashDeals, flashTeasers, dealsEndAt }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [chatPending, setChatPending] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (v: string) => {
    setInputValue(v);
    startTransition(() => {
      setSearch(v);
      if (v) setCategoryFilter(null);
    });
  };

  const handleCategory = (id: string | null) => {
    setCategoryFilter(id);
    setInputValue("");
    startTransition(() => setSearch(""));
  };

  return (
    <>
      <Hero
        search={inputValue}
        onSearch={handleSearch}
        onStartChat={(msg) => setChatPending(msg)}
        theme={theme}
        businesses={businesses}
        categories={categories}
        ads={ads}
      />
      <FlashDeals deals={flashDeals} teasers={flashTeasers} endsAt={dealsEndAt} />
      <CategoryChips
        categories={categories}
        selected={categoryFilter}
        onSelect={handleCategory}
        featuredIds={theme.categoryIds}
        accentColor={theme.accent}
      />
      <div className={`transition-opacity duration-150 ${isPending ? "opacity-60" : "opacity-100"}`}>
        <BusinessGrid
          categories={categories}
          businesses={businesses}
          ads={ads}
          categoryFilter={categoryFilter}
          search={search}
        />
      </div>

      {chatPending !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setChatPending(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: "min(600px, 85vh)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatPanel
              businesses={businesses}
              categories={categories}
              ads={ads}
              deals={flashDeals}
              initialMessage={chatPending}
              onClose={() => setChatPending(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
