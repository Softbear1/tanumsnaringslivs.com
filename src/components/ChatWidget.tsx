"use client";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Business, Category } from "@/lib/data";
import type { Ad } from "./AdCard";
import type { FlashDeal } from "./FlashDeals";
import ChatPanel from "./ChatPanel";

type Props = {
  businesses: Business[];
  categories: Category[];
  ads: Ad[];
  deals?: FlashDeal[];
  greeting?: string;
};

export default function ChatWidget({ businesses, categories, ads, deals, greeting }: Props) {
  const [open, setOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const obs = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.1 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // Lock body scroll while chat is open (prevents page showing through on iOS)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() { setOpen(false); }

  return (
    <>
      {/* Floating button — hidden while the hero chat is in view */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 max-w-[calc(100vw-2rem)] bg-[var(--brand)] text-white pl-4 pr-5 py-3 rounded-2xl shadow-lg hover:bg-[var(--brand-hover)] hover:scale-[1.02] transition-all duration-200 ${open || heroVisible ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label="Chatta med oss – hitta rätt företag"
      >
        <div className="relative shrink-0">
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--primary)]" />
        </div>
        <span className="flex flex-col items-start leading-tight text-left min-w-0">
          <span className="text-sm font-bold">Hitta rätt företag</span>
          <span className="text-[11px] text-white/75 truncate max-w-full">Beskriv vad du behöver hjälp med</span>
        </span>
      </button>

      {open && (
        <>
          {/* Mobile: true full-screen using dvh so the panel shrinks when keyboard opens */}
          <div
            className="sm:hidden fixed inset-x-0 top-0 z-50 bg-white flex flex-col"
            style={{ height: "100dvh" }}
          >
            <ChatPanel businesses={businesses} categories={categories} ads={ads} deals={deals} greeting={greeting} onClose={close} />
          </div>
          {/* Desktop: floating panel */}
          <div
            className="hidden sm:flex fixed bottom-6 right-6 z-50 w-[420px] bg-white rounded-2xl shadow-2xl border border-[var(--border)] flex-col overflow-hidden"
            style={{ maxHeight: "min(600px, calc(100vh - 48px))" }}
          >
            <ChatPanel businesses={businesses} categories={categories} ads={ads} deals={deals} greeting={greeting} onClose={close} />
          </div>
        </>
      )}
    </>
  );
}
