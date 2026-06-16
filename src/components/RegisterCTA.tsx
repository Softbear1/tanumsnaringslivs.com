import { Search, Inbox, BarChart3, Check, FileText } from "lucide-react";

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

const plans = [
  {
    name: "Gratis",
    price: "0 kr",
    period: "/alltid",
    desc: "Allt du behöver för att synas och få kunder",
    color: "border-[var(--accent)]",
    badge: "Rekommenderas",
    features: ["Företagsprofil i katalogen", "Offertförfrågningar från kunder", "Kontaktuppgifter & karta", "Kategorifilter & sök", "Besöksstatistik"],
  },
  {
    name: "Pro",
    price: "149 kr",
    period: "/mån",
    desc: "För dig som vill synas mer",
    color: "border-[var(--border)]",
    badge: null,
    features: ["Allt i Gratis", "Logga & profilbild", "Prioriterat i listan", "Premium-design på kortet"],
  },
  {
    name: "Boost",
    price: "349 kr",
    period: "/mån",
    desc: "Maximal synlighet",
    color: "border-[var(--boost)]",
    badge: "Boost",
    features: ["Allt i Pro", "BOOST-märkning", "Topplacering i kategorin", "Månadsrapport via e-post"],
  },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border-2 p-6 card-shadow ${p.color}`}
            >
              {p.badge && (
                <span className={`absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full text-white ${p.name === "Gratis" ? "bg-[var(--accent)]" : "bg-[var(--boost)]"}`}>
                  {p.badge}
                </span>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-[var(--primary)] text-lg">{p.name}</h3>
                <p className="text-sm text-[var(--muted)]">{p.desc}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[var(--primary)]">{p.price}</span>
                <span className="text-[var(--muted)] text-sm">{p.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Check className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/admin/logga-in"
                className={`block text-center w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${p.name === "Gratis" ? "bg-[var(--accent)] text-white hover:bg-[#266B50]" : p.name === "Pro" ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] hover:bg-gray-100" : "bg-[var(--boost)] text-white hover:bg-[#B45309]"}`}
              >
                {p.name === "Gratis" ? "Skapa gratis profil" : `Välj ${p.name}`}
              </a>
            </div>
          ))}
        </div>

        {/* Trust signal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[var(--muted)] bg-[var(--bg)] rounded-xl px-6 py-4 max-w-2xl mx-auto">
          <FileText className="w-4 h-4 flex-shrink-0 text-[var(--accent)]" />
          <span>
            <strong className="text-[var(--primary)]">Inga förpliktelser.</strong>{" "}
            Grundprofilen är gratis för alltid — inget kort, ingen bindningstid. Vill du synas mer kan du när som helst uppgradera till Pro eller Boost.
          </span>
        </div>
      </div>
    </section>
  );
}
