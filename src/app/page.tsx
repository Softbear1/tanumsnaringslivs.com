import { createServerClient } from "@/lib/supabase";
import { staticCategories, staticBusinesses, Category, Business } from "@/lib/data";
import Header from "@/components/Header";
import DirectoryClient from "@/components/DirectoryClient";
import RegisterCTA from "@/components/RegisterCTA";
import Footer from "@/components/Footer";
import { recordPageView, getVisitorCount } from "./actions";

export default async function Home() {
  // Record this page view and get visitor count
  await recordPageView();
  const visitorCount = await getVisitorCount();

  let categories: Category[] = staticCategories;
  let businesses: Business[] = staticBusinesses;

  try {
    const supabase = createServerClient();
    const [catsResult, bizResult] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("businesses").select("*").eq("active", true),
    ]);

    if (catsResult.data && catsResult.data.length > 0) {
      categories = catsResult.data.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        bgColor: c.bg_color,
        sortOrder: c.sort_order,
      }));
    }

    if (bizResult.data && bizResult.data.length > 0) {
      businesses = bizResult.data.map((b) => ({
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
      }));
    }
  } catch {
    // Use static fallback when Supabase isn't configured
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <DirectoryClient
          categories={categories}
          businesses={businesses}
          visitorCount={visitorCount}
        />
        <RegisterCTA />
      </main>
      <Footer />
    </>
  );
}
