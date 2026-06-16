import { Search, Inbox, BarChart3, Check, Megaphone } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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

        {/* Free plan card + ad upsell */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {/* Free card */}
          <div className="relative rounded-2xl border-2 border-[var(--accent)] p-6 card-shadow">
            <span className="absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full text-white bg-[var(--accent)]">
              Rekommenderas
            </span>
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
              className="block text-center w-full py-2.5 rounded-xl font-medium text-sm bg-[var(--accent)] text-white hover:bg-[#266B50] transition-colors"
            >
              Skapa gratis profil
            </a>
          </div>

          {/* Ad upsell card */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-6 card-shadow flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--primary)] text-lg leading-tight">Annonsera</h3>
                <p className="text-sm text-[var(--muted)]">Syns extra när det gäller</p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 flex-1">
              Skapa en annons direkt i admin-portalen. Den visas i företagsgalleriet och i AI-assistentens chattflöde när kunder söker i din kategori — t.ex. <em>"Beijer erbjuder 25% på trallvirke"</em> mitt i en altan-konversation.
            </p>
            <ul className="space-y-2 mb-6">
              {["Visas i galleriet var 3:e kort", "Kontextuell visning i AI-chatten", "Länk till din webbplats eller kampanj", "Tidsstyrd: sätt start- och sluttid"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/admin/logga-in"
              className="block text-center w-full py-2.5 rounded-xl font-medium text-sm border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Skapa annons i admin →
            </a>
          </div>
        </div>

        {/* Trust signal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[var(--muted)] bg-[var(--bg)] rounded-xl px-6 py-4 max-w-2xl mx-auto">
          <Check className="w-4 h-4 flex-shrink-0 text-[var(--accent)]" />
          <span>
            <strong className="text-[var(--primary)]">Inga förpliktelser.</strong>{" "}
            Grundprofilen är gratis för alltid — inget kort, ingen bindningstid.
          </span>
        </div>
      </div>
    </section>
  );
}
