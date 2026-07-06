import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { staticCategories, staticBusinesses, type Business } from "@/lib/data";
import { categoryIntros } from "@/lib/categoryTexts";
import { createStaticClient } from "@/lib/supabase-static";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ kategori: string }>;
}

export function generateStaticParams() {
  return staticCategories.map((c) => ({ kategori: c.id }));
}

async function getCategoryBusinesses(categoryId: string): Promise<Business[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("active", true)
      .eq("category_id", categoryId)
      .order("claimed", { ascending: false })
      .order("name", { ascending: true });
    if (data && data.length > 0) {
      return data.map((b) => ({
        id: b.id,
        name: b.name,
        categoryId: b.category_id,
        description: b.description,
        phone: b.phone,
        email: b.email,
        website: b.website ?? undefined,
        address: b.address,
        initials: b.initials,
        boosted: b.boosted,
        featured: b.featured,
        rating: Number(b.rating),
        reviewCount: b.review_count,
        logoUrl: b.logo_url ?? undefined,
        claimed: b.claimed ?? true,
      }));
    }
  } catch {
    // fall through to static seed data
  }
  return staticBusinesses.filter((b) => b.categoryId === categoryId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const cat = staticCategories.find((c) => c.id === kategori);
  if (!cat) return { title: "Kategorin hittades inte – Tanums Näringsliv" };

  const title = `${cat.name} i Tanum – lokala företag | Tanums Näringsliv`;
  const description =
    categoryIntros[cat.id]?.meta ??
    `Hitta företag inom ${cat.name.toLowerCase()} i Tanums kommun — Tanumshede, Grebbestad, Fjällbacka, Hamburgsund m.fl. Kontaktuppgifter, webbplatser och erbjudanden.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "sv_SE" },
    alternates: { canonical: `https://tanumsnaringsliv.com/hitta/${cat.id}` },
  };
}

export default async function KategoriPage({ params }: PageProps) {
  const { kategori } = await params;
  const cat = staticCategories.find((c) => c.id === kategori);
  if (!cat) notFound();

  const businesses = await getCategoryBusinesses(cat.id);
  const categories = staticCategories;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.name} i Tanum`,
    numberOfItems: businesses.length,
    itemListElement: businesses.slice(0, 25).map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://tanumsnaringsliv.com/foretag/${b.id}`,
      name: b.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Alla kategorier
          </Link>

          <div className="mb-8">
            <span
              className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3"
              style={{ backgroundColor: cat.bgColor, color: cat.color }}
            >
              {cat.name}
            </span>
            <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">
              {cat.name} i Tanum
            </h1>
            <p className="text-[var(--primary)] leading-relaxed max-w-2xl mb-2">
              {categoryIntros[cat.id]?.intro ??
                `${businesses.length} företag inom ${cat.name.toLowerCase()} i Tanums kommun.`}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {businesses.length} företag i katalogen — klicka för kontaktuppgifter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} categories={categories} />
            ))}
          </div>

          {/* Länkar till övriga kategorier — internlänkning för SEO */}
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--primary)] mb-3">
              Fler kategorier i Tanum
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.id !== cat.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/hitta/${c.id}`}
                    className="text-sm px-3 py-1.5 rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--muted)] transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
