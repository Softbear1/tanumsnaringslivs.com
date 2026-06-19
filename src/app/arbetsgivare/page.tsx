export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Plus, Eye, Users, PenLine, XCircle, CheckCircle2 } from "lucide-react";
import { closeJob, reopenJob } from "./actions";

export default async function ArbetsgivarePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in?next=/arbetsgivare");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("active", true);

  const businessIds = (businesses ?? []).map((b) => b.id);

  const { data: jobs } = businessIds.length
    ? await supabase
        .from("jobs")
        .select("*")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Application counts per job
  const jobIds = (jobs ?? []).map((j) => j.id);
  const { data: appCounts } = jobIds.length
    ? await supabase
        .from("applications")
        .select("job_id")
        .in("job_id", jobIds)
    : { data: [] };

  const countByJob: Record<string, number> = {};
  for (const row of appCounts ?? []) {
    countByJob[row.job_id] = (countByJob[row.job_id] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mina jobbannonser</h1>
            <p className="text-white/70 text-sm mt-1">{user.email}</p>
          </div>
          <Link
            href="/arbetsgivare/annons/ny"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ny annons
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!businesses?.length ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <Briefcase className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-[var(--primary)]">Du har inget anslutet företag ännu</p>
            <p className="text-sm mt-1">Claima ditt företag i katalogen för att börja lägga upp jobb</p>
            <Link href="/" className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium">
              Gå till företagskatalogen →
            </Link>
          </div>
        ) : !jobs?.length ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <Briefcase className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-[var(--primary)]">Inga annonser ännu</p>
            <Link href="/arbetsgivare/annons/ny" className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium">
              Lägg upp din första annons →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs!.map((job) => {
              const biz = businesses?.find((b) => b.id === job.business_id);
              const appCount = countByJob[job.id] ?? 0;
              const isActive = job.status === "active";
              return (
                <div key={job.id} className="bg-white border border-[var(--border)] rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-[var(--primary)] truncate">{job.title}</h2>
                        {isActive ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktiv</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Stängd</span>
                        )}
                      </div>
                      {biz && <p className="text-sm text-[var(--muted)]">{biz.name} · {job.location}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--muted)] shrink-0">
                      <Users className="w-4 h-4" />
                      <span>{appCount}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link
                      href={`/arbetsgivare/annons/${job.id}/ansokningar`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] hover:border-[var(--accent)] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ansökningar ({appCount})
                    </Link>
                    <Link
                      href={`/arbetsgivare/annons/${job.id}`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] hover:border-[var(--accent)] transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Redigera
                    </Link>
                    {isActive ? (
                      <form action={closeJob.bind(null, job.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-red-600 hover:border-red-300 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Stäng
                        </button>
                      </form>
                    ) : (
                      <form action={reopenJob.bind(null, job.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-green-700 hover:border-green-300 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Återöppna
                        </button>
                      </form>
                    )}
                    <Link href={`/sommarjobb/${job.id}`} target="_blank" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      Visa publik
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
