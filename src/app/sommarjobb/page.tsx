"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, Clock, ArrowLeft, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobAlertSignup from "@/components/JobAlertSignup";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import type { Database } from "@/lib/supabase";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

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

// ── Job Detail View ──────────────────────────────────────────────────────────

function JobDetail({ id }: { id: string }) {
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
        if (!data) { window.location.href = "/sommarjobb"; return; }
        setJob(data);
        if (data.business_id) {
          const { data: biz } = await supabase.from("businesses").select("name").eq("id", data.business_id).single();
          if (biz) setBusinessName(biz.name);
        }
        setLoading(false);
      });
  }, [id]);

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

  if (loading) return <Spinner />;

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
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
                <div className="flex items-start gap-3 bg-[var(--success-bg)] border border-[var(--success-border)] rounded-xl px-5 py-4">
                  <div>
                    <p className="font-medium text-[var(--success)]">Din ansökan är skickad!</p>
                    <p className="text-sm text-[var(--success)] opacity-80 mt-0.5">Arbetsgivaren kontaktar dig på {email}.</p>
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
                    {applyError && <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] border border-[var(--error-border)] rounded-lg px-3 py-2">{applyError}</p>}
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
      <Footer />
    </div>
  );
}

// ── Job Board ────────────────────────────────────────────────────────────────

function JobBoard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect /sommarjobb/<id> served via rewrite
  const match = pathname.match(/^\/sommarjobb\/(.+)$/);
  if (match) return <JobDetail id={match[1]} />;

  const ort = searchParams.get("ort") ?? "";
  const typ = searchParams.get("typ") ?? "";
  const q = searchParams.get("q") ?? "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function load() {
      let query = supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (ort) query = query.eq("location", ort);
      if (typ) query = query.eq("job_type", typ);
      if (q) query = query.ilike("title", `%${q}%`);

      const { data } = await query;
      setJobs(data ?? []);

      const { data: all } = await supabase.from("jobs").select("location").eq("status", "active");
      setLocations([...new Set((all ?? []).map((j) => j.location))].sort());
      setLoading(false);
    }

    load();
  }, [ort, typ, q]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
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
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          <input
            name="q"
            defaultValue={q}
            placeholder="Sök jobb..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <select name="ort" defaultValue={ort} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none">
            <option value="">Alla orter</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select name="typ" defaultValue={typ} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none">
            <option value="">Alla typer</option>
            {Object.entries(JOB_TYPE_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors">Sök</button>
          {(ort || typ || q) && (
            <a href="/sommarjobb" className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Rensa</a>
          )}
        </form>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white border border-[var(--border)] rounded-xl p-5 h-24 animate-pulse" />)}
          </div>
        ) : !jobs.length ? (
          <EmptyState
            icon={<Briefcase className="w-12 h-12" />}
            title="Inga jobb just nu"
            subtitle="Kom tillbaka snart — arbetsgivare lägger upp annonser löpande"
            action={{ label: "Är du arbetsgivare? Lägg upp ett jobb", href: "/arbetsgivare" }}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
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
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      {job.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(job.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                          {job.end_date && ` – ${new Date(job.end_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`}
                        </span>
                      )}
                      {job.salary_range && <span>{job.salary_range}</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${JOB_TYPE_COLORS[job.job_type] ?? "bg-gray-100 text-gray-700"}`}>
                    {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Clock className="w-3 h-3" />
                  Publicerad {new Date(job.created_at).toLocaleDateString("sv-SE")}
                </div>
              </Link>
            ))}
            <div className="mt-8 text-center">
              <a href="/arbetsgivare" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                <Briefcase className="w-4 h-4" />Arbetsgivare? Lägg upp ett jobb gratis →
              </a>
            </div>
          </div>
        )}
      </div>
      <JobAlertSignup />
      <Footer />
    </div>
  );
}

export default function SommarjobbPage() {
  return <Suspense><JobBoard /></Suspense>;
}
