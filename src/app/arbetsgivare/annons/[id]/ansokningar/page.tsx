export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Phone, Calendar } from "lucide-react";

export default async function AnsokningarPage({
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
    .select("id, title, owner_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!job) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/arbetsgivare" className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Mina annonser
          </Link>
          <h1 className="text-xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
            <Users className="w-4 h-4" />
            {applications?.length ?? 0} ansökningar
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {!applications?.length ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <Users className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-[var(--primary)]">Inga ansökningar ännu</p>
            <p className="text-sm mt-1">Ansökningar visas här så fort de skickas in</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h2 className="font-semibold text-[var(--primary)]">{app.applicant_name}</h2>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-[var(--muted)]">
                      <a href={`mailto:${app.applicant_email}`} className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                        {app.applicant_email}
                      </a>
                      {app.applicant_phone && (
                        <a href={`tel:${app.applicant_phone}`} className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          {app.applicant_phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--muted)] shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(app.created_at).toLocaleDateString("sv-SE")}
                  </div>
                </div>
                <div className="bg-[var(--bg)] rounded-lg px-4 py-3 text-sm text-[var(--primary)] leading-relaxed whitespace-pre-wrap">
                  {app.cover_letter}
                </div>
                <div className="mt-3">
                  <a
                    href={`mailto:${app.applicant_email}?subject=Re: Din ansökan – ${job.title}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Svara via e-post →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
