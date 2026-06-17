"use client";
import { useState, useEffect } from "react";
import { TreePine, Menu, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

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
          <a href="/" className="flex items-center gap-2 text-[var(--primary)]">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base leading-tight block">Tanums Näringsliv</span>
              <span className="text-[10px] text-[var(--muted)] leading-tight block tracking-wide uppercase">Lokala företag</span>
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
