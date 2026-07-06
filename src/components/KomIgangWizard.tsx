"use client";
import { useState } from "react";
import { Check, MailCheck, PartyPopper, ArrowRight, HelpCircle } from "lucide-react";
import BusinessSearchClaim from "@/components/BusinessSearchClaim";

// Steg tänds i takt med att man gör: 1 = söker, 2 = företag valt (claim pågår),
// 3 = länk skickad. Som en spel-tutorial — aldrig läsa först och göra sen.
type Phase = 1 | 2 | 3;

function StepBadge({ n, state }: { n: number; state: "done" | "active" | "upcoming" }) {
  if (state === "done") {
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--success)] text-white shrink-0">
        <Check className="w-4.5 h-4.5" />
      </span>
    );
  }
  return (
    <span
      className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-base shrink-0 ${
        state === "active"
          ? "bg-[var(--brand)] text-white"
          : "border-2 border-[var(--border)] text-[var(--muted)]"
      }`}
    >
      {n}
    </span>
  );
}

export default function KomIgangWizard() {
  const [phase, setPhase] = useState<Phase>(1);
  const [businessName, setBusinessName] = useState<string | null>(null);

  const card = (state: "done" | "active" | "upcoming") =>
    `rounded-2xl border transition-all duration-500 ${
      state === "active"
        ? "bg-white border-2 border-[var(--brand)] card-shadow p-6"
        : state === "done"
          ? "bg-[var(--success-bg)] border-[var(--success-border)] p-5"
          : "bg-white/60 border-[var(--border)] p-5 opacity-70"
    }`;

  // Steg 1 förblir monterat under fas 2 — claim-modalen renderas inne i
  // sökkomponenten och skulle försvinna om kortet byts till "done" för tidigt.
  const s1: "done" | "active" = phase === 3 ? "done" : "active";
  const s2: "done" | "active" | "upcoming" = phase === 3 ? "done" : phase === 2 ? "active" : "upcoming";
  const s3: "active" | "upcoming" = phase === 3 ? "active" : "upcoming";

  return (
    <>
      {/* Steg 1 — sök */}
      <div className={`${card(s1)} mb-3`}>
        <div className={`flex items-center gap-3 ${s1 === "active" ? "mb-4" : ""}`}>
          <StepBadge n={1} state={s1} />
          <div>
            <h2 className="font-bold text-[var(--primary)]">
              {s1 === "done" && businessName ? `Hittat: ${businessName}` : "Sök ditt företagsnamn"}
            </h2>
            {s1 === "active" && (
              <p className="text-sm text-[var(--muted)]">
                De flesta företag i Tanum finns redan förberedda — några bokstäver räcker.
              </p>
            )}
          </div>
        </div>
        {s1 === "active" && (
          <BusinessSearchClaim
            onSelect={(name) => { setBusinessName(name); setPhase(2); }}
            onClaimSent={() => setPhase(3)}
            onModalClose={() => setPhase((p) => (p === 2 ? 1 : p))}
          />
        )}
      </div>

      {/* Steg 2 — bekräfta */}
      <div className={`${card(s2)} mb-3 flex gap-3.5`}>
        <StepBadge n={2} state={s2} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MailCheck className={`w-4 h-4 ${s2 === "active" ? "text-[var(--brand)]" : "text-[var(--muted)]"}`} />
            <h3 className="font-semibold text-[var(--primary)] text-sm">
              {s2 === "done" ? "Bekräftat — länk skickad" : "Bekräfta att det är ditt"}
            </h3>
          </div>
          <p className="text-sm text-[var(--muted)] mt-0.5 leading-relaxed">
            {s2 === "active"
              ? "Följ Elias instruktioner i rutan — organisationsnummer och din e-post, så kommer länken på mejlen."
              : "Organisationsnummer och din e-post — du får en länk på mejlen. Inget lösenord."}
          </p>
        </div>
      </div>

      {/* Steg 3 — klart */}
      <div className={`${card(s3)} mb-8 flex gap-3.5`}>
        <StepBadge n={3} state={s3} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PartyPopper className={`w-4 h-4 ${s3 === "active" ? "text-[var(--sol-500)]" : "text-[var(--muted)]"}`} />
            <h3 className="font-semibold text-[var(--primary)] text-sm">
              {s3 === "active" ? "Nästan klart — kolla mejlen" : "Klart — du syns"}
            </h3>
          </div>
          <p className="text-sm text-[var(--muted)] mt-0.5 leading-relaxed">
            {s3 === "active"
              ? "Öppna mejlet och klicka på länken så är du inne. Sedan fyller du på med bild och beskrivning när du vill — vår assistent hjälper dig skriva."
              : "Profilen är live direkt. Bild och beskrivning fyller du på när du vill — vår assistent hjälper dig skriva."}
          </p>
        </div>
      </div>

      {/* Fallback: företaget finns inte — döljs när man är i mål */}
      {phase < 3 && (
        <div className="bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <HelpCircle className="w-4 h-4 text-[var(--muted)]" />
            <h3 className="font-semibold text-[var(--primary)] text-sm">
              Hittar du inte företaget?
            </h3>
          </div>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            Då lägger du till det själv. Logga in med din e-post (du får en länk på
            mejlen), sedan hjälper vår assistent dig fylla i allt — du beskriver bara
            företaget med egna ord.
          </p>
          <a
            href="/admin/logga-in?next=/admin/foretag/ny"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
          >
            Lägg till nytt företag <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </>
  );
}
