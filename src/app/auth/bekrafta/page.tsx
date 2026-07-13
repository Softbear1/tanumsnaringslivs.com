import type { Metadata } from "next";
import Link from "next/link";
import { TnIcon } from "@/components/Logo";
import BekraftaForm from "./BekraftaForm";

export const metadata: Metadata = {
  title: "Bekräfta inloggning – Tanums Näringsliv",
  robots: { index: false },
};

// Mellansteg för magiska länkar: engångskoden förbrukas först när användaren
// aktivt klickar på knappen (formulär-POST till /auth/callback). Utan det här
// steget hinner mejlens säkerhetsskannrar förbruka länken — se /auth/callback.
// Sidan är statisk; query-parametrarna läses klient-side i BekraftaForm.
export default function BekraftaPage() {
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
          <BekraftaForm />
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
