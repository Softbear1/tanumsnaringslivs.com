"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Category, Business } from "@/lib/data";
import BusinessForm from "@/components/admin/BusinessForm";
import { ArrowLeft, Trash2 } from "lucide-react";

type Props = { business: Business; categories: Category[] };

export default function EditForetagClient({ business, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const supabase = createBrowserClient();

  async function handleSubmit(data: {
    name: string; category_id: string; description: string;
    phone: string; email: string; website: string; address: string; initials: string;
  }) {
    setLoading(true);
    setError("");
    const { error } = await supabase
      .from("businesses")
      .update({ ...data, website: data.website || null })
      .eq("id", business.id);

    if (error) {
      setError("Något gick fel. Försök igen.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("businesses").delete().eq("id", business.id);
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <a href="/admin" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till mina företag
        </a>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary)] mb-1">Redigera företag</h1>
            <p className="text-sm text-[var(--muted)]">{business.name}</p>
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Ta bort
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 font-medium">Säker?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Tar bort..." : "Ja, ta bort"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl card-shadow p-6">
          <BusinessForm
            categories={categories}
            business={business}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
