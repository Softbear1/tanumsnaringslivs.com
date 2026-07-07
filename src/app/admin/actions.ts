"use server";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/logga-in");
}

export async function toggleActive(id: string, currentlyActive: boolean) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  const { error } = await supabase
    .from("businesses")
    .update({ active: !currentlyActive })
    .eq("id", id)
    .eq("owner_id", user.id);

  // Tidigare slukades felet tyst — RLS-avvisningar såg ut som en död knapp.
  if (error) throw new Error(`Kunde inte ändra status: ${error.message}`);

  revalidatePath("/admin");
}
