import { TreePine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--primary)] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Tanums Näringsliv</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Den självklara platsen att hitta och bli hittad som lokalt företag längs Bohuskusten.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <h4 className="text-white font-medium text-sm mb-3">Tjänster</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#kategorier" className="hover:text-white transition-colors">Kategorier</a></li>
                <li><a href="#registrera" className="hover:text-white transition-colors">Lägg till företag</a></li>
                <li><a href="#registrera" className="hover:text-white transition-colors">Annonsera</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium text-sm mb-3">Info</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#om-oss" className="hover:text-white transition-colors">Om oss</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integritetspolicy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Villkor</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© 2025 Tanums Näringsliv</span>
          <span className="text-white/40">Byggt med kärlek för Tanums lokala näringsliv 🌿</span>
        </div>
      </div>
    </footer>
  );
}
