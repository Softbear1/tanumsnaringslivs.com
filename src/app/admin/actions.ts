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

  await supabase
    .from("businesses")
    .update({ active: !currentlyActive })
    .eq("id", id)
    .eq("owner_id", user.id);

  revalidatePath("/admin");
}

// Mark a quote request as handled. RLS ensures only an owner of one of the
// linked businesses can do this. Once handled, the customer can leave a review.
export async function markQuoteHandled(quoteId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  await supabase
    .from("quote_requests")
    .update({ status: "handled" })
    .eq("id", quoteId);

  revalidatePath("/admin");
}
