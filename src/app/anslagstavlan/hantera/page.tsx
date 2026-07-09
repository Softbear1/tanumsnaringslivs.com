"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BOARD_CATEGORIES } from "@/lib/chat";

type Ad = { category: string; title: string; body: string; contact_phone: string | null; status: string };

function HanteraInner() {
  const token = useSearchParams().get("token") ?? "";
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/anslagstavla?token=${encodeURIComponent(token)}`);
        const res = (await r.json()) as { ad?: Ad; error?: string };
        if (res.error) setLoadError(res.error);
        else setAd(res.ad ?? null);
      } catch {
        setLoadError("Kunde inte hämta annonsen — försök igen.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const payload = {
      token,
      category: (fd.get("category") as string) ?? "",
      title: (fd.get("title") as string) ?? "",
      body: (fd.get("body") as string) ?? "",
      contact_phone: (fd.get("phone") as string) || null,
    };
    try {
      const r = await fetch("/api/anslagstavla", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const res = (await r.json()) as { ok?: boolean; error?: string };
      if (res.error) setSaveError(res.error);
      else {
        setAd({ ...payload, status: ad?.status ?? "active" });
        setSaved(true);
      }
    } catch {
      setSaveError("Kunde inte spara ändringarna — försök igen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    setDeleteError(null);
    try {
      const r = await fetch("/api/anslagstavla", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const res = (await r.json()) as { ok?: boolean; error?: string };
      if (res.error) setDeleteError(res.error);
      else setDeleted(true);
    } catch {
      setDeleteError("Kunde inte ta bort annonsen — försök igen.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
          {deleted ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8 text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--success-bg)] text-[var(--success)] mb-4">
                <Check className="w-6 h-6" />
              </span>
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">Annonsen är borttagen</h1>
              <p className="text-sm text-[var(--muted)] mb-5">Tack för att du höll tavlan aktuell.</p>
              <Link href="/anslagstavlan" className="text-sm font-medium text-[var(--brand)] hover:underline">
                Till anslagstavlan →
              </Link>
            </div>
          ) : !token ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8 text-center">
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">Hantera din annons</h1>
              <p className="text-sm text-[var(--error)]">Länken saknar nyckel — använd länken från ditt mejl.</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8 text-center">
              <p className="text-sm text-[var(--muted)]">Hämtar annonsen…</p>
            </div>
          ) : loadError || !ad ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8 text-center">
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">Hantera din annons</h1>
              <p className="text-sm text-[var(--error)]">{loadError ?? "Annonsen hittades inte."}</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[var(--primary)] mb-1 text-center">Hantera din annons</h1>
              <p className="text-sm text-[var(--muted)] mb-6 text-center">
                {ad.status === "pending"
                  ? "Annonsen väntar på granskning. Du kan fortfarande ändra den."
                  : "Ändra informationen eller ta bort annonsen om den är inaktuell."}
              </p>

              <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-1">Kategori</label>
                  <select name="category" defaultValue={ad.category} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-white">
                    {BOARD_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-1">Rubrik</label>
                  <input name="title" required maxLength={80} defaultValue={ad.title} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-1">Text</label>
                  <textarea name="body" required maxLength={400} rows={3} defaultValue={ad.body} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-1">Telefon (visas i annonsen)</label>
                  <input name="phone" type="tel" defaultValue={ad.contact_phone ?? ""} placeholder="070-123 45 67" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)]" />
                </div>
                {saveError && <p className="text-sm text-[var(--error)]">{saveError}</p>}
                {saved && <p className="text-sm text-[var(--success)]">Ändringarna är sparade.</p>}
                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-[var(--brand)] text-white font-medium hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50">
                  {saving ? "Sparar…" : "Spara ändringar"}
                </button>
              </form>

              <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 text-center">
                <p className="text-sm text-[var(--muted)] mb-4">
                  Är saken såld eller annonsen inaktuell? Ta bort den här.
                </p>
                {deleteError && <p className="text-sm text-[var(--error)] mb-4">{deleteError}</p>}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                    confirmDelete ? "bg-[var(--error)] text-white" : "bg-white border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error-bg)]"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Tar bort…" : confirmDelete ? "Klicka igen för att bekräfta" : "Ta bort annonsen"}
                </button>
              </div>
            </>
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
