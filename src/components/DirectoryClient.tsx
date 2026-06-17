"use client";
import { useState } from "react";
import { Category, Business } from "@/lib/data";
import type { SeasonTheme } from "@/lib/season";
import Hero from "./Hero";
import CategoryChips from "./CategoryChips";
import BusinessGrid from "./BusinessGrid";
import type { Ad } from "./AdCard";

type Props = {
  categories: Category[];
  businesses: Business[];
  ads: Ad[];
  theme: SeasonTheme;
};

export default function DirectoryClient({ categories, businesses, ads, theme }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleSearch = (v: string) => {
    setSearch(v);
    if (v) setCategoryFilter(null);
  };

  const handleCategory = (id: string | null) => {
    setCategoryFilter(id);
    setSearch("");
  };

  return (
    <>
      <Hero
        search={search}
        onSearch={handleSearch}
        theme={theme}
        businesses={businesses}
        categories={categories}
        ads={ads}
      />
      <CategoryChips
        categories={categories}
        selected={categoryFilter}
        onSelect={handleCategory}
        featuredIds={theme.categoryIds}
        accentColor={theme.accent}
      />
      <BusinessGrid
        categories={categories}
        businesses={businesses}
        ads={ads}
        categoryFilter={categoryFilter}
        search={search}
      />
    </>
  );
}
