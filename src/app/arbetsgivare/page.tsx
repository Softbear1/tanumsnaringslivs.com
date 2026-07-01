"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { Briefcase, Plus, Eye, Users, PenLine, XCircle, CheckCircle2, ArrowLeft, Sparkles, Loader2, Mail, Phone, Calendar } from "lucide-react";
import { staticCategories } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import type { Database } from "@/lib/supabase";

type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Business = { id: string; name: string; email: string; postort: string | null };

const JOB_TYPES = [
  { value: "sommarjobb", label: "Sommarjobb" },
  { value: "deltid", label: "Deltid" },
  { value: "heltid", label: "Heltid" },
  { value: "praktik", label: "Praktik" },
];

// ── Job Form (new / edit) ────────────────────────────────────────────────────

function JobForm({ annonsId }: { annonsId: string }) {
  const router = useRouter();
  const isNew = annonsId === "new";

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  const [bizId, setBizId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("sommarjobb");
  const [categoryId, setCategoryId] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/admin/logga-in?next=/arbetsgivare"; return; }
      setUserId(user.id);

      const { data: bizData } = await supabase.from("businesses").select("id, name, email, postort").eq("owner_id", user.id).eq("active", true);
      const biz = bizData ?? [];
      setBusinesses(biz);

      if (!isNew) {
        const { data: job } = await supabase.from("jobs").select("*").eq("id", annonsId).eq("owner_id", user.id).single();
        if (!job) { router.replace("/arbetsgivare"); return; }
        setBizId(job.business_id ?? "");
        setTitle(job.title);
        setDescription(job.description);
        setRequirements(job.requirements ?? "");
        setLocation(job.location);
        setJobType(job.job_type);
        setCategoryId(job.category_id ?? "");
        setSalaryRange(job.salary_range ?? "");
        setStartDate(job.start_date ?? "");
        setEndDate(job.end_date ?? "");
        setApplyEmail(job.apply_email);
        setApplyUrl(job.apply_url ?? "");

        const { data: apps } = await supabase.from("applications").select("*").eq("job_id", annonsId).order("created_at", { ascending: false });
        setApplications(apps ?? []);
      } else if (biz.length) {
        setBizId(biz[0].id);
        setLocation(biz[0].postort ?? "");
        setApplyEmail(biz[0].email);
      }

      setLoading(false);
    }
    load();
  }, [annonsId, isNew, router]);

  async function generateWithAI() {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const biz = businesses.find((b) => b.id === bizId);
      const res = await fetch("/api/skriv-annons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDesc, businessName: biz?.name, location }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { title?: string; description?: string; requirements?: string; salary_range?: string; job_type?: string };
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.requirements) setRequirements(data.requirements);
      if (data.salary_range) setSalaryRange(data.salary_range);
      if (data.job_type && JOB_TYPES.some((t) => t.value === data.job_type)) setJobType(data.job_type!);
    } catch {
      setAiError("Kunde inte generera annons. Försök igen.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createBrowserClient();
    const payload = {
      business_id: bizId || null,
      owner_id: userId,
      title, description,
      requirements: requirements || null,
      location, job_type: jobType,
      category_id: categoryId || null,
      salary_range: salaryRange || null,
      start_date: startDate || null,
      end_date: endDate || null,
      apply_email: applyEmail,
      apply_url: applyUrl || null,
      status: "active" as const,
    };

    if (isNew) {
      const { error: err } = await supabase.from("jobs").insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("jobs").update(payload).eq("id", annonsId).eq("owner_id", userId);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    router.push("/arbetsgivare");
  }

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <div className="bg-[var(--primary)] text-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link href="/arbetsgivare" className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />Mina annonser
          </Link>
          <h1 className="text-xl font-bold">{isNew ? "Ny jobbannons" : "Redigera annons"}</h1>
          {isNew && <p className="text-white/70 text-sm mt-1">Gratis — publiceras direkt</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Skriv annons med AI</span>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Frivilligt</span>
            </div>
            <textarea value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} rows={2}
              placeholder='Beskriv jobbet i en mening, t.ex. "Vi söker en glad servitör för sommaren på vår restaurang i Fjällbacka"'
              className="w-full px-3.5 py-2.5 rounded-lg border border-amber-200 text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none" />
            {aiError && <p className="text-xs text-[var(--error)] mt-1">{aiError}</p>}
            <button type="button" onClick={generateWithAI} disabled={aiLoading || !aiDesc.trim()}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
              {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {aiLoading ? "Genererar..." : "Fyll i fälten åt mig"}
            </button>
          </div>

          {businesses.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Företag *</label>
              <select value={bizId} onChange={(e) => {
                setBizId(e.target.value);
                const b = businesses.find((x) => x.id === e.target.value);
                if (b) { if (!location) setLocation(b.postort ?? ""); if (!applyEmail) setApplyEmail(b.email); }
              }} className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Jobbtitel *</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="t.ex. Servitör, Lagerarbetare"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Ort *</label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="t.ex. Fjällbacka"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Typ *</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Beskrivning *</label>
            <textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv jobbet, arbetsplatsen och vad tjänsten innebär..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Krav / Vi söker</label>
            <textarea rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)}
              placeholder="t.ex. Körkort B, Erfarenhet av kundservice..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Startdatum</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Slutdatum</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Lön / Ersättning</label>
            <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="t.ex. Enligt kollektivavtal, ca 130 kr/h"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Kategori</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
              <option value="">Välj kategori (valfritt)</option>
              {staticCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">E-post för ansökningar *</label>
            <input required type="email" value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)} placeholder="jobb@dittforetag.se"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            <p className="text-xs text-[var(--muted)] mt-1">Visas inte publikt.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Extern ansökningslänk</label>
            <input type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            <p className="text-xs text-[var(--muted)] mt-1">Om satt skickas sökanden dit istället för in-app-formulär.</p>
          </div>

          {error && <p className="text-sm text-[var(--error)] bg-[var(--error-bg)] border border-[var(--error-border)] rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50">
              {saving ? "Publicerar..." : isNew ? "Publicera annons" : "Spara ändringar"}
            </button>
            <Link href="/arbetsgivare" className="px-5 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              Avbryt
            </Link>
          </div>
        </form>

        {!isNew && (
          <div>
            <h2 className="text-base font-semibold text-[var(--primary)] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />Ansökningar ({applications.length})
            </h2>
            {!applications.length ? (
              <div className="bg-white border border-[var(--border)] rounded-xl py-4">
                <EmptyState icon={<Users className="w-8 h-8" />} title="Inga ansökningar ännu" />
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white border border-[var(--border)] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-[var(--primary)]">{app.applicant_name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-[var(--muted)]">
                          <a href={`mailto:${app.applicant_email}`} className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                            <Mail className="w-3.5 h-3.5" />{app.applicant_email}
                          </a>
                          {app.applicant_phone && (
                            <a href={`tel:${app.applicant_phone}`} className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                              <Phone className="w-3.5 h-3.5" />{app.applicant_phone}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--muted)] shrink-0">
                        <Calendar className="w-3.5 h-3.5" />{new Date(app.created_at).toLocaleDateString("sv-SE")}
                      </div>
                    </div>
                    <div className="bg-[var(--bg)] rounded-lg px-4 py-3 text-sm text-[var(--primary)] leading-relaxed whitespace-pre-wrap">{app.cover_letter}</div>
                    <div className="mt-3">
                      <a href={`mailto:${app.applicant_email}?subject=Re: Din ansökan`} className="text-sm text-[var(--accent)] hover:underline">Svara via e-post →</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ── Employer Dashboard ───────────────────────────────────────────────────────

export default function ArbetsgivarePage() {
  const pathname = usePathname();

  // Detect /arbetsgivare/annons/<id> served via rewrite
  const match = pathname.match(/^\/arbetsgivare\/annons\/(.+)$/);
  if (match) return <JobForm annonsId={match[1]} />;

  return <Dashboard />;
}

function Dashboard() {
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countByJob, setCountByJob] = useState<Record<string, number>>({});
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/admin/logga-in?next=/arbetsgivare"; return; }
      setUserEmail(user.email ?? "");

      const { data: bizData } = await supabase.from("businesses").select("id, name").eq("owner_id", user.id).eq("active", true);
      const biz = bizData ?? [];
      setBusinesses(biz);

      if (!biz.length) { setLoading(false); return; }
      const ids = biz.map((b) => b.id);
      const { data: jobData } = await supabase.from("jobs").select("*").in("business_id", ids).order("created_at", { ascending: false });
      const jobList = jobData ?? [];
      setJobs(jobList);

      if (jobList.length) {
        const jobIds = jobList.map((j) => j.id);
        const { data: apps } = await supabase.from("applications").select("job_id").in("job_id", jobIds);
        const counts: Record<string, number> = {};
        for (const a of apps ?? []) counts[a.job_id] = (counts[a.job_id] ?? 0) + 1;
        setCountByJob(counts);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleClose(jobId: string) {
    const supabase = createBrowserClient();
    await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId);
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "closed" } : j));
  }

  async function handleReopen(jobId: string) {
    const supabase = createBrowserClient();
    await supabase.from("jobs").update({ status: "active" }).eq("id", jobId);
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "active" } : j));
  }

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <div className="bg-[var(--primary)] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-2">
              ← Tillbaka till din företagssida
            </Link>
            <h1 className="text-2xl font-bold">Mina jobbannonser</h1>
            <p className="text-white/70 text-sm mt-1">{userEmail}</p>
          </div>
          <Link href="/arbetsgivare/annons/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Ny annons
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!businesses.length ? (
          <EmptyState
            icon={<Briefcase className="w-10 h-10" />}
            title="Du har inget anslutet företag ännu"
            subtitle="Claima ditt företag i katalogen för att börja lägga upp jobb"
            action={{ label: "Gå till företagskatalogen", href: "/" }}
          />
        ) : !jobs.length ? (
          <EmptyState
            icon={<Briefcase className="w-10 h-10" />}
            title="Inga annonser ännu"
            action={{ label: "Lägg upp din första annons", href: "/arbetsgivare/annons/new" }}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const biz = businesses.find((b) => b.id === job.business_id);
              const appCount = countByJob[job.id] ?? 0;
              const isActive = job.status === "active";
              return (
                <div key={job.id} className="bg-white border border-[var(--border)] rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-[var(--primary)] truncate">{job.title}</h2>
                        {isActive
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktiv</span>
                          : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Stängd</span>}
                      </div>
                      {biz && <p className="text-sm text-[var(--muted)]">{biz.name} · {job.location}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--muted)] shrink-0">
                      <Users className="w-4 h-4" /><span>{appCount}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link href={`/arbetsgivare/annons/${job.id}`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] hover:border-[var(--accent)] transition-colors">
                      <Eye className="w-3.5 h-3.5" />Ansökningar ({appCount}) & Redigera
                    </Link>
                    <Link href={`/sommarjobb/${job.id}`} target="_blank"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] transition-colors">
                      <PenLine className="w-3.5 h-3.5" />Visa publik
                    </Link>
                    {isActive ? (
                      <button onClick={() => handleClose(job.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-red-600 hover:border-red-300 transition-colors">
                        <XCircle className="w-3.5 h-3.5" />Stäng
                      </button>
                    ) : (
                      <button onClick={() => handleReopen(job.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-green-700 hover:border-green-300 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />Återöppna
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
