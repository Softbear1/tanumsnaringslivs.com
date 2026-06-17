export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import EditBusinessClient from "./EditBusinessClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditForetagPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/logga-in");
  }

  const [{ data: business }, { data: categories }, { data: ads }, { data: flashDeals }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("ads").select("*").eq("business_id", id).order("created_at", { ascending: false }),
    supabase.from("flash_deals").select("*").eq("business_id", id).order("deal_date", { ascending: true }),
  ]);

  if (!business || business.owner_id !== user.id) {
    redirect("/admin");
  }

  return (
    <EditBusinessClient
      business={business}
      categories={categories ?? []}
      ads={ads ?? []}
      flashDeals={flashDeals ?? []}
    />
  );
}
