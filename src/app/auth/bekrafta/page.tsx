export const runtime = "edge";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TnIcon } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Bekräfta inloggning – Tanums Näringsliv",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}

// Mellansteg för magiska länkar: engångskoden förbrukas först när användaren
// aktivt klickar på knappen (formulär-POST till /auth/confirm). Utan det här
// steget hinner mejlens säkerhetsskannrar förbruka länken — se /auth/callback.
export default async function BekraftaPage({ searchParams }: PageProps) {
  const { token_hash: tokenHash, type, next } = await searchParams;

  if (!tokenHash || !type) {
    redirect("/admin/logga-in?error=expired_link");
  }

  const safeNext = next && next.startsWith("/") ? next : "/admin";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <TnIcon size={64} />
          <h1 className="text-2xl font-bold text-[var(--primary)] mt-4">Tanums Näringsliv</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[var(--border)] p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">Ett klick kvar</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
            Bekräfta att det är du som klickade på länken i mejlet, så loggas du in direkt.
          </p>
          <form method="POST" action="/auth/confirm">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={safeNext} />
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors"
            >
              Logga in
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            ← Tillbaka till Tanums Näringsliv
          </Link>
        </div>
      </div>
    </div>
  );
}
