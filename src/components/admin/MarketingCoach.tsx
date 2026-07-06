"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Sparkles } from "lucide-react";
import { ChatMessage, toApiMessages } from "@/lib/chat";

type Props = {
  businessNames: string[];
};

const GREETING =
  "Hej, jag heter Elias! 👋 Jag hjälper dig att synas och få fler kunder här i Tanum. Vill du ha fler kunder, en vassare annons, eller idéer inför säsongen?";

const SUGGESTIONS = [
  "Hur får jag fler kunder?",
  "Skriv ett blixterbjudande åt mig",
  "Tips inför sommarsäsongen",
];

// Elias — en flytande marknadsföringscoach i admin-portalen. Ren konversation,
// inget strukturerat resultat. Streamar svar från /api/coach.
export default function MarketingCoach({ businessNames }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendToAI(msgs: ChatMessage[]) {
    setStreaming(true);
    let fullText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(msgs), businessNames }),
      });

      if (!res.ok || !res.body) {
        let detail = "";
        try {
          const b = (await res.json()) as { error?: unknown };
          detail = typeof b.error === "string" ? b.error : JSON.stringify(b.error);
        } catch { /* non-JSON */ }
        throw new Error(detail || `AI-tjänsten svarade med fel (${res.status})`);
      }

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
                updated[updated.length - 1] = { role: "assistant", content: fullText };
                return updated;
              });
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: detail ? `Något gick fel: ${detail}` : "Något gick fel. Försök igen.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    await sendToAI(next);
  }

  return (
    <>
      {/* Flytande knapp */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 max-w-[calc(100vw-2rem)] bg-[var(--brand)] text-white pl-3 pr-5 py-2.5 rounded-2xl shadow-lg hover:bg-[var(--brand-hover)] hover:scale-[1.02] transition-all duration-200 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label="Öppna Elias – din marknadsföringscoach"
      >
        <span className="relative shrink-0 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-semibold">
          E
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--primary)]" />
        </span>
        <span className="flex flex-col items-start leading-tight text-left min-w-0">
          <span className="text-sm font-bold">Fråga Elias</span>
          <span className="text-[11px] text-white/75 truncate max-w-full">Din marknadsföringscoach</span>
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[min(420px,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col overflow-hidden"
          style={{ maxHeight: "min(600px, calc(100vh - 48px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-[var(--brand)] text-white px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-semibold shrink-0">E</span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">Elias</p>
                <p className="text-[11px] text-white/70 leading-tight">Marknadsföringscoach</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Stäng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meddelanden */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[var(--brand)] text-white rounded-tr-sm"
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

            {/* Snabbförslag — bara innan första frågan */}
            {messages.length === 1 && !streaming && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs text-[var(--primary)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg)] transition-colors px-3 py-1.5 rounded-full"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Inmatning */}
          <div className="border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-1.5 mb-2 text-[11px] text-[var(--muted)]">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              Råd från Elias är generella tips — använd ditt eget omdöme.
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
                placeholder="Skriv din fråga..."
                disabled={streaming}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="p-2.5 bg-[var(--brand)] text-white rounded-xl hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-40"
              >
                {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
