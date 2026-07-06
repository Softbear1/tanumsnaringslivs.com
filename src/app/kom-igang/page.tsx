import type { Metadata } from "next";
import { Search, MailCheck, PartyPopper, ArrowRight, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessSearchClaim from "@/components/BusinessSearchClaim";

export const metadata: Metadata = {
  title: "Kom igång – lägg upp ditt företag | Tanums Näringsliv",
  description:
    "Lägg upp ditt företag gratis på Tanums Näringsliv. Tre enkla steg — sök upp företaget, bekräfta med e-post, klart.",
  alternates: { canonical: "https://tanumsnaringsliv.com/kom-igang" },
};

const steps = [
  {
    icon: Search,
    title: "Hitta ditt företag",
    text: "De flesta företag i Tanum finns redan förberedda i katalogen. Sök på namnet här nedanför.",
  },
  {
    icon: MailCheck,
    title: "Bekräfta att det är ditt",
    text: "Ange organisationsnummer och din e-post. Du får en länk på mejlen — klicka på den, färdigt. Inget lösenord behövs.",
  },
  {
    icon: PartyPopper,
    title: "Klart — du syns",
    text: "Din profil är live direkt. Fyll på med bild och beskrivning när du vill — vår assistent hjälper dig skriva.",
  },
];

export default function KomIgang() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Rubrik — stor, enkel, noll jargong */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--primary)] mb-3 leading-tight">
              Lägg upp ditt företag
            </h1>
            <p className="text-lg text-[var(--muted)]">
              Gratis. Tre steg. Tar ett par minuter.
            </p>
          </div>

          {/* Stegen — som en spelguide, ett i taget */}
          <ol className="space-y-4 mb-10">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex gap-4 bg-white rounded-2xl border border-[var(--border)] card-shadow p-5"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--brand)] text-white font-bold text-base shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="w-4 h-4 text-[var(--brand)]" />
                    <h2 className="font-semibold text-[var(--primary)]">{s.title}</h2>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Steg 1 börjar här — sökfältet */}
          <div className="bg-white rounded-2xl border-2 border-[var(--brand)] card-shadow p-6 mb-6">
            <h2 className="font-bold text-[var(--primary)] text-lg mb-1">
              Börja här: sök ditt företagsnamn
            </h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Skriv t.ex. &quot;Gråhälla&quot; — du behöver inte skriva hela namnet.
            </p>
            <BusinessSearchClaim />
          </div>

          {/* Fallback: företaget finns inte */}
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

          <p className="text-center text-xs text-[var(--muted)] mt-8">
            Kör du fast? Mejla{" "}
            <a href="mailto:elias.bengtsson@live.com" className="underline hover:text-[var(--primary)]">
              elias.bengtsson@live.com
            </a>{" "}
            så hjälper vi dig.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
