"use client";
import { useFormStatus } from "react-dom";
import { Pause, Play, Loader2 } from "lucide-react";

// Submit-knapp för pausa/aktivera-formen på admin-dashboarden. Visar spinner
// medan server-actionen kör — utan den ser knappen död ut i sekunden innan
// sidan revalideras och användaren hinner klicka igen.
export default function ToggleActiveButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="p-2.5 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg transition-colors disabled:opacity-50"
      title={active ? "Pausa företaget" : "Aktivera företaget"}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : active ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
    </button>
  );
}
