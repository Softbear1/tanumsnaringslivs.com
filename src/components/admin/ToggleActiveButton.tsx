"use client";
import { useFormStatus } from "react-dom";
import { Pause, Play, Loader2 } from "lucide-react";

// Pausa/aktivera på admin-dashboardens företagskort. Text + ikon: en ensam
// paus-ikon läses lätt som status ("är pausad") när den betyder handlingen
// ("tryck för att pausa"). Spinner medan server-actionen kör.
export default function ToggleActiveButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : active ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      {pending ? "Sparar…" : active ? "Pausa" : "Aktivera"}
    </button>
  );
}
