"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { Business, Category } from "@/lib/data";
import { ChatMessage, ReadyPayload, extractReady, toApiMessages } from "@/lib/chat";
import AdCard, { Ad } from "./AdCard";
import type { FlashDeal } from "./FlashDeals";
import Link from "next/link";

type Props = {
  businesses: Business[];
  categories: Category[];
  ads: Ad[];
  deals?: FlashDeal[];
  greeting?: string;
  onClose?: () => void;
  initialMessage?: string;
};

export default function ChatPanel({ businesses, categories, ads, deals = [], greeting, onClose, initialMessage }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: greeting || "Hej! Vilket företag letar du efter?" },
  ]);
  const sentInitial = useRef(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [ready, setReady] = useState<ReadyPayload | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, ready]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 80);
  }, []);

  useEffect(() => {
    if (!initialMessage || sentInitial.current) return;
    sentInitial.current = true;
    const first: ChatMessage[] = [
      { role: "assistant", content: greeting || "Hej! Vilket företag letar du efter?" },
      { role: "user", content: initialMessage },
    ];
    setMessages(first);
    sendToAI(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendToAI(msgs: ChatMessage[]) {
    setStreaming(true);
    const bizForAI = businesses.map((b) => ({ id: b.id, name: b.name, categoryId: b.categoryId, description: b.description }));
    const catForAI = categories.map((c) => ({ id: c.id, name: c.name }));
    const offersForAI = [
      ...ads.map((a) => ({
        business_name: a.business_name,
        headline: a.headline,
        body: a.body,
        kind: "annons" as const,
      })),
      ...deals.map((d) => ({
        business_name: d.business_name,
        headline: d.headline,
        body: d.description,
        kind: "blixt" as const,
      })),
    ];
    let fullText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(msgs), businesses: bizForAI, categories: catForAI, offers: offersForAI }),
      });

      if (!res.ok || !res.body) throw new Error("Fel från AI");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.delta?.text ?? parsed?.content?.[0]?.text ?? "";
            if (delta) {
              fullText += delta;
              setMessages((prev) => {
                const updated = [...prev];
                const { clean } = extractReady(fullText);
                updated[updated.length - 1] = { role: "assistant", content: clean };
                return updated;
              });
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Något gick fel. Försök igen." };
        return updated;
      });
    } finally {
      setStreaming(false);
      const { payload } = extractReady(fullText);
      if (payload) setReady(payload);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setReady(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    await sendToAI(next);
  }

  const matchedBusinesses = businesses.filter((b) => ready?.businessIds.includes(b.id));
  const chatAd = ready
    ? (ads.find((a) => a.category_id === ready.categoryId) ?? ads.find((a) => !a.category_id) ?? null)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[var(--primary)] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="text-sm font-semibold">Hitta rätt företag</div>
        {onClose && (
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Stäng">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[var(--primary)] text-white rounded-tr-sm"
                : "bg-[var(--bg)] text-[var(--primary)] rounded-tl-sm"
            }`}>
              {msg.content || (streaming && i === messages.length - 1 ? (
                <span className="flex gap-1 items-center py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : "")}
            </div>
          </div>
        ))}

        {/* Matched businesses */}
        {matchedBusinesses.length > 0 && (
          <div className="space-y-2">
            {matchedBusinesses.map((b) => (
              <Link
                key={b.id}
                href={`/foretag/${b.id}`}
                className="flex items-center gap-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 hover:border-[var(--accent)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-xs font-bold shrink-0 text-[var(--primary)]">
                  {b.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">{b.name}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{b.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {chatAd && <AdCard ad={chatAd} variant="chat" />}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] px-3 py-3 shrink-0 flex gap-2 bg-white">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Skriv vad du letar efter..."
          disabled={streaming}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-[16px] text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
        />
        <button onClick={handleSend} disabled={!input.trim() || streaming}
          className="p-2.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
