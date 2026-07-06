import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="text-center py-16 text-[var(--muted)]">
      {icon && <div className="mb-4 flex justify-center opacity-30">{icon}</div>}
      <p className="font-medium text-[var(--primary)]">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
      {action && (
        <a
          href={action.href}
          className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[var(--brand)] text-white text-sm font-medium hover:bg-[var(--brand-hover)] transition-colors"
        >
          {action.label} →
        </a>
      )}
    </div>
  );
}
