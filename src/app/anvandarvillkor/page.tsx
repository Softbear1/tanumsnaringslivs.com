import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Användarvillkor – Tanums Näringsliv",
  description: "Villkor för användning av Tanums Näringslivs katalog- och förmedlingstjänst.",
};

const UPDATED = "18 juni 2026";

export default function AnvandarvillkorPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Till katalogen
        </Link>

        <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">Användarvillkor</h1>
        <p className="text-sm text-[var(--muted)] mb-8">Senast uppdaterad: {UPDATED}</p>

        <div className="space-y-6 text-[var(--primary)]/90 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Om tjänsten</h2>
            <p>
              Tanums Näringsliv (<strong>tanumsnaringsliv.com</strong>) är en katalog- och
              förmedlingstjänst som hjälper besökare att hitta och kontakta lokala företag i Tanum.
              Tjänsten kopplar samman besökare och företag — vi är inte part i något avtal som ingås
              mellan en besökare och ett företag.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Vårt ansvar</h2>
            <p>
              Vi ansvarar inte för de tjänster, varor, priser, erbjudanden eller den information som
              enskilda företag erbjuder eller publicerar. Avtal, betalning och utförande sker direkt
              mellan dig och företaget. Vi strävar efter att hålla tjänsten tillgänglig och korrekt,
              men lämnar inga garantier för att uppgifter alltid är fullständiga, aktuella eller felfria.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Företagens ansvar</h2>
            <p>
              Företag som lägger upp en listning ansvarar själva för att deras uppgifter, annonser och
              blixterbjudanden är korrekta, lagliga och inte vilseledande. Annonser och erbjudanden ska
              vara tydligt utformade så att de går att känna igen som marknadsföring, i enlighet med
              marknadsföringslagen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Tillåten användning</h2>
            <p>
              Du får inte använda tjänsten för olagliga ändamål, lämna falska uppgifter, försöka samla
              in andras personuppgifter, eller störa tjänstens drift. Vi förbehåller oss rätten att ta
              bort innehåll och stänga av konton som bryter mot dessa villkor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Immateriella rättigheter</h2>
            <p>
              Webbplatsens utformning, text och logotyp tillhör Tanums Näringsliv. Företagens egna
              logotyper, texter och bilder tillhör respektive företag, som ansvarar för att de har rätt
              att använda materialet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Personuppgifter</h2>
            <p>
              Hur vi behandlar personuppgifter beskrivs i vår{" "}
              <Link href="/integritetspolicy" className="text-[var(--accent)] underline">integritetspolicy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Ändringar och tillämplig lag</h2>
            <p>
              Vi kan uppdatera dessa villkor; den senaste versionen finns alltid på den här sidan.
              Svensk lag tillämpas på tjänsten och dessa villkor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Kontakt</h2>
            <p>
              Frågor om villkoren?{" "}
              <a href="mailto:elias.bengtsson@live.com" className="text-[var(--accent)] underline">elias.bengtsson@live.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
