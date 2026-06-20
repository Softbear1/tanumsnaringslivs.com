import { MapPin, Briefcase, Building2, Handshake } from "lucide-react";

const cards = [
  {
    icon: MapPin,
    title: "Hitta lokala företag",
    subtitle: "Sök bland 900+ företag i Tanums kommun",
    href: "/#kategorier",
    color: "var(--primary)",
    bg: "var(--accent-light)",
  },
  {
    icon: Briefcase,
    title: "Sommarjobb i Tanum",
    subtitle: "Se lediga tjänster och anmäl jobbevakning — gratis",
    href: "/sommarjobb",
    color: "var(--boost)",
    bg: "var(--boost-bg)",
  },
  {
    icon: Building2,
    title: "Ta över ditt företag",
    subtitle: "Claima din profil, lägg upp jobb och annonsera — helt gratis",
    href: "/admin/logga-in",
    color: "var(--accent)",
    bg: "var(--accent-light)",
  },
  {
    icon: Handshake,
    title: "En levande lokal plattform",
    subtitle: "900+ företag, tusentals besökare per månad",
    href: "/admin/logga-in",
    color: "var(--primary)",
    bg: "#F0F4F8",
  },
];

export default function VisitorCTAs() {
  return (
    <section className="bg-[var(--bg)] border-t border-[var(--border)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)] mb-6 text-center">
          Välj din ingång
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ icon: Icon, title, subtitle, href, color, bg }) => (
            <a
              key={href + title}
              href={href}
              className="group flex flex-col gap-3 p-5 rounded-2xl border border-[var(--border)] bg-white card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-150"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--primary)] leading-snug mb-1">
                  {title}
                </p>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
