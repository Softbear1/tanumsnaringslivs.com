"use client";
import { ExternalLink } from "lucide-react";
import { trackOfferClick } from "@/lib/track";

export interface Ad {
  id: string;
  headline: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  category_id: string | null;
  business_id: string;
  business_name: string;
  business_initials: string;
}

interface Props {
  ad: Ad;
  /** "gallery" renders a full-height card matching BusinessCard; "chat" renders compact inline */
  variant?: "gallery" | "chat";
}

export default function AdCard({ ad, variant = "gallery" }: Props) {
  if (variant === "chat") {
    return (
      <div className="relative bg-[var(--boost-bg)] border border-[var(--boost-border)] rounded-2xl p-4">
        <span className="absolute top-2.5 right-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--boost)]">Annons</span>
        <div className="flex items-center gap-2.5 mb-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--boost-border)] text-[var(--boost)] flex items-center justify-center text-xs font-bold shrink-0">
            {ad.business_initials}
          </div>
          <span className="text-xs font-medium text-[var(--primary)] truncate">{ad.business_name}</span>
        </div>
        <p className="text-sm font-semibold text-[var(--primary)] leading-snug mb-1">{ad.headline}</p>
        {ad.body && <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">{ad.body}</p>}
        {ad.cta_url && ad.cta_label && (
          <a
            href={ad.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOfferClick(ad.id, ad.business_id, "ad")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--boost)] bg-[var(--boost-border)] hover:bg-[var(--boost-border)] px-3 py-1.5 rounded-lg transition-colors"
          >
            {ad.cta_label}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden card-shadow border border-[var(--boost-border)] transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Color strip */}
      <div className="h-1 w-full bg-[var(--sol-500)]" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[var(--boost-bg)] text-[var(--boost)] flex items-center justify-center font-bold text-sm flex-shrink-0">
              {ad.business_initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--primary)] text-base leading-tight line-clamp-2">{ad.business_name}</h3>
              <span className="inline-block text-[11px] font-medium mt-1 px-2 py-0.5 rounded-full bg-[var(--boost-bg)] text-[var(--boost)]">
                Annons
              </span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <p className="text-sm font-semibold text-[var(--primary)] leading-snug mb-2">{ad.headline}</p>

        {/* Body */}
        {ad.body && (
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">{ad.body}</p>
        )}

        <div className="flex-1" />

        {ad.cta_url && ad.cta_label && (
          <>
            <div className="border-t border-[var(--border)] mb-4" />
            <a
              href={ad.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfferClick(ad.id, ad.business_id, "ad")}
              className="flex items-center justify-center gap-2 w-full text-center text-sm font-medium text-[var(--boost)] border border-[var(--boost-border)] rounded-xl py-2.5 hover:bg-[var(--boost-bg)] transition-colors"
            >
              {ad.cta_label}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
