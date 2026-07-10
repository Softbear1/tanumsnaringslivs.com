// Dynamisk brandad delningsbild för ett företag (1200×630). Används både som
// OG-bild på företagssidan och som bilden i den dagliga Facebook-presentationen
// (/api/social/post-daily pekar Facebook hit — FB hämtar PNG:en via URL).

export const runtime = "edge";

import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { staticCategories, getCategory } from "@/lib/data";
import { renderPresentationImage, type FontSpec } from "@/lib/socialPosts/presentationImage";

async function loadFont(request: NextRequest, file: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(`/fonts/${file}`, request.url));
  if (!res.ok) throw new Error(`Kunde inte ladda font ${file}`);
  return res.arrayBuffer();
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerClient();
  // Anon-klienten respekterar RLS: bara aktiva företag är läsbara publikt.
  const { data: biz } = await supabase
    .from("businesses")
    .select("name, description, category_id, postort, initials")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (!biz) {
    return new Response("Företaget hittades inte", { status: 404 });
  }

  const [regular, bold] = await Promise.all([
    loadFont(request, "Inter-400.woff"),
    loadFont(request, "Inter-700.woff"),
  ]);
  const fonts: FontSpec[] = [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
  ];

  const categoryName = getCategory(staticCategories, biz.category_id)?.name ?? biz.category_id;

  return renderPresentationImage(
    {
      name: biz.name,
      description: biz.description,
      categoryName,
      postort: biz.postort,
      initials: biz.initials,
    },
    fonts,
  );
}
