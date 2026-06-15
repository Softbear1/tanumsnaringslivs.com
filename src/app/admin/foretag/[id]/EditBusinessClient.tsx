"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import BusinessForm from "@/components/admin/BusinessForm";
import Link from "next/link";

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
}

export default function EditBusinessClient({ business, categories }: Props) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
          <BusinessForm
            categories={categories}
            business={business}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>

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
