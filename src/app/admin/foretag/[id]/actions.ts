"use server";
import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

async function getOwnerClient() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function createAd(businessId: string, formData: FormData) {
  const { supabase, userId } = await getOwnerClient();
  if (!userId) return;

  const { error } = await supabase.from("ads").insert({
    business_id: businessId,
    headline: formData.get("headline") as string,
    body: (formData.get("body") as string) || null,
    cta_label: (formData.get("cta_label") as string) || null,
    cta_url: (formData.get("cta_url") as string) || null,
    category_id: (formData.get("category_id") as string) || null,
    starts_at: (formData.get("starts_at") as string) || null,
    ends_at: (formData.get("ends_at") as string) || null,
    active: true,
  });

  if (!error) revalidatePath(`/admin/foretag/${businessId}`);
}

export async function deleteAd(adId: string, businessId: string) {
  const { supabase } = await getOwnerClient();
  await supabase.from("ads").delete().eq("id", adId);
  revalidatePath(`/admin/foretag/${businessId}`);
}

export async function toggleAd(adId: string, currentlyActive: boolean, businessId: string) {
  const { supabase } = await getOwnerClient();
  await supabase.from("ads").update({ active: !currentlyActive }).eq("id", adId);
  revalidatePath(`/admin/foretag/${businessId}`);
}
