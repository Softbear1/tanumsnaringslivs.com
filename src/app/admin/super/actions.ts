"use server";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Verifierar att den inloggade användaren är super-admin och returnerar en
// service-role-klient (kringgår RLS). Kastar/omdirigerar annars — så att inga
// globala mutationer kan göras av en vanlig ägare.
async function requireSuperAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");
  if (!isSuperAdmin(user)) redirect("/admin");
  const admin = createAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY saknas");
  return admin;
}

export async function adminToggleBusiness(id: string, active: boolean) {
  const admin = await requireSuperAdmin();
  await admin.from("businesses").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/super");
}

export async function adminDeleteBusiness(id: string) {
  const admin = await requireSuperAdmin();
  await admin.from("businesses").delete().eq("id", id);
  revalidatePath("/admin/super");
}

export async function adminToggleDeal(id: string, active: boolean) {
  const admin = await requireSuperAdmin();
  await admin.from("flash_deals").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/super");
}

export async function adminDeleteDeal(id: string) {
  const admin = await requireSuperAdmin();
  await admin.from("flash_deals").delete().eq("id", id);
  revalidatePath("/admin/super");
}

export async function adminToggleAd(id: string, active: boolean) {
  const admin = await requireSuperAdmin();
  await admin.from("ads").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/super");
}

export async function adminDeleteAd(id: string) {
  const admin = await requireSuperAdmin();
  await admin.from("ads").delete().eq("id", id);
  revalidatePath("/admin/super");
}

export async function adminUpdateQuoteStatus(id: string, status: string) {
  const admin = await requireSuperAdmin();
  await admin.from("quote_requests").update({ status }).eq("id", id);
  revalidatePath("/admin/super");
}
