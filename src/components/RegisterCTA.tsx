import { Search, Inbox, BarChart3, Check } from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Bli hittad – gratis",
    desc: "Visas i katalogen och i sökresultat när lokala kunder letar efter dina tjänster. Det kostar inget att vara med.",
  },
  {
    icon: Inbox,
    title: "Få offertförfrågningar",
    desc: "Kunder beskriver vad de behöver via AI-assistenten och förfrågan landar direkt i din portal — utan extra avgift.",
  },
  {
    icon: BarChart3,
    title: "Statistik & insikter",
    desc: "Se hur många som sett din profil varje månad och följ dina offertförfrågningar på ett ställe.",
  },
];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            För företag
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-4">
            Gratis att vara med
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto text-lg">
            Lokala kunder söker just nu efter företag som ditt. Skapa din profil och ta emot offertförfrågningar — helt utan kostnad. Det tar två minuter.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex gap-4 p-6 rounded-2xl bg-[var(--bg)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--primary)] mb-1">{b.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free plan card */}
        <div className="max-w-sm mx-auto">
          <div className="relative rounded-2xl border-2 border-[var(--accent)] p-6 card-shadow">
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
      </div>
    </section>
  );
}
