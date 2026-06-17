"use client";
import { useState, useEffect } from "react";
import { Zap, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { trackOfferClick } from "@/lib/track";

export type FlashDeal = {
  id: string;
  headline: string;
  description: string | null;
  business_id: string;
  business_name: string;
  business_initials: string;
  business_logo?: string | null;
};

export type FlashTeaser = {
  id: string;
  business_name: string;
  business_initials: string;
  business_logo?: string | null;
  dayLabel: string;
};

function BizBadge({ logo, initials, name }: { logo?: string | null; initials: string; name: string }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0 overflow-hidden">
      {logo ? (
        <Image src={logo} alt={`${name} logotyp`} width={32} height={32} className="object-contain w-full h-full" />
      ) : (
        initials
      )}
    </div>
  );
}

type Props = {
  deals: FlashDeal[];
  teasers: FlashTeaser[];
  /** ISO-tidpunkt då dagens erbjudanden går ut (svensk midnatt). */
  endsAt: string;
};

function useCountdown(endsAt: string): { h: string; m: string; s: string; done: boolean } {
  const [remaining, setRemaining] = useState(() => new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(endsAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const done = remaining <= 0;
  const total = Math.max(0, Math.floor(remaining / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s), done };
}

function Countdown({ endsAt }: { endsAt: string }) {
  const { h, m, s, done } = useCountdown(endsAt);
  if (done) {
    return <span className="text-xs font-semibold text-[var(--muted)]">Avslutat</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm font-bold text-red-600 tabular-nums">
      {h}:{m}:{s}
    </span>
  );
}

export default function FlashDeals({ deals, teasers, endsAt }: Props) {
  if (deals.length === 0 && teasers.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-amber-50 to-white border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 text-white shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </span>
          <h2 className="text-lg font-bold text-[var(--primary)]">Blixterbjudanden</h2>
          {deals.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
              Slut idag · <Countdown endsAt={endsAt} />
            </span>
          )}
        </div>

        {/* Today's live deals */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={`/foretag/${deal.business_id}`}
                onClick={() => trackOfferClick(deal.id, deal.business_id, "flash")}
                className="group relative bg-white rounded-2xl border border-amber-200 p-4 hover:border-amber-400 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-bl-lg">
                  Blixt
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <BizBadge logo={deal.business_logo} initials={deal.business_initials} name={deal.business_name} />
                  <p className="text-xs font-medium text-[var(--muted)] truncate">{deal.business_name}</p>
                </div>
                <p className="font-bold text-[var(--primary)] leading-snug mb-1 line-clamp-2">{deal.headline}</p>
                {deal.description && (
                  <p className="text-sm text-[var(--muted)] line-clamp-2 mb-2">{deal.description}</p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 group-hover:gap-1.5 transition-all">
                  Se erbjudandet <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)] mb-2">Inga blixterbjudanden just nu — men kolla in vad som kommer:</p>
        )}

        {/* Upcoming teasers — who, but not what */}
        {teasers.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-2.5 text-sm font-semibold text-[var(--primary)]">
              <Eye className="w-4 h-4 text-amber-600" />
              Snart: håll utkik
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {teasers.map((t) => (
                <div
                  key={t.id}
                  className="shrink-0 flex items-center gap-2.5 bg-white border border-dashed border-amber-300 rounded-xl px-3 py-2.5"
                  title="Erbjudandet avslöjas den dagen"
                >
                  <BizBadge logo={t.business_logo} initials={t.business_initials} name={t.business_name} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--primary)] truncate max-w-[10rem]">{t.business_name}</p>
                    <p className="text-[11px] font-medium text-amber-600">⚡ Blixterbjudande {t.dayLabel.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Länk till alla blixterbjudanden */}
        <div className="mt-5">
          <Link
            href="/blixterbjudanden"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-white border border-amber-300 px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors"
          >
            Se alla blixterbjudanden <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
