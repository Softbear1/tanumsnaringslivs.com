"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Trash2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

// Modereringsknappar (pausa/aktivera + ta bort) för super-admins deal- och
// annonstabeller. Skriver via webbläsarklienten — RLS-policyerna i
// supabase/add_superadmin_rls.sql släpper igenom super-admin-kontot.
// Ersätter server action-formulär som svarar 404 på Cloudflare Pages.
export default function SuperModButtons({
  table,
  id,
  active,
}: {
  table: "flash_deals" | "ads";
  id: string;
  active: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    const supabase = createBrowserClient();
    await supabase.from(table).update({ active: !active }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    const supabase = createBrowserClient();
    await supabase.from(table).delete().eq("id", id);
    setBusy(false);
    setConfirm(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={toggle}
        disabled={busy}
        className="p-2 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg disabled:opacity-50"
        title={active ? "Pausa" : "Aktivera"}
      >
        {active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className={`p-2 border rounded-lg disabled:opacity-50 ${
          confirm ? "bg-red-600 text-white border-red-600" : "text-[var(--muted)] hover:text-red-600 border-[var(--border)]"
        }`}
        title={confirm ? "Klicka igen för att bekräfta" : "Ta bort"}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
