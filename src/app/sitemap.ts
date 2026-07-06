import type { MetadataRoute } from "next";
import { staticCategories, staticBusinesses } from "@/lib/data";
import { createStaticClient } from "@/lib/supabase-static";

const BASE = "https://tanumsnaringsliv.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let businessIds: string[] = staticBusinesses.map((b) => b.id);
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("businesses").select("id").eq("active", true);
    if (data && data.length > 0) businessIds = data.map((b) => b.id);
  } catch {
    // static fallback
  }

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/sommarjobb`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/blixterbjudanden`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/spel`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/kom-igang`, changeFrequency: "monthly", priority: 0.7 },
    ...staticCategories.map((c) => ({
      url: `${BASE}/hitta/${c.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...businessIds.map((id) => ({
      url: `${BASE}/foretag/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
