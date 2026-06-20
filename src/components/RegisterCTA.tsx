import { Check, Briefcase, Search } from "lucide-react";

const included = [
  "Företagsprofil i katalogen",
  "Offertförfrågningar från kunder via AI",
  "Kontaktuppgifter & karta",
  "Kategorifilter & sök",
  "Besöksstatistik (30 dagar)",
];

export default function RegisterCTA() {
  return (
    <section id="registrera" className="bg-white border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Företagare */}
          <div>
            <p className="text-sm text-[var(--muted)] mb-4 text-center">
              Är du företagare i Tanum?{" "}
              <a href="/admin/logga-in" className="text-[var(--accent)] font-medium hover:underline">
                Det är gratis.
              </a>
            </p>
            <div className="relative rounded-2xl border-2 border-[var(--accent)] p-6 card-shadow text-left">
              <div className="mb-4">
                <h3 className="font-bold text-[var(--primary)] text-lg">Gratis</h3>
                <p className="text-sm text-[var(--muted)]">Allt du behöver för att synas och få kunder</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[var(--primary)]">0 kr</span>
                <span className="text-[var(--muted)] text-sm">/alltid</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {included.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Check className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/admin/logga-in"
                className="block text-center w-full py-2.5 rounded-xl font-medium text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] transition-colors"
              >
                Skapa gratis profil
              </a>
            </div>
          </div>

          {/* Jobbsökande */}
          <div>
            <p className="text-sm text-[var(--muted)] mb-4 text-center">
              Letar du sommarjobb i Tanum?{" "}
              <a href="/sommarjobb" className="text-amber-700 font-medium hover:underline">
                Se alla lediga tjänster.
              </a>
            </p>
            <div className="relative rounded-2xl border-2 border-amber-300 p-6 card-shadow text-left bg-amber-50">
              <div className="mb-4">
                <h3 className="font-bold text-[var(--primary)] text-lg">Sommarjobb</h3>
                <p className="text-sm text-[var(--muted)]">Lediga jobb hos lokala arbetsgivare i kommunen</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Jobb inom restaurang, handel, turism m.m.",
                  "Direktkontakt med arbetsgivaren",
                  "Ny annons läggs upp varje vecka",
                  "Ansök direkt på sajten",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Briefcase className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/sommarjobb"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                <Search className="w-4 h-4" />
                Sök sommarjobb
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
