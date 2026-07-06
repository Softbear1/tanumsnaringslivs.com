import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KomIgangWizard from "@/components/KomIgangWizard";

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
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--primary)] mb-3 leading-tight">
              Lägg upp ditt företag
            </h1>
            <p className="text-lg text-[var(--muted)]">
              Gratis. Tre steg. Tar ett par minuter.
            </p>
          </div>

          <KomIgangWizard />

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
