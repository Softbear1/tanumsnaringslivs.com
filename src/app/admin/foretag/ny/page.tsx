"use client";
export const runtime = "edge";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import BusinessForm from "@/components/admin/BusinessForm";
import ListingChat from "@/components/admin/ListingChat";
import type { BusinessDraft } from "@/lib/chat";
import Link from "next/link";

export default function NyForetagPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  // "chat" = conversational onboarding, "form" = manual entry. A draft from the
  // chat flips us to the prefilled form for review.
  const [mode, setMode] = useState<"chat" | "form">("chat");
  const [draft, setDraft] = useState<BusinessDraft | null>(null);

  // Load categories on first render
  if (!loaded) {
    setLoaded(true);
    const supabase = createBrowserClient();
    supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }

  function handleDraft(d: BusinessDraft) {
    // Keep only categories that actually exist; the form lets the owner fix the rest.
    const valid = categories.some((c) => c.id === d.category_id);
    setDraft({ ...d, category_id: valid ? d.category_id : "" });
    setMode("form");
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Inte inloggad");

    const { error } = await supabase.from("businesses").insert({
      ...data,
      owner_id: user.id,
    });

    setLoading(false);
    if (error) throw new Error(error.message);
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--brand)] text-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold">Lägg till företag</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
          {mode === "chat" ? (
            <>
              <ListingChat categories={categories} onDraft={handleDraft} />
              <button
                onClick={() => setMode("form")}
                className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
              >
                Föredrar du formulär? Fyll i manuellt →
              </button>
            </>
          ) : (
            <>
              {draft && (
                <div className="mb-5 p-3 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20 text-sm text-[var(--primary)]">
                  Jag har fyllt i utifrån vårt samtal — granska och justera innan du sparar.
                </div>
              )}
              <BusinessForm
                categories={categories}
                business={draft ?? undefined}
                onSubmit={handleSubmit}
                loading={loading}
              />
              <button
                onClick={() => setMode("chat")}
                className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
              >
                ← Tillbaka till chatten
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
