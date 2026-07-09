import { Check, Mail, MousePointerClick, BadgeCheck, Pencil } from "lucide-react";

// Bearbetnings-timeline för inbjudningskampanjen: mejl skickat → mejl klickat
// → profil claimad → information uppdaterad. Prickar på rad med kopplingslinje,
// ifyllda = klart (som en spelnivå), tomma = kvarstår.
export interface TimelineState {
  sent: boolean;
  clicked: boolean;
  claimed: boolean;
  updated: boolean;
}

const STEPS: { key: keyof TimelineState; label: string; icon: typeof Mail }[] = [
  { key: "sent", label: "Mejl skickat", icon: Mail },
  { key: "clicked", label: "Mejl klickat", icon: MousePointerClick },
  { key: "claimed", label: "Profil claimad", icon: BadgeCheck },
  { key: "updated", label: "Info uppdaterad", icon: Pencil },
];

export default function CampaignTimeline({ state }: { state: TimelineState }) {
  return (
    <div className="flex items-center gap-0.5" title={STEPS.map((s) => `${s.label}: ${state[s.key] ? "✓" : "–"}`).join("  ·  ")}>
      {STEPS.map((step, i) => {
        const done = state[step.key];
        const Icon = done ? Check : step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 transition-colors ${
                done ? "bg-[var(--brand)] text-white" : "bg-[var(--hover-bg)] text-[var(--muted)] border border-[var(--border)]"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
            </span>
            {i < STEPS.length - 1 && (
              <span className={`w-3 h-0.5 ${state[STEPS[i + 1].key] ? "bg-[var(--brand)]" : "bg-[var(--border)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
