"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { MapPin, Calendar, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/supabase";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const JOB_TYPE_LABELS: Record<string, string> = {
  sommarjobb: "Sommarjobb",
  deltid: "Deltid",
  heltid: "Heltid",
  praktik: "Praktik",
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [letter, setLetter] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from("jobs").select("*").eq("id", id).eq("status", "active").single()
      .then(async ({ data }) => {
        if (!data) { router.replace("/sommarjobb"); return; }
        setJob(data);
        if (data.business_id) {
          const { data: biz } = await supabase.from("businesses").select("name").eq("id", data.business_id).single();
          if (biz) setBusinessName(biz.name);
        }
        setLoading(false);
      });
  }, [id, router]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;
    setSending(true);
    setApplyError(null);
    const supabase = createBrowserClient();
    const { error } = await supabase.from("applications").insert({
      job_id: job.id,
      applicant_name: name,
      applicant_email: email,
      applicant_phone: phone || null,
      cover_letter: letter,
    });
    setSending(false);
    if (error) { setApplyError("Något gick fel. Försök igen."); return; }
    setSent(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/sommarjobb" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />Alla jobb
        </Link>

        <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="bg-[var(--primary)] text-white px-6 py-8">
            <span className="text-xs font-medium uppercase tracking-wider opacity-70 block mb-2">
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
            </span>
            <h1 className="text-2xl font-bold mb-3">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              {businessName && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{businessName}</span>}
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
              {job.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(job.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}
                  {job.end_date && ` – ${new Date(job.end_date).toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}`}
                </span>
              )}
            </div>
            {job.salary_range && <p className="mt-3 text-sm text-white/80">Lön: {job.salary_range}</p>}
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

            <div className="pt-4 border-t border-[var(--border)]">
              {job.apply_url ? (
                <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors">
                  Ansök via arbetsgivarens sida →
                </a>
              ) : sent ? (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                  <div>
                    <p className="font-medium text-green-800">Din ansökan är skickad!</p>
                    <p className="text-sm text-green-700 mt-0.5">Arbetsgivaren kontaktar dig på {email}.</p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-base font-semibold text-[var(--primary)] mb-4">Ansök nu</h2>
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Namn *</label>
                      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ditt namn"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">E-post *</label>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="din@epost.se"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Telefon</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="070-000 00 00"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Personligt brev *</label>
                      <textarea required rows={5} value={letter} onChange={(e) => setLetter(e.target.value)}
                        placeholder="Berätta lite om dig själv och varför du söker det här jobbet..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none" />
                    </div>
                    {applyError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{applyError}</p>}
                    <button type="submit" disabled={sending}
                      className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50">
                      {sending ? "Skickar..." : "Skicka ansökan"}
                    </button>
                    <p className="text-xs text-[var(--muted)] text-center">Ansökan skickas till {job.apply_email}</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
