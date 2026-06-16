"use client";
import { useState } from "react";
import { Category, Business } from "@/lib/data";
import type { SeasonTheme } from "@/lib/season";
import Hero from "./Hero";
import SeasonSpotlight from "./SeasonSpotlight";
import CategoryGrid from "./CategoryGrid";
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
      <Hero search={search} onSearch={handleSearch} theme={theme} />
      <SeasonSpotlight theme={theme} categories={categories} onSelect={handleCategory} />
      <CategoryGrid
        categories={categories}
        businesses={businesses}
        selected={categoryFilter}
        onSelect={handleCategory}
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
