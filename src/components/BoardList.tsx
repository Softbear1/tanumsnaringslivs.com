"use client";
import { useState } from "react";
import { Phone, Plus } from "lucide-react";
import Link from "next/link";
import { BOARD_CATEGORIES } from "@/lib/chat";
import EmptyState from "@/components/EmptyState";
import { StickyNote } from "lucide-react";

export interface BoardAd {
  id: string;
  category: string;
  title: string;
  body: string;
  contact_phone: string | null;
  created_at: string;
}

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Idag";
  if (d === 1) return "Igår";
  return `${d} dagar sedan`;
}

export default function BoardList({ ads }: { ads: BoardAd[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? ads.filter((a) => a.category === filter) : ads;
  const usedCategories = new Set(ads.map((a) => a.category));

  return (
    <div>
      {/* Kategorichips — samma mönster som katalogen */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        <button
          onClick={() => setFilter(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === null ? "bg-[var(--brand)] text-white" : "bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)]"
          }`}
        >
          Alla
        </button>
        {BOARD_CATEGORIES.filter((c) => usedCategories.has(c.id)).map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(filter === c.id ? null : c.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === c.id ? "bg-[var(--brand)] text-white" : "bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)]"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)]">
          <EmptyState
            icon={<StickyNote className="w-10 h-10" />}
            title="Inga annonser här ännu"
            subtitle="Bli först — det är gratis och tar ett par minuter."
            action={{ label: "Lämna in en annons", href: "/anslagstavlan/ny" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((ad) => (
            <div key={ad.id} className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-5 flex flex-col">
              <span className="self-start text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--brand-hover)] mb-2.5">
                {BOARD_CATEGORIES.find((c) => c.id === ad.category)?.name ?? ad.category}
              </span>
              {/* Tidnings-stil: rubrik i versaler, kompakt text */}
              <h3 className="font-bold text-sm text-[var(--primary)] uppercase tracking-wide leading-snug mb-1.5">
                {ad.title}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap flex-1">{ad.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                {ad.contact_phone ? (
                  <a
                    href={`tel:${ad.contact_phone.replace(/[\s-]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> {ad.contact_phone}
                  </a>
                ) : <span />}
                <span className="text-[11px] text-[var(--muted)]">{daysAgo(ad.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/anslagstavlan/ny"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand)] text-white font-medium text-sm hover:bg-[var(--brand-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Lämna in en annons — gratis
        </Link>
      </div>
    </div>
  );
}
