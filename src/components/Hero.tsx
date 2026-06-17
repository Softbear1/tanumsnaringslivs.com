"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Sparkles } from "lucide-react";
import type { SeasonTheme } from "@/lib/season";
import type { Business, Category } from "@/lib/data";
import type { Ad } from "./AdCard";

const PLACEHOLDERS = [
  "Sök företag eller kategori...",
  "Vilket café har bäst frukost i Fjällbacka?",
  "Sök företag eller kategori...",
  "Letar efter snickare i Grebbestad...",
  "Sök företag eller kategori...",
  "Bästa restaurangen med havsvy?",
  "Sök företag eller kategori...",
  "VVS-firma nära Hamburgsund?",
];

type Props = {
  search: string;
  onSearch: (v: string) => void;
  onStartChat: (message: string) => void;
  theme: SeasonTheme;
  businesses: Business[];
  categories: Category[];
  ads: Ad[];
};

export default function Hero({ search, onSearch, onStartChat, theme }: Props) {
  const [value, setValue] = useState(search);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder when idle
  useEffect(() => {
    if (focused || value) return;
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 200);
    }, 2500);
    return () => clearInterval(id);
  }, [focused, value]);

  // Keep local value in sync when search is cleared externally
  useEffect(() => { setValue(search); }, [search]);

  function handleChange(v: string) {
    setValue(v);
    // Typing naturally → filter mode
    onSearch(v);
  }

  function handleSubmit() {
    const text = value.trim();
    if (!text) return;
    // If it looks like a question rather than a keyword, open AI chat
    if (text.length > 20 || /\?|vill|letar|söker|behöver|hjälp|bästa/i.test(text)) {
      setValue("");
      onSearch("");
      onStartChat(text);
    }
    // else: already filtered by onSearch — no action needed
  }

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--primary)] text-white" style={{ borderTop: `4px solid ${theme.accent}` }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }} />
      <div className="absolute -top-32 -right-32 w-96 h-96 opacity-20 rounded-full blur-3xl" style={{ backgroundColor: theme.glow }} />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#1B3A4B] opacity-30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Tanums lokala företag
          </h1>
          <span className="text-2xl" aria-hidden>{theme.emoji}</span>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholderVisible ? PLACEHOLDERS[placeholderIdx] : ""}
            aria-label="Sök bland företag eller ställ en fråga"
            className="w-full pl-12 pr-14 py-4 rounded-xl bg-white text-[var(--primary)] placeholder:text-[var(--muted)] text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
          />
          {/* AI-trigger button — subtle sparkle icon */}
          <button
            onClick={() => { if (value.trim()) { handleSubmit(); } else { onStartChat("Vad kan du hjälpa mig med?"); } }}
            aria-label="Fråga AI:n"
            title="Fråga AI:n"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/50 mt-2.5">
          Skriv ett namn eller en kategori — eller ställ en fråga med ✨
        </p>
      </div>
    </section>
  );
}
