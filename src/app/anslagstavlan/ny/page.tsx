"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminChatPanel from "@/components/admin/AdminChatPanel";
import { extractBoardAd, BOARD_CATEGORIES, type BoardAdDraft } from "@/lib/chat";
import { submitBoardAd } from "../actions";

export default function NyRadannons() {
  const [mode, setMode] = useState<"chat" | "form">("chat");
  const [draft, setDraft] = useState<BoardAdDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<null | "published" | "pending">(null);
  const [error, setError] = useState<string | null>(null);
  // Honeypot: robotar fyller i dolda fält, människor gör det inte.
  const [website, setWebsite] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (website) return; // honeypot träffad — låtsas inget hänt
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await submitBoardAd({
      category: (fd.get("category") as string) || draft?.category || "diverse",
      title: (fd.get("title") as string) ?? "",
      body: (fd.get("body") as string) ?? "",
      contact_phone: (fd.get("phone") as string) || null,
      contact_email: (fd.get("email") as string) ?? "",
      suspicious: draft?.suspicious ?? false,
    });
    setSubmitting(false);
    if (res.error) setError(res.error);
    else setSent(res.published ? "published" : "pending");
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/anslagstavlan" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Till anslagstavlan
          </Link>

          {sent ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-8 text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--success-bg)] text-[var(--success)] mb-4">
                <Check className="w-6 h-6" />
              </span>
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">
                {sent === "published" ? "Klart! Din annons ligger ute" : "Tack! Din annons granskas"}
              </h1>
              <p className="text-[var(--muted)] text-sm leading-relaxed mb-4">
                {sent === "published"
                  ? "Den syns på tavlan nu och ligger uppe i 30 dagar. Vi har mejlat dig en länk för att ta bort den när den är inaktuell."
                  : "Den läggs ut på tavlan så fort den är godkänd — oftast samma dag. Vi har mejlat dig en länk för att ta bort annonsen när den är inaktuell."}
              </p>
              {sent === "published" && (
                <Link href="/anslagstavlan" className="text-sm font-medium text-[var(--brand)] hover:underline">
                  Se din annons på tavlan →
                </Link>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--primary)] mb-1">Lämna in en radannons</h1>
              <p className="text-[var(--muted)] text-sm mb-6">
                Gratis. Berätta för Elias vad du vill få ut så formulerar han annonsen åt dig.
              </p>

              {mode === "chat" && !draft && (
                <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-4 sm:p-6">
                  <AdminChatPanel<BoardAdDraft>
                    endpoint="/api/anslagstavla-chat"
                    greeting="Hej! Elias här. Vad vill du få ut på tavlan — något som ska säljas, köpas, hyras ut eller ett jobb du utför?"
                    hint="Beskriv med egna ord — du får granska annonsen innan den skickas in."
                    body={{}}
                    parse={(t) => {
                      const { clean, ad } = extractBoardAd(t);
                      return { clean, result: ad };
                    }}
                    onResult={setDraft}
                  />
                  <button onClick={() => setMode("form")} className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                    Fyll i formulär istället →
                  </button>
                </div>
              )}

              {(mode === "form" || draft) && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 space-y-4">
                  {draft && (
                    <p className="text-sm text-[var(--success)] bg-[var(--success-bg)] border border-[var(--success-border)] rounded-lg px-3 py-2">
                      Elias har fyllt i utkastet — kolla att allt stämmer och lägg till dina kontaktuppgifter.
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">Kategori</label>
                    <select name="category" defaultValue={draft?.category ?? "saljes"} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-white">
                      {BOARD_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">Rubrik</label>
                    <input name="title" required maxLength={80} defaultValue={draft?.title ?? ""} placeholder='T.ex. "BEG. KAPSÅG"' className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-1">Text</label>
                    <textarea name="body" required maxLength={400} rows={3} defaultValue={draft?.body ?? ""} placeholder="Det viktigaste: vad, skick, plats, ev. pris." className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] mb-1">Telefon (visas i annonsen)</label>
                      <input name="phone" type="tel" placeholder="070-123 45 67" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] mb-1">Din e-post (visas inte)</label>
                      <input name="email" type="email" required placeholder="din@email.se" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)]" />
                    </div>
                  </div>
                  {/* Honeypot — osynligt för människor */}
                  <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" />
                  {error && <p className="text-sm text-[var(--error)]">{error}</p>}
                  <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-[var(--brand)] text-white font-medium hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50">
                    {submitting ? "Skickar…" : "Skicka in annonsen"}
                  </button>
                  <p className="text-xs text-[var(--muted)] text-center">
                    Annonsen granskas innan den publiceras och ligger uppe i 30 dagar.
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
