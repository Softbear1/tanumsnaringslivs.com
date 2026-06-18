import RockArtLogo from "./RockArtLogo";

export default function Footer() {
  return (
    <footer className="bg-[var(--primary)] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RockArtLogo size={20} color="rgba(255,255,255,0.75)" />
              </div>
              <span className="font-bold text-white">Tanums Näringsliv</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              En lokal samlingsplats där företag i Tanum syns och hittas av kunder i närområdet —
              gratis att vara med på, byggd för bygden.
            </p>

            {/* Om Elias — grundaren */}
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Plats för bild av Elias — läggs till så småningom */}
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                E
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-0.5">Elias, Grebbestad</p>
                <p className="text-xs leading-relaxed text-white/60">
                  Hej! Jag heter Elias och bor i Grebbestad. Jag byggde den här sidan för att ge
                  lokala företag i Tanum den synlighet de förtjänar — enkelt, lokalt och nära.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <h4 className="text-white font-medium text-sm mb-3">Tjänster</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#kategorier" className="hover:text-white transition-colors">Kategorier</a></li>
                <li><a href="/admin/logga-in" className="hover:text-white transition-colors">Lägg till företag</a></li>
                <li><a href="#registrera" className="hover:text-white transition-colors">Annonsera</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium text-sm mb-3">Blixterbjudanden</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/blixterbjudanden" className="hover:text-white transition-colors">Alla blixterbjudanden</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium text-sm mb-3">Kontakt</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:elias.bengtsson@live.com" className="hover:text-white transition-colors">
                    elias.bengtsson@live.com
                  </a>
                </li>
                <li className="text-white/50">Tanums kommun, Bohuslän</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Tanums Näringsliv</span>
            <a href="/integritetspolicy" className="hover:text-white transition-colors">Integritetspolicy</a>
            <a href="/anvandarvillkor" className="hover:text-white transition-colors">Användarvillkor</a>
          </div>
          <span className="text-white/40">Byggt med kärlek för Tanums lokala näringsliv 🌿</span>
        </div>
      </div>
    </footer>
  );
}
