"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import BusinessGrid from "@/components/BusinessGrid";
import RegisterCTA from "@/components/RegisterCTA";
import Footer from "@/components/Footer";

export default function Home() {
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
      <Header />
      <main className="flex-1">
        <Hero search={search} onSearch={handleSearch} />
        <CategoryGrid selected={categoryFilter} onSelect={handleCategory} />
        <BusinessGrid categoryFilter={categoryFilter} search={search} />
        <RegisterCTA />
      </main>
      <Footer />
    </>
  );
}
