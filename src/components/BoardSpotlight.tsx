import Link from "next/link";
import { StickyNote, ArrowRight } from "lucide-react";
import { BOARD_CATEGORIES } from "@/lib/chat";
import type { BoardAd } from "@/components/BoardList";

// "Från anslagstavlan" på startsidan — de senaste radannonserna som
// återkommande besöksskäl, precis som tidningens tavla bläddras till.
export default function BoardSpotlight({ ads }: { ads: BoardAd[] }) {
  if (!ads.length) return null;
  return (
    <section className="bg-[var(--hover-bg)] border-t border-[var(--border)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[var(--granit-500)]" />
            <h2 className="font-semibold text-[var(--primary)] text-base">Från anslagstavlan</h2>
          </div>
          <Link href="/anslagstavlan" className="flex items-center gap-1 text-sm text-[var(--brand)] font-medium hover:underline">
            Se alla <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ads.slice(0, 4).map((ad) => (
            <Link
              key={ad.id}
              href="/anslagstavlan"
              className="bg-white rounded-xl border border-[var(--border)] card-shadow hover:card-shadow-hover transition-shadow p-4"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--granit-700)]">
                {BOARD_CATEGORIES.find((c) => c.id === ad.category)?.name ?? ad.category}
              </span>
              <p className="font-bold text-sm text-[var(--primary)] uppercase tracking-wide leading-snug mt-1 line-clamp-1">
                {ad.title}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{ad.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
