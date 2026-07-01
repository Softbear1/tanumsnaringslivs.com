import { Check } from "lucide-react";

const included = [
  "Företagsprofil i katalogen",
  "Offertförfrågningar från kunder via AI",
  "Blixterbjudanden & annonser",
  "Sommarjobbsannonser",
  "Besöksstatistik (30 dagar)",
];

export default function RegisterCTA() {
  return (
    <section id="registrera" className="bg-white border-t border-[var(--border)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
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
            Ta över din företagsprofil
          </a>
        </div>
      </div>
    </section>
  );
}
