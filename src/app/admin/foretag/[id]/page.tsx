export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
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

  const superAdmin = isSuperAdmin(user);
  // Super-admin läser via admin-klienten så att även företag hen inte äger
  // (t.ex. SCB-importerade utan ägare) går att öppna och redigera.
  const reader = superAdmin ? (createAdminClient() ?? supabase) : supabase;

  const [{ data: business }, { data: categories }, { data: ads }, { data: flashDeals }, { data: jobs }] = await Promise.all([
    reader.from("businesses").select("*").eq("id", id).single(),
    reader.from("categories").select("id, name").order("sort_order"),
    reader.from("ads").select("*").eq("business_id", id).order("created_at", { ascending: false }),
    reader.from("flash_deals").select("*").eq("business_id", id).order("deal_date", { ascending: true }),
    reader.from("jobs").select("*").eq("business_id", id).order("created_at", { ascending: false }),
  ]);

  if (!business || (!superAdmin && business.owner_id !== user.id)) {
    redirect("/admin");
  }

  // Räkna ansökningar per jobb (samma mönster som /arbetsgivare).
  const jobList = jobs ?? [];
  const applicationCounts: Record<string, number> = {};
  if (jobList.length) {
    const { data: apps } = await reader
      .from("applications")
      .select("job_id")
      .in("job_id", jobList.map((j) => j.id));
    for (const a of apps ?? []) applicationCounts[a.job_id] = (applicationCounts[a.job_id] ?? 0) + 1;
  }

  return (
    <EditBusinessClient
      business={business}
      categories={categories ?? []}
      ads={ads ?? []}
      flashDeals={flashDeals ?? []}
      jobs={jobList}
      applicationCounts={applicationCounts}
    />
  );
}
