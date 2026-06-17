"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

/** Hällristning-inspirerad logga: solhjul + stickfigurer = Tanums signum */
function RockArtLogo({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.28; // solhjulradie
  const sw = s * 0.075; // strokeWidth
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" aria-hidden="true">
      {/* Solhjul */}
      <circle cx={cx} cy={cy - s * 0.06} r={r} stroke={color} strokeWidth={sw} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * r;
        const y1 = (cy - s * 0.06) + Math.sin(rad) * r;
        const x2 = cx + Math.cos(rad) * (r + s * 0.14);
        const y2 = (cy - s * 0.06) + Math.sin(rad) * (r + s * 0.14);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} strokeLinecap="round" />;
      })}
      {/* Stickfigur vänster */}
      <circle cx={cx - s * 0.26} cy={s * 0.72} r={sw * 0.9} fill={color} />
      <line x1={cx - s * 0.26} y1={s * 0.74} x2={cx - s * 0.26} y2={s * 0.87} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.87} x2={cx - s * 0.32} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.87} x2={cx - s * 0.20} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.79} x2={cx - s * 0.34} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.79} x2={cx - s * 0.18} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Stickfigur höger */}
      <circle cx={cx + s * 0.26} cy={s * 0.72} r={sw * 0.9} fill={color} />
      <line x1={cx + s * 0.26} y1={s * 0.74} x2={cx + s * 0.26} y2={s * 0.87} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.87} x2={cx + s * 0.20} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.87} x2={cx + s * 0.32} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.79} x2={cx + s * 0.18} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.79} x2={cx + s * 0.34} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUser(user);
      const { count } = await supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);
      setHasBusiness((count ?? 0) > 0);
    });
  }, []);

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-3 text-[var(--primary)]">
            {/* Hällristningslogga — solhjul med stickfigurer */}
            <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-sm">
              <RockArtLogo size={22} color="white" />
            </div>
            <div>
              <span className="font-bold text-base leading-tight block tracking-tight">Tanums Näringsliv</span>
              <span className="text-[10px] text-[var(--muted)] leading-tight block tracking-widest uppercase">Bohuskusten</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#kategorier" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Kategorier</a>
            <a href="#om-oss" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Om oss</a>
            {user ? (
              <>
                {hasBusiness ? (
                  <a href="/admin" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Admin</a>
                ) : (
                  <a href="/profil" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Profil</a>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <>
                <a href="/admin/logga-in" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Logga in</a>
                <a
                  href="/admin/logga-in"
                  className="text-sm px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
                >
                  Registrera ditt företag →
                </a>
              </>
            )}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-white px-4 py-4 flex flex-col gap-3">
          <a href="#kategorier" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] py-2">Kategorier</a>
          <a href="#om-oss" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] py-2">Om oss</a>
          {user ? (
            <>
              {hasBusiness ? (
                <a href="/admin" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] py-2">Admin</a>
              ) : (
                <a href="/profil" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] py-2">Profil</a>
              )}
              <button onClick={handleLogout} className="text-sm text-[var(--muted)] py-2 text-left">Logga ut</button>
            </>
          ) : (
            <>
              <a href="/admin/logga-in" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] py-2">Logga in</a>
              <a href="/admin/logga-in" onClick={() => setOpen(false)} className="text-sm px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium text-center">
                Lägg till företag – gratis
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
