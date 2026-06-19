export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { MapPin, Calendar, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import ApplyForm from "@/components/ApplyForm";

const JOB_TYPE_LABELS: Record<string, string> = {
  sommarjobb: "Sommarjobb",
  deltid: "Deltid",
  heltid: "Heltid",
  praktik: "Praktik",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: jobRow } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!jobRow) notFound();

  // Fetch business separately to avoid join type issues
  const { data: biz } = jobRow.business_id
    ? await supabase
        .from("businesses")
        .select("name, postort, website")
        .eq("id", jobRow.business_id)
        .single()
    : { data: null };

  const job = jobRow;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/sommarjobb" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Alla jobb
        </Link>

        <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="bg-[var(--primary)] text-white px-6 py-8">
            <span className="text-xs font-medium uppercase tracking-wider opacity-70 block mb-2">
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
            </span>
            <h1 className="text-2xl font-bold mb-3">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              {biz && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {biz.name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              {job.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(job.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}
                  {job.end_date && ` – ${new Date(job.end_date).toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}`}
                </span>
              )}
            </div>
            {job.salary_range && (
              <p className="mt-3 text-sm text-white/80">Lön: {job.salary_range}</p>
            )}
          </div>

          <div className="px-6 py-8 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--primary)] mb-3">Om jobbet</h2>
              <div className="text-sm text-[var(--primary)] leading-relaxed whitespace-pre-wrap">{job.description}</div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="text-base font-semibold text-[var(--primary)] mb-3">Vi söker dig som</h2>
                <div className="text-sm text-[var(--primary)] leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
              </div>
            )}

            {job.apply_url ? (
              <div className="pt-4 border-t border-[var(--border)]">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors"
                >
                  Ansök via arbetsgivarens sida →
                </a>
              </div>
            ) : (
              <div className="pt-4 border-t border-[var(--border)]">
                <h2 className="text-base font-semibold text-[var(--primary)] mb-4">Ansök nu</h2>
                <ApplyForm jobId={job.id} applyEmail={job.apply_email} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
