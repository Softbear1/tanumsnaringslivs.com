"use client";
import { useEffect, useState } from "react";
import { Check, ChevronRight, X, Map } from "lucide-react";

export interface ChecklistState {
  businessId: string;
  hasLogo: boolean;
  hasDescription: boolean;
  hasDeal: boolean;
  hasAd: boolean;
  hasJob: boolean;
}

const DISMISS_KEY = "tn-onboarding-dismissed";

export default function OnboardingChecklist({ state }: { state: ChecklistState }) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash pre-hydration

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const base = `/admin/foretag/${state.businessId}`;
  const steps = [
    {
      done: true,
      label: "Ta över din företagsprofil",
      href: base,
    },
    {
      done: state.hasDescription && state.hasLogo,
      label: "Fyll i beskrivning och ladda upp logga",
      hint: "Profiler med bild får fler besök",
      href: base,
    },
    {
      done: state.hasDeal,
      label: "Skapa ditt första blixterbjudande",
      hint: "Syns på startsidan och postas till Facebook",
      href: `${base}#blixterbjudanden`,
    },
    {
      done: state.hasAd,
      label: "Skapa en annons",
      hint: "Visas i galleriet när kunder söker i din bransch",
      href: `${base}#annonser`,
    },
    {
      done: state.hasJob,
      label: "Lägg upp ett sommarjobb",
      hint: "Helt frivilligt — bara om du söker folk",
      href: `${base}#sommarjobb`,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed || allDone) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="mb-8 rounded-2xl border border-[var(--border)] bg-white card-shadow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--brand)]">
            <Map className="w-4 h-4" />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--primary)] text-sm">Kom igång-guide</h2>
            <p className="text-xs text-[var(--muted)]">{doneCount} av {steps.length} klara</p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="p-1.5 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          aria-label="Dölj guiden"
          title="Dölj guiden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progressbar */}
      <div className="h-1 bg-[var(--hover-bg)]">
        <div
          className="h-full bg-[var(--brand)] transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {steps.map((s) => (
          <li key={s.label}>
            {s.done ? (
              <div className="flex items-center gap-3 px-5 py-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--success)] text-white shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-sm text-[var(--muted)] line-through">{s.label}</span>
              </div>
            ) : (
              <a
                href={s.href}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--hover-bg)] transition-colors group"
              >
                <span className="w-5 h-5 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--brand)] transition-colors shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-[var(--primary)]">{s.label}</span>
                  {s.hint && <span className="block text-xs text-[var(--muted)] mt-0.5">{s.hint}</span>}
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors shrink-0" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
