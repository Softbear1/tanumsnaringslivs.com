"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function HanteraInner() {
  const token = useSearchParams().get("token") ?? "";
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/anslagstavla", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const res = (await r.json()) as { ok?: boolean; error?: string };
      if (res.error) setError(res.error);
      else setDone(true);
    } catch {
      setError("Kunde inte ta bort annonsen — försök igen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-14 text-center">
          {done ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--success-bg)] text-[var(--success)] mb-4">
                <Check className="w-6 h-6" />
              </span>
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">Annonsen är borttagen</h1>
              <p className="text-sm text-[var(--muted)] mb-5">Tack för att du höll tavlan aktuell.</p>
              <Link href="/anslagstavlan" className="text-sm font-medium text-[var(--brand)] hover:underline">
                Till anslagstavlan →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8">
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">Hantera din annons</h1>
              <p className="text-sm text-[var(--muted)] mb-6">
                Är saken såld eller annonsen inaktuell? Ta bort den här — det håller
                tavlan fräsch för alla.
              </p>
              {!token && <p className="text-sm text-[var(--error)] mb-4">Länken saknar nyckel — använd länken från ditt mejl.</p>}
              {error && <p className="text-sm text-[var(--error)] mb-4">{error}</p>}
              <button
                onClick={handleDelete}
                disabled={busy || !token}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                  confirm ? "bg-[var(--error)] text-white" : "bg-white border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error-bg)]"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {busy ? "Tar bort…" : confirm ? "Klicka igen för att bekräfta" : "Ta bort annonsen"}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// useSearchParams kräver en Suspense-gräns när sidan förrenderas statiskt.
export default function HanteraAnnons() {
  return (
    <Suspense fallback={null}>
      <HanteraInner />
    </Suspense>
  );
}
