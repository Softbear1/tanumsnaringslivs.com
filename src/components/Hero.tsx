"use client";
import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";
import type { SeasonTheme } from "@/lib/season";
import type { Business, Category } from "@/lib/data";
import type { Ad } from "./AdCard";

const CHAT_EXAMPLES = [
  "Jag behöver måla om huset innan vintern...",
  "Kan någon hjälpa mig laga taket efter stormen?",
  "Letar efter en frisör i Grebbestad som fixar herrklippning",
  "Vill boka bord på en restaurang med utsikt i Fjällbacka",
  "Behöver hjälp med VVS — kranen i köket läcker",
  "Söker snickare för altanbygge, ca 20 kvm",
  "Vilket café har bäst frukost i Tanumshede?",
  "Behöver en elektriker — ska installera laddbox",
  "Letar efter städfirma som kan komma varannan vecka",
  "Söker massör eller naprapat i Hamburgsund",
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
  const [mode, setMode] = useState<"search" | "chat">("search");
  const [chatInput, setChatInput] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder every 2s when user isn't typing
  useEffect(() => {
    if (mode !== "chat" || userTyping) return;
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % CHAT_EXAMPLES.length);
        setPlaceholderVisible(true);
      }, 200);
    }, 2000);
    return () => clearInterval(id);
  }, [mode, userTyping]);

  function handleChatSubmit() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    setUserTyping(false);
    onStartChat(text);
  }

  function handleModeSwitch(m: "search" | "chat") {
    setMode(m);
    if (m === "chat") {
      setUserTyping(false);
      setTimeout(() => chatInputRef.current?.focus(), 80);
    }
  }

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--primary)] text-white" style={{ borderTop: `4px solid ${theme.accent}` }}>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }} />
      {/* Seasonal glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 opacity-20 rounded-full blur-3xl" style={{ backgroundColor: theme.glow }} />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#1B3A4B] opacity-30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Headline row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Tanums lokala företag
          </h1>
          <span className="text-2xl" aria-hidden>{theme.emoji}</span>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit mb-4">
          <button
            onClick={() => handleModeSwitch("search")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "search" ? "bg-white text-[var(--primary)] shadow-sm" : "text-white/70 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            Sök
          </button>
          <button
            onClick={() => handleModeSwitch("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "chat" ? "bg-white text-[var(--primary)] shadow-sm" : "text-white/70 hover:text-white"
            }`}
          >
            <span className="text-base leading-none">✨</span>
            Få offert
          </button>
        </div>

        {/* Search input */}
        {mode === "search" && (
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Sök företag eller kategori..."
              aria-label="Sök bland företag"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-[var(--primary)] placeholder:text-[var(--muted)] text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
            />
          </div>
        )}

        {/* Chat trigger input */}
        {mode === "chat" && (
          <div className="relative max-w-xl">
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => { setChatInput(e.target.value); setUserTyping(true); }}
              onFocus={() => setUserTyping(true)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
              placeholder={placeholderVisible ? CHAT_EXAMPLES[placeholderIdx] : ""}
              aria-label="Beskriv vad du behöver"
              className="w-full pl-4 pr-14 py-4 rounded-xl bg-white text-[var(--primary)] placeholder:text-[var(--muted)]/70 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              style={{ caretColor: "var(--primary)" }}
            />
            <button
              onClick={handleChatSubmit}
              disabled={!chatInput.trim()}
              aria-label="Skicka"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/80 transition-colors disabled:opacity-40"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
