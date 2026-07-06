import type { Metadata } from "next";
import { MailCheck, PartyPopper, ArrowRight, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessSearchClaim from "@/components/BusinessSearchClaim";

export const metadata: Metadata = {
  title: "Kom igång – lägg upp ditt företag | Tanums Näringsliv",
  description:
    "Lägg upp ditt företag gratis på Tanums Näringsliv. Tre enkla steg — sök upp företaget, bekräfta med e-post, klart.",
  alternates: { canonical: "https://tanumsnaringsliv.com/kom-igang" },
};

export default function KomIgang() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Rubrik — stor, enkel, noll jargong */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--primary)] mb-3 leading-tight">
              Lägg upp ditt företag
            </h1>
            <p className="text-lg text-[var(--muted)]">
              Gratis. Tre steg. Tar ett par minuter.
            </p>
          </div>

          {/* Steg 1 — aktivt: du gör direkt, ingen läsning först */}
          <div className="bg-white rounded-2xl border-2 border-[var(--brand)] card-shadow p-6 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--brand)] text-white font-bold text-base shrink-0">
                1
              </span>
              <div>
                <h2 className="font-bold text-[var(--primary)]">Sök ditt företagsnamn</h2>
                <p className="text-sm text-[var(--muted)]">
                  De flesta företag i Tanum finns redan förberedda — några bokstäver räcker.
                </p>
              </div>
            </div>
            <BusinessSearchClaim />
          </div>

          {/* Steg 2–3 — kommande: nedtonade tills de blir aktuella */}
          <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-5 mb-3 flex gap-3.5 opacity-70">
            <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[var(--border)] text-[var(--muted)] font-bold text-sm shrink-0">
              2
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MailCheck className="w-4 h-4 text-[var(--muted)]" />
                <h3 className="font-semibold text-[var(--primary)] text-sm">Bekräfta att det är ditt</h3>
              </div>
              <p className="text-sm text-[var(--muted)] mt-0.5 leading-relaxed">
                Organisationsnummer och din e-post — du får en länk på mejlen. Inget lösenord.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-5 mb-8 flex gap-3.5 opacity-70">
            <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[var(--border)] text-[var(--muted)] font-bold text-sm shrink-0">
              3
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-[var(--muted)]" />
                <h3 className="font-semibold text-[var(--primary)] text-sm">Klart — du syns</h3>
              </div>
              <p className="text-sm text-[var(--muted)] mt-0.5 leading-relaxed">
                Profilen är live direkt. Bild och beskrivning fyller du på när du vill —
                vår assistent hjälper dig skriva.
              </p>
            </div>
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
