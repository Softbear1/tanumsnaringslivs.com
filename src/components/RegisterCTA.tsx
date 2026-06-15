import { Search, CreditCard, BarChart3, Zap, Check, FileText } from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Bli hittad",
    desc: "Visas i sökresultat när lokala kunder letar efter dina tjänster.",
  },
  {
    icon: CreditCard,
    title: "Professionellt kontaktkort",
    desc: "Ditt varumärke presenterat snyggt med logga, beskrivning och kontaktuppgifter.",
  },
  {
    icon: BarChart3,
    title: "Statistik & insikter",
    desc: "Se exakt hur många som sett och klickat på ditt kontaktkort varje månad.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "0 kr",
    period: "",
    desc: "Kom igång direkt",
    color: "border-[var(--border)]",
    badge: null,
    features: ["Grundlistning", "Kontaktuppgifter", "Kategorifilter"],
  },
  {
    name: "Pro",
    price: "149 kr",
    period: "/mån",
    desc: "Mest populär",
    color: "border-[var(--accent)]",
    badge: "Populär",
    features: ["Allt i Gratis", "Logga & profilbild", "Statistik & besöksdata", "Prioriterat i listan", "Premium-design på kortet"],
  },
  {
    name: "Boost",
    price: "349 kr",
    period: "/mån",
    desc: "Maximal synlighet",
    color: "border-[var(--boost)]",
    badge: "Boost",
    features: ["Allt i Pro", "BOOST-märkning", "Annons i flödet", "Topplacering i kategorin", "Månadsrapport via e-post"],
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
            Är ditt företag med?
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto text-lg">
            Tusentals lokala kunder söker just nu efter företag som ditt. Gör dig synlig — det tar två minuter.
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
                <span className={`absolute -top-3 left-6 text-xs font-bold px-3 py-1 rounded-full text-white ${p.name === "Pro" ? "bg-[var(--accent)]" : "bg-[var(--boost)]"}`}>
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
              <button className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${p.name === "Gratis" ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] hover:bg-gray-100" : p.name === "Pro" ? "bg-[var(--accent)] text-white hover:bg-[#266B50]" : "bg-[var(--boost)] text-white hover:bg-[#B45309]"}`}>
                Välj {p.name}
              </button>
            </div>
          ))}
        </div>

        {/* Trust signal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[var(--muted)] bg-[var(--bg)] rounded-xl px-6 py-4 max-w-2xl mx-auto">
          <FileText className="w-4 h-4 flex-shrink-0 text-[var(--accent)]" />
          <span>
            <strong className="text-[var(--primary)]">Enkelt för bokföringen.</strong>{" "}
            Faktura skickas automatiskt varje månad. Org.nr och momsregistreringsuppgifter hämtas direkt från Bolagsverket — du fyller i minimalt.
          </span>
        </div>
      </div>
    </section>
  );
}
