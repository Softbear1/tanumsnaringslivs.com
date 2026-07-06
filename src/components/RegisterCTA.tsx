import { Check, Sparkles } from "lucide-react";

const included = [
  "Företagsprofil i katalogen",
  "Syns i sök och kategorier",
  "Blixterbjudanden & annonser",
  "Sommarjobbsannonser",
  "Besöksstatistik (30 dagar)",
];

export default function RegisterCTA() {
  return (
    <section id="registrera" className="bg-white border-t border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-[var(--border)] card-shadow overflow-hidden md:flex">
          {/* Inbjudan */}
          <div className="p-7 sm:p-8 md:flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-[var(--accent-light)] text-[var(--brand)] px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Gratis, alltid
            </span>
            <h2 className="text-2xl font-bold text-[var(--primary)] mt-4 mb-2 leading-tight">
              Ta plats i Tanums företagskatalog
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-6">
              Syns för kunder i hela kommunen, lägg upp erbjudanden och sommarjobb — utan
              att det kostar något.
            </p>
            <a
              href="/kom-igang"
              className="inline-block text-center px-6 py-3 rounded-xl font-medium text-sm bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
            >
              Ta över din företagsprofil
            </a>
          </div>

          {/* Vad som ingår */}
          <div className="bg-[var(--bg)] border-t md:border-t-0 md:border-l border-[var(--border)] p-7 sm:p-8 md:w-[44%]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-4">
              Det här ingår
            </p>
            <ul className="space-y-3">
              {included.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--primary)]">
                  <Check className="w-4 h-4 text-[var(--brand)] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
