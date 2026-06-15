"use client";
export const runtime = "edge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { staticCategories } from "@/lib/data";
import BusinessForm from "@/components/admin/BusinessForm";
import { ArrowLeft } from "lucide-react";

export default function NyttForetagPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createBrowserClient();

  async function handleSubmit(data: {
    name: string; category_id: string; description: string;
    phone: string; email: string; website: string; address: string; initials: string;
  }) {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/admin/logga-in"); return; }

    const { error } = await supabase.from("businesses").insert({
      ...data,
      website: data.website || null,
      owner_id: user.id,
      boosted: false,
      featured: false,
      rating: 0,
      review_count: 0,
      active: true,
    });

    if (error) {
      setError("Något gick fel. Försök igen.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <a href="/admin" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till mina företag
        </a>
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">Lägg till företag</h1>
        <p className="text-sm text-[var(--muted)] mb-8">Fyll i uppgifterna nedan så visas ditt företag i katalogen.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-white rounded-2xl card-shadow p-6">
          <BusinessForm
            categories={staticCategories}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
