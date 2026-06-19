"use server";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createJob(data: {
  business_id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  job_type: string;
  category_id?: string;
  salary_range?: string;
  start_date?: string;
  end_date?: string;
  apply_email: string;
  apply_url?: string;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in?next=/arbetsgivare");

  const { error } = await supabase.from("jobs").insert({
    ...data,
    owner_id: user.id,
    requirements: data.requirements || null,
    category_id: data.category_id || null,
    salary_range: data.salary_range || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    apply_url: data.apply_url || null,
    status: "active",
  });

  if (error) return { error: error.message };
  revalidatePath("/arbetsgivare");
  redirect("/arbetsgivare");
}

export async function updateJob(id: string, data: {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  job_type?: string;
  category_id?: string;
  salary_range?: string;
  start_date?: string;
  end_date?: string;
  apply_email?: string;
  apply_url?: string;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  const { error } = await supabase
    .from("jobs")
    .update({
      ...data,
      requirements: data.requirements || null,
      category_id: data.category_id || null,
      salary_range: data.salary_range || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      apply_url: data.apply_url || null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/arbetsgivare");
  redirect("/arbetsgivare");
}

export async function closeJob(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  await supabase
    .from("jobs")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("owner_id", user.id);

  revalidatePath("/arbetsgivare");
}

export async function reopenJob(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  await supabase
    .from("jobs")
    .update({ status: "active" })
    .eq("id", id)
    .eq("owner_id", user.id);

  revalidatePath("/arbetsgivare");
}

export async function applyToJob(
  jobId: string,
  data: {
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    cover_letter: string;
  }
) {
  const admin = createAdminClient();
  if (!admin) return { error: "Tjänsten är inte tillgänglig just nu." };

  const { error } = await admin.from("applications").insert({
    job_id: jobId,
    ...data,
  });

  if (error) return { error: "Något gick fel. Försök igen." };
  return { ok: true };
}
