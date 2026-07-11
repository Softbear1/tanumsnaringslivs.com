"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

// Pausa/aktivera på admin-dashboardens företagskort. Skriver direkt via
// webbläsarklienten (RLS släpper igenom ägarens uppdatering) — server actions
// svarar 404 på Cloudflare Pages-deployen. Text + ikon: en ensam paus-ikon
// läses lätt som status ("är pausad") när den betyder handlingen.
export default function ToggleActiveButton({ businessId, active }: { businessId: string; active: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setPending(true);
    setError(false);
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("businesses")
      .update({ active: !active })
      .eq("id", businessId);
    setPending(false);
    if (error) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg transition-colors disabled:opacity-50"
      title={error ? "Kunde inte ändra status. Försök igen." : undefined}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : active ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      {pending ? "Sparar…" : error ? "Försök igen" : active ? "Pausa" : "Aktivera"}
    </button>
  );
}
