"use client";
export const runtime = "edge";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import BusinessForm from "@/components/admin/BusinessForm";
import Link from "next/link";

export default function NyForetagPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  // Load categories on first render
  if (!loaded) {
    setLoaded(true);
    const supabase = createBrowserClient();
    supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
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
      <header className="bg-[var(--primary)] text-white shadow">
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
          <BusinessForm
            categories={categories}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
