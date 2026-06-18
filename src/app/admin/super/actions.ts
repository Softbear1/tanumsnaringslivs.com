"use server";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

// Full field-update used by the super-admin edit view. Lets Elias edit any
// company regardless of ägare (admin-klienten kringgår RLS).
export async function adminUpdateBusiness(
  id: string,
  data: {
    name: string;
    category_id: string;
    description: string;
    phone: string;
    email: string;
    website: string | null;
    address: string;
    initials: string;
    logo_url: string | null;
  },
) {
  const admin = await requireSuperAdmin();
  const { error } = await admin.from("businesses").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/super");
  revalidatePath(`/admin/foretag/${id}`);
  revalidatePath(`/foretag/${id}`);
}

export async function adminCreateAd(data: {
  business_id: string;
  headline: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  category_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
}) {
  const admin = await requireSuperAdmin();
  const { error } = await admin.from("ads").insert({ ...data, active: true });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/foretag/${data.business_id}`);
}

export async function adminCreateDeal(data: {
  business_id: string;
  headline: string;
  description: string | null;
  category_id: string | null;
  deal_date: string;
  post_to_fb: boolean;
}) {
  const admin = await requireSuperAdmin();
  const { error } = await admin.from("flash_deals").insert({ ...data, active: true });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/foretag/${data.business_id}`);
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
