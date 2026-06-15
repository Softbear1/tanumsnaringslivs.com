export const runtime = "edge";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { staticCategories } from "@/lib/data";
import EditForetagClient from "./EditForetagClient";

export default async function EditForetagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!business) notFound();

  const b = {
    id: business.id,
    name: business.name,
    categoryId: business.category_id,
    description: business.description,
    phone: business.phone,
    email: business.email,
    website: business.website ?? undefined,
    address: business.address,
    initials: business.initials,
    boosted: business.boosted,
    featured: business.featured,
    rating: Number(business.rating),
    reviewCount: business.review_count,
  };

  return <EditForetagClient business={b} categories={staticCategories} />;
}
