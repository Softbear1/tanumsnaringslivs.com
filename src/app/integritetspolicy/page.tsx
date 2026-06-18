import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Integritetspolicy – Tanums Näringsliv",
  description: "Hur Tanums Näringsliv behandlar personuppgifter enligt GDPR.",
};

const UPDATED = "18 juni 2026";

export default function IntegritetspolicyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Till katalogen
        </Link>

        <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">Integritetspolicy</h1>
        <p className="text-sm text-[var(--muted)] mb-8">Senast uppdaterad: {UPDATED}</p>

        <div className="prose-legal space-y-6 text-[var(--primary)]/90 text-sm leading-relaxed">
          <section>
            <p>
              Den här policyn beskriver hur Tanums Näringsliv behandlar personuppgifter när du
              använder webbplatsen <strong>tanumsnaringsliv.com</strong>. Vi värnar om din integritet
              och samlar bara in uppgifter vi faktiskt behöver för att tjänsten ska fungera.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Personuppgiftsansvarig</h2>
            <p>
              Elias Bengtsson, Grebbestad, Tanums kommun, ansvarar för behandlingen av personuppgifter
              på den här webbplatsen. Kontakt:{" "}
              <a href="mailto:elias.bengtsson@live.com" className="text-[var(--accent)] underline">elias.bengtsson@live.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Vilka uppgifter vi samlar in</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Förfrågningar till företag:</strong> om du skickar en förfrågan via tjänsten lagras de uppgifter du själv anger — t.ex. namn, e-postadress, telefonnummer (om du anger det) och beskrivningen av ditt ärende.</li>
              <li><strong>Företagslistningar:</strong> de kontakt- och företagsuppgifter som ett företag själv väljer att lägga upp.</li>
              <li><strong>Konto:</strong> e-postadress för inloggning (gäller företag som administrerar sin listning).</li>
              <li><strong>Anonym statistik:</strong> antal sidvisningar och klick på erbjudanden. Denna statistik innehåller <strong>ingen IP-adress och ingen uppgift som kan kopplas till en enskild person</strong> — endast tidpunkt och vilket företag/erbjudande det gäller.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Ändamål och rättslig grund</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Förmedla offertförfrågningar</strong> till relevanta företag — rättslig grund: ditt samtycke när du skickar förfrågan, samt vårt och företagens berättigade intresse av att kunna svara.</li>
              <li><strong>Hantera företagskonton och listningar</strong> — rättslig grund: fullgörande av tjänsten (avtal).</li>
              <li><strong>Förbättra och visa upp tjänsten</strong> via anonym, aggregerad statistik — rättslig grund: berättigat intresse. (Eftersom statistiken är anonym utgör den i praktiken inte personuppgifter.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Hur länge vi sparar uppgifterna</h2>
            <p>
              Offertförfrågningar sparas så länge det behövs för att hantera ärendet och som längst
              24 månader, därefter raderas eller anonymiseras de. Företagsuppgifter sparas så länge
              listningen är aktiv. Du kan när som helst be oss radera dina uppgifter (se nedan).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Vem får ta del av uppgifterna</h2>
            <p>
              Offertförfrågningar delas med de företag du valt att kontakta. I övrigt delar vi inte
              dina uppgifter med andra än de tjänsteleverantörer (personuppgiftsbiträden) som driver
              webbplatsen åt oss:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Supabase</strong> — databas och lagring.</li>
              <li><strong>Cloudflare</strong> — drift och hosting av webbplatsen.</li>
              <li><strong>Resend</strong> — utskick av e-post (t.ex. inloggningslänkar och notiser).</li>
              <li><strong>Meta/Facebook</strong> — endast när ett företag väljer att publicera sitt eget blixterbjudande på vår Facebook-sida. Inga kunduppgifter delas med Facebook; det är företagets erbjudande som publiceras.</li>
            </ul>
            <p className="mt-2">
              Vissa av dessa leverantörer kan behandla uppgifter utanför EU/EES. I sådana fall sker
              överföringen med skyddsåtgärder enligt GDPR, t.ex. EU-kommissionens standardavtalsklausuler.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Cookies</h2>
            <p>
              Vi använder <strong>inte</strong> cookies för spårning, marknadsföring eller analys. De
              enda cookies som sätts är en nödvändig inloggningscookie för företag som loggar in i
              administrationen — den krävs för att tjänsten ska fungera och kräver därför inte samtycke.
              Vår besöksstatistik fungerar utan cookies och utan att identifiera dig.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Dina rättigheter</h2>
            <p>Enligt GDPR har du rätt att:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>begära ett utdrag av de uppgifter vi har om dig,</li>
              <li>få felaktiga uppgifter rättade,</li>
              <li>få dina uppgifter raderade,</li>
              <li>invända mot eller begränsa behandlingen,</li>
              <li>få ut dina uppgifter i ett maskinläsbart format (dataportabilitet),</li>
              <li>återkalla ett lämnat samtycke.</li>
            </ul>
            <p className="mt-2">
              Kontakta oss på{" "}
              <a href="mailto:elias.bengtsson@live.com" className="text-[var(--accent)] underline">elias.bengtsson@live.com</a>{" "}
              för att utöva dina rättigheter. Du har också rätt att lämna klagomål till
              Integritetsskyddsmyndigheten (IMY), <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline">imy.se</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Ändringar i policyn</h2>
            <p>
              Vi kan komma att uppdatera den här policyn. Den senaste versionen finns alltid på den här
              sidan med datum för senaste ändring.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
