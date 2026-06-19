"use client";
import { useState } from "react";
import { createJob, updateJob } from "@/app/arbetsgivare/actions";
import { Sparkles, Loader2 } from "lucide-react";
import type { Category } from "@/lib/data";
import Link from "next/link";

type Business = { id: string; name: string; email: string; postort: string | null };

type JobData = {
  id?: string;
  business_id?: string | null;
  title?: string;
  description?: string;
  requirements?: string | null;
  location?: string;
  job_type?: string;
  category_id?: string | null;
  salary_range?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  apply_email?: string;
  apply_url?: string | null;
};

type Props = {
  businesses: Business[];
  categories: Category[];
  job?: JobData;
};

const JOB_TYPES = [
  { value: "sommarjobb", label: "Sommarjobb" },
  { value: "deltid", label: "Deltid" },
  { value: "heltid", label: "Heltid" },
  { value: "praktik", label: "Praktik" },
];

export default function JobForm({ businesses, categories, job }: Props) {
  const isEdit = !!job?.id;
  const defaultBiz = businesses.find((b) => b.id === job?.business_id) ?? businesses[0];

  const [selectedBizId, setSelectedBizId] = useState(defaultBiz?.id ?? "");
  const [title, setTitle] = useState(job?.title ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [requirements, setRequirements] = useState(job?.requirements ?? "");
  const [location, setLocation] = useState(job?.location ?? defaultBiz?.postort ?? "");
  const [jobType, setJobType] = useState(job?.job_type ?? "sommarjobb");
  const [categoryId, setCategoryId] = useState(job?.category_id ?? "");
  const [salaryRange, setSalaryRange] = useState(job?.salary_range ?? "");
  const [startDate, setStartDate] = useState(job?.start_date ?? "");
  const [endDate, setEndDate] = useState(job?.end_date ?? "");
  const [applyEmail, setApplyEmail] = useState(job?.apply_email ?? defaultBiz?.email ?? "");
  const [applyUrl, setApplyUrl] = useState(job?.apply_url ?? "");

  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedBiz = businesses.find((b) => b.id === selectedBizId);

  async function generateWithAI() {
    if (!aiDescription.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/skriv-annons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aiDescription,
          businessName: selectedBiz?.name,
          location,
        }),
      });
      if (!res.ok) throw new Error("Något gick fel");
      const data = await res.json() as {
        title?: string;
        description?: string;
        requirements?: string;
        salary_range?: string;
        job_type?: string;
      };
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
    setPending(true);
    setFormError(null);

    const data = {
      business_id: selectedBizId,
      title,
      description,
      requirements,
      location,
      job_type: jobType,
      category_id: categoryId,
      salary_range: salaryRange,
      start_date: startDate,
      end_date: endDate,
      apply_email: applyEmail,
      apply_url: applyUrl,
    };

    const result = isEdit
      ? await updateJob(job!.id!, data)
      : await createJob(data);

    if (result?.error) {
      setFormError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI generator */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Skriv annons med AI</span>
          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Frivilligt</span>
        </div>
        <textarea
          value={aiDescription}
          onChange={(e) => setAiDescription(e.target.value)}
          rows={2}
          placeholder="Beskriv jobbet i en mening, t.ex. &quot;Vi söker en glad servitör för sommaren på vår restaurang i Fjällbacka&quot;"
          className="w-full px-3.5 py-2.5 rounded-lg border border-amber-200 text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
        />
        {aiError && <p className="text-xs text-red-600 mt-1">{aiError}</p>}
        <button
          type="button"
          onClick={generateWithAI}
          disabled={aiLoading || !aiDescription.trim()}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {aiLoading ? "Genererar..." : "Fyll i fälten åt mig"}
        </button>
      </div>

      {/* Business select */}
      {businesses.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Företag *</label>
          <select
            value={selectedBizId}
            onChange={(e) => {
              setSelectedBizId(e.target.value);
              const biz = businesses.find((b) => b.id === e.target.value);
              if (biz) {
                if (!location) setLocation(biz.postort ?? "");
                if (!applyEmail) setApplyEmail(biz.email);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Jobbtitel *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="t.ex. Servitör, Lagerarbetare, Sommarvikarie"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Ort *</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="t.ex. Fjällbacka"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Typ *</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Beskrivning *</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Beskriv jobbet, arbetsplatsen och vad tjänsten innebär..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Krav / Vi söker</label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          placeholder="t.ex. Körkort B, Erfarenhet av kundservice, Studerar ekonomi..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Startdatum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Slutdatum</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Lön / Ersättning</label>
        <input
          value={salaryRange}
          onChange={(e) => setSalaryRange(e.target.value)}
          placeholder="t.ex. Enligt kollektivavtal, ca 130 kr/h"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Kategori</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">Välj kategori (valfritt)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">E-post för ansökningar *</label>
        <input
          required
          type="email"
          value={applyEmail}
          onChange={(e) => setApplyEmail(e.target.value)}
          placeholder="jobb@dittforetag.se"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <p className="text-xs text-[var(--muted)] mt-1">Ansökningar skickas hit. Visas inte publikt.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Extern ansökningslänk</label>
        <input
          type="url"
          value={applyUrl}
          onChange={(e) => setApplyUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <p className="text-xs text-[var(--muted)] mt-1">Om satt skickas sökanden dit istället för in-app-formulär.</p>
      </div>

      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Publicerar..." : isEdit ? "Spara ändringar" : "Publicera annons"}
        </button>
        <Link
          href="/arbetsgivare"
          className="px-5 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        >
          Avbryt
        </Link>
      </div>
    </form>
  );
}
