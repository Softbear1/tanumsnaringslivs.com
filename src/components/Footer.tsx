/** Hällristnings-solhjul för footer */
function RockArtLogo({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.28;
  const sw = s * 0.075;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" aria-hidden="true">
      <circle cx={cx} cy={cy - s * 0.06} r={r} stroke={color} strokeWidth={sw} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * r;
        const y1 = (cy - s * 0.06) + Math.sin(rad) * r;
        const x2 = cx + Math.cos(rad) * (r + s * 0.14);
        const y2 = (cy - s * 0.06) + Math.sin(rad) * (r + s * 0.14);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} strokeLinecap="round" />;
      })}
      <circle cx={cx - s * 0.26} cy={s * 0.72} r={sw * 0.9} fill={color} />
      <line x1={cx - s * 0.26} y1={s * 0.74} x2={cx - s * 0.26} y2={s * 0.87} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.87} x2={cx - s * 0.32} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.87} x2={cx - s * 0.20} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.79} x2={cx - s * 0.34} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.79} x2={cx - s * 0.18} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx={cx + s * 0.26} cy={s * 0.72} r={sw * 0.9} fill={color} />
      <line x1={cx + s * 0.26} y1={s * 0.74} x2={cx + s * 0.26} y2={s * 0.87} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.87} x2={cx + s * 0.20} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.87} x2={cx + s * 0.32} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.79} x2={cx + s * 0.18} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.79} x2={cx + s * 0.34} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[var(--primary)] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RockArtLogo size={20} color="rgba(255,255,255,0.75)" />
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
                <li><a href="/admin/logga-in" className="hover:text-white transition-colors">Lägg till företag</a></li>
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
