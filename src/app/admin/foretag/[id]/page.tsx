export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditBusinessClient from "./EditBusinessClient";
import { adminUpdateBusiness, adminDeleteBusiness, adminCreateAd, adminToggleAd, adminDeleteAd, adminCreateDeal, adminToggleDeal, adminDeleteDeal } from "../../super/actions";

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

  const superAdmin = isSuperAdmin(user);
  // Super-admin läser via admin-klienten så att även företag hen inte äger
  // (t.ex. SCB-importerade utan ägare) går att öppna och redigera.
  const reader = superAdmin ? (createAdminClient() ?? supabase) : supabase;

  const [{ data: business }, { data: categories }, { data: ads }, { data: flashDeals }] = await Promise.all([
    reader.from("businesses").select("*").eq("id", id).single(),
    reader.from("categories").select("id, name").order("sort_order"),
    reader.from("ads").select("*").eq("business_id", id).order("created_at", { ascending: false }),
    reader.from("flash_deals").select("*").eq("business_id", id).order("deal_date", { ascending: true }),
  ]);

  if (!business || (!superAdmin && business.owner_id !== user.id)) {
    redirect("/admin");
  }

  return (
    <EditBusinessClient
      business={business}
      categories={categories ?? []}
      ads={ads ?? []}
      flashDeals={flashDeals ?? []}
      adminActions={superAdmin ? {
        updateBusiness: adminUpdateBusiness,
        deleteBusiness: adminDeleteBusiness,
        createAd: adminCreateAd,
        toggleAd: adminToggleAd,
        deleteAd: adminDeleteAd,
        createDeal: adminCreateDeal,
        toggleDeal: adminToggleDeal,
        deleteDeal: adminDeleteDeal,
      } : undefined}
    />
  );
}
