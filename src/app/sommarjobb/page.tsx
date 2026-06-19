export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, Clock } from "lucide-react";

const JOB_TYPE_LABELS: Record<string, string> = {
  sommarjobb: "Sommarjobb",
  deltid: "Deltid",
  heltid: "Heltid",
  praktik: "Praktik",
};

const JOB_TYPE_COLORS: Record<string, string> = {
  sommarjobb: "bg-amber-100 text-amber-800",
  deltid: "bg-blue-100 text-blue-800",
  heltid: "bg-green-100 text-green-800",
  praktik: "bg-purple-100 text-purple-800",
};

export default async function SommarjobbPage({
  searchParams,
}: {
  searchParams: Promise<{ ort?: string; typ?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (params.ort) query = query.eq("location", params.ort);
  if (params.typ) query = query.eq("job_type", params.typ);
  if (params.q) query = query.ilike("title", `%${params.q}%`);

  const { data: jobs } = await query;

  // Unique locations for filter
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("location")
    .eq("status", "active");
  const locations = [...new Set((allJobs ?? []).map((j) => j.location))].sort();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--primary)] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-6 h-6 opacity-80" />
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">Sommarjobb i Tanum</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Hitta ett sommarjobb</h1>
          <p className="text-white/70">Lokala arbetsgivare på Bohuskusten söker dig</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Sök jobb..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <select
            name="ort"
            defaultValue={params.ort ?? ""}
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none"
          >
            <option value="">Alla orter</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            name="typ"
            defaultValue={params.typ ?? ""}
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none"
          >
            <option value="">Alla typer</option>
            {Object.entries(JOB_TYPE_LABELS).map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            Sök
          </button>
          {(params.ort || params.typ || params.q) && (
            <a href="/sommarjobb" className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              Rensa
            </a>
          )}
        </form>

        {/* Jobs */}
        {!jobs?.length ? (
          <div className="text-center py-20 text-[var(--muted)]">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Inga jobb just nu</p>
            <p className="text-sm mt-1">Kom tillbaka snart — arbetsgivare lägger upp annonser löpande</p>
            <a href="/arbetsgivare/annons/ny" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90">
              Är du arbetsgivare? Lägg upp ett jobb →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              return (
                <Link
                  key={job.id}
                  href={`/sommarjobb/${job.id}`}
                  className="block bg-white border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors text-lg leading-tight mb-1">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        {job.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(job.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                            {job.end_date && ` – ${new Date(job.end_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="text-[var(--muted)]">{job.salary_range}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${JOB_TYPE_COLORS[job.job_type] ?? "bg-gray-100 text-gray-700"}`}>
                        {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-[var(--muted)]">
                    <Clock className="w-3 h-3" />
                    Publicerad {new Date(job.created_at).toLocaleDateString("sv-SE")}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {jobs && jobs.length > 0 && (
          <div className="mt-10 text-center">
            <a
              href="/arbetsgivare/annons/ny"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Arbetsgivare? Lägg upp ett jobb gratis →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
