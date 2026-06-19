export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import JobForm from "@/components/JobForm";
import { staticCategories } from "@/lib/data";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in?next=/arbetsgivare");

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!job) notFound();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, email, postort")
    .eq("owner_id", user.id)
    .eq("active", true);

  if (!businesses?.length) redirect("/arbetsgivare");

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-xl font-bold">Redigera annons</h1>
          <p className="text-white/70 text-sm mt-1">{job.title}</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <JobForm businesses={businesses} categories={staticCategories} job={job} />
      </div>
    </div>
  );
}
