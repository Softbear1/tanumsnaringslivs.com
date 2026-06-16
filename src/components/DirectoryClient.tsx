"use client";
import { useState } from "react";
import { Category, Business } from "@/lib/data";
import Hero from "./Hero";
import CategoryGrid from "./CategoryGrid";
import BusinessGrid from "./BusinessGrid";
import type { Ad } from "./AdCard";

type Props = {
  categories: Category[];
  businesses: Business[];
  ads: Ad[];
};

export default function DirectoryClient({ categories, businesses, ads }: Props) {
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
      <Hero search={search} onSearch={handleSearch} />
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
