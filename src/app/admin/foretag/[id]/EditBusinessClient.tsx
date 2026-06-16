"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import BusinessForm from "@/components/admin/BusinessForm";
import ListingChat from "@/components/admin/ListingChat";
import AdChat from "@/components/admin/AdChat";
import type { BusinessDraft, AdDraft } from "@/lib/chat";
import Link from "next/link";
import { Plus, Trash2, Pause, Play, Megaphone, Sparkles } from "lucide-react";

interface Ad {
  id: string;
  headline: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  category_id: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

interface Props {
  business: {
    id: string;
    name: string;
    category_id: string;
    description: string;
    phone: string;
    email: string;
    website: string | null;
    address: string;
    initials: string;
    owner_id: string | null;
  };
  categories: Array<{ id: string; name: string }>;
  ads: Ad[];
}

function toDraft(b: Props["business"]): BusinessDraft {
  return {
    name: b.name,
    category_id: b.category_id,
    description: b.description,
    phone: b.phone,
    email: b.email,
    website: b.website,
    address: b.address,
    initials: b.initials,
  };
}

export default function EditBusinessClient({ business, categories, ads }: Props) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adSubmitting, setAdSubmitting] = useState(false);

  // Business edit: chat can prefill the form. We remount the form (via formKey)
  // when a draft arrives so its defaults pick up the new values.
  const [editChat, setEditChat] = useState(false);
  const [formSeed, setFormSeed] = useState<BusinessDraft>(() => toDraft(business));
  const [formKey, setFormKey] = useState(0);

  // Ad creation: "none" | "chat" | "form". A chat draft prefills the form.
  const [adMode, setAdMode] = useState<"none" | "chat" | "form">("none");
  const [adDraft, setAdDraft] = useState<AdDraft | null>(null);

  function handleBusinessDraft(d: BusinessDraft) {
    const valid = categories.some((c) => c.id === d.category_id);
    setFormSeed({ ...d, category_id: valid ? d.category_id : "" });
    setFormKey((k) => k + 1);
    setEditChat(false);
  }

  function handleAdDraft(ad: AdDraft) {
    const valid = ad.category_id && categories.some((c) => c.id === ad.category_id);
    setAdDraft({ ...ad, category_id: valid ? ad.category_id : null });
    setAdMode("form");
  }

  async function handleSubmit(data: {
    name: string;
    category_id: string;
    description: string;
    phone: string;
    email: string;
    website: string | null;
    address: string;
    initials: string;
  }) {
    setLoading(true);
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("businesses")
      .update(data)
      .eq("id", business.id);

    setLoading(false);
    if (error) throw new Error(error.message);
    window.location.href = "/admin";
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const supabase = createBrowserClient();
    const { error } = await supabase.from("businesses").delete().eq("id", business.id);
    setDeleting(false);
    if (error) {
      alert("Kunde inte ta bort företaget: " + error.message);
      return;
    }
    window.location.href = "/admin";
  }

  async function handleCreateAd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createBrowserClient();
    const { error } = await supabase.from("ads").insert({
      business_id: business.id,
      headline: fd.get("headline") as string,
      body: (fd.get("body") as string) || null,
      cta_label: (fd.get("cta_label") as string) || null,
      cta_url: (fd.get("cta_url") as string) || null,
      category_id: (fd.get("category_id") as string) || null,
      starts_at: (fd.get("starts_at") as string) || null,
      ends_at: (fd.get("ends_at") as string) || null,
      active: true,
    });
    setAdSubmitting(false);
    if (error) {
      alert("Kunde inte skapa annonsen: " + error.message);
      return;
    }
    window.location.reload();
  }

  async function handleToggleAd(adId: string, currentlyActive: boolean) {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("ads").update({ active: !currentlyActive }).eq("id", adId);
    if (error) {
      alert("Kunde inte uppdatera annonsen: " + error.message);
      return;
    }
    window.location.reload();
  }

  async function handleDeleteAd(adId: string) {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("ads").delete().eq("id", adId);
    if (error) {
      alert("Kunde inte ta bort annonsen: " + error.message);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--primary)] text-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold">Redigera företag</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Business form */}
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditChat((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] border border-[var(--accent)]/30 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/5 transition-colors font-medium"
            >
              <Sparkles className="w-4 h-4" />
              {editChat ? "Stäng chatten" : "Ändra med chatt"}
            </button>
          </div>

          {editChat && (
            <div className="mb-6 border border-[var(--border)] rounded-xl p-4 bg-[var(--bg)]">
              <ListingChat
                categories={categories}
                current={formSeed}
                greeting="Hej! Vad vill du ändra på listningen?"
                onDraft={handleBusinessDraft}
              />
            </div>
          )}

          <BusinessForm
            key={formKey}
            categories={categories}
            business={formSeed}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>

        {/* Ads section */}
        <div id="annonser" className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-[var(--primary)]">Annonser</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAdDraft(null); setAdMode(adMode === "chat" ? "none" : "chat"); }}
                className="flex items-center gap-1.5 text-sm text-[var(--accent)] border border-[var(--accent)]/30 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/5 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Skapa med chatt
              </button>
              <button
                onClick={() => { setAdDraft(null); setAdMode(adMode === "form" ? "none" : "form"); }}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Formulär
              </button>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">
            Annonser visas i företagsgalleriet och i AI-assistentens chattflöde — direkt när en kund söker något i din kategori.
          </p>

          {/* Existing ads */}
          {ads.length > 0 && (
            <div className="space-y-3 mb-4">
              {ads.map((ad) => (
                <div key={ad.id} className={`rounded-xl border p-4 ${ad.active ? "border-amber-200 bg-amber-50/50" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--primary)] leading-snug">{ad.headline}</p>
                      {ad.body && <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">{ad.body}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {ad.category_id && (
                          <span className="text-[10px] bg-[var(--bg)] text-[var(--muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                            {categories.find((c) => c.id === ad.category_id)?.name ?? ad.category_id}
                          </span>
                        )}
                        {!ad.category_id && (
                          <span className="text-[10px] bg-[var(--bg)] text-[var(--muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                            Alla kategorier
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ad.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {ad.active ? "Aktiv" : "Pausad"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleToggleAd(ad.id, ad.active)} className="p-1.5 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg transition-colors" title={ad.active ? "Pausa" : "Aktivera"}>
                        {ad.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDeleteAd(ad.id)} className="p-1.5 text-[var(--muted)] hover:text-red-600 border border-[var(--border)] rounded-lg transition-colors" title="Ta bort">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ads.length === 0 && adMode === "none" && (
            <p className="text-sm text-[var(--muted)] italic">Du har inga annonser ännu.</p>
          )}

          {/* Ad creation via chat */}
          {adMode === "chat" && (
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--bg)]">
              <AdChat categories={categories} businessName={business.name} onDraft={handleAdDraft} />
            </div>
          )}

          {/* New ad form (remounts via key when a chat draft prefills it) */}
          {adMode === "form" && (
            <form key={adDraft ? "draft" : "blank"} onSubmit={handleCreateAd} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--bg)]">
              <h3 className="text-sm font-semibold text-[var(--primary)]">
                {adDraft ? "Granska annonsen" : "Ny annons"}
              </h3>
              {adDraft && (
                <p className="text-xs text-[var(--muted)]">Förifyllt från chatten — justera om du vill innan du skapar.</p>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--primary)] mb-1">Rubrik *</label>
                <input
                  name="headline"
                  required
                  defaultValue={adDraft?.headline ?? ""}
                  placeholder='T.ex. "25% rabatt på trallvirke hela juni"'
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--primary)] mb-1">Brödtext (valfri)</label>
                <textarea
                  name="body"
                  rows={2}
                  defaultValue={adDraft?.body ?? ""}
                  placeholder="Kortare beskrivning av erbjudandet..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--primary)] mb-1">Knapptext (valfri)</label>
                  <input
                    name="cta_label"
                    defaultValue={adDraft?.cta_label ?? ""}
                    placeholder="Läs mer"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--primary)] mb-1">Länk (valfri)</label>
                  <input
                    name="cta_url"
                    type="url"
                    defaultValue={adDraft?.cta_url ?? ""}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--primary)] mb-1">Kategori (lämna tomt = visas överallt)</label>
                <select
                  name="category_id"
                  defaultValue={adDraft?.category_id ?? ""}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white"
                >
                  <option value="">Alla kategorier</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--primary)] mb-1">Starttid (valfri)</label>
                  <input
                    name="starts_at"
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--primary)] mb-1">Sluttid (valfri)</label>
                  <input
                    name="ends_at"
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={adSubmitting}
                  className="flex-1 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-60"
                >
                  {adSubmitting ? "Sparar..." : "Skapa annons"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAdMode("none"); setAdDraft(null); }}
                  className="px-4 py-2 border border-[var(--border)] text-sm text-[var(--muted)] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h2 className="font-semibold text-red-700 mb-2">Farlig zon</h2>
          <p className="text-[var(--muted)] text-sm mb-4">
            Att ta bort ett företag kan inte ångras.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              confirmDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-red-300 text-red-600 hover:bg-red-50"
            } disabled:opacity-60`}
          >
            {deleting ? "Tar bort..." : confirmDelete ? "Bekräfta borttagning" : "Ta bort företag"}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="ml-3 text-sm text-[var(--muted)] hover:text-[var(--primary)]"
            >
              Avbryt
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
