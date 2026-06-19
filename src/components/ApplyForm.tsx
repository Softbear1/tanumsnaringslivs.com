"use client";
import { useState } from "react";
import { applyToJob } from "@/app/arbetsgivare/actions";
import { CheckCircle2 } from "lucide-react";

type Props = {
  jobId: string;
  applyEmail: string;
};

export default function ApplyForm({ jobId, applyEmail }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await applyToJob(jobId, {
      applicant_name: fd.get("name") as string,
      applicant_email: fd.get("email") as string,
      applicant_phone: (fd.get("phone") as string) || null,
      cover_letter: fd.get("cover_letter") as string,
    });
    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800">Din ansökan är skickad!</p>
          <p className="text-sm text-green-700 mt-0.5">Arbetsgivaren kontaktar dig på den e-post du angav.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Namn *</label>
        <input
          name="name"
          required
          placeholder="Ditt namn"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">E-post *</label>
        <input
          name="email"
          type="email"
          required
          placeholder="din@epost.se"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Telefon</label>
        <input
          name="phone"
          type="tel"
          placeholder="070-000 00 00"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">Personligt brev *</label>
        <textarea
          name="cover_letter"
          required
          rows={5}
          placeholder="Berätta lite om dig själv och varför du söker det här jobbet..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
      >
        {pending ? "Skickar..." : "Skicka ansökan"}
      </button>
      <p className="text-xs text-[var(--muted)] text-center">
        Ansökan skickas till {applyEmail}
      </p>
    </form>
  );
}
