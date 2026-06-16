"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { ChatMessage, BusinessDraft, extractDraft, toApiMessages } from "@/lib/chat";

type Props = {
  categories: Array<{ id: string; name: string }>;
  onDraft: (draft: BusinessDraft) => void;
};

// Conversational onboarding: the owner describes their business and the
// assistant assembles a listing draft, which is handed to a prefilled form for
// review. Saves the owner from filling in a form field by field.
export default function ListingChat({ categories, onDraft }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hej! Berätta vad ditt företag heter och vad ni gör, så fixar jag listningen åt dig." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendToAI(msgs: ChatMessage[]) {
    setStreaming(true);
    let fullText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/listing-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(msgs),
          categories: categories.map((c) => ({ id: c.id, name: c.name })),
        }),
      });

      if (!res.ok || !res.body) {
        let detail = "";
        try {
          const body = (await res.json()) as { error?: unknown };
          detail = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
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
                const { clean } = extractDraft(fullText);
                updated[updated.length - 1] = { role: "assistant", content: clean };
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
      const { draft } = extractDraft(fullText);
      if (draft) onDraft(draft);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    await sendToAI(next);
  }

  return (
    <div className="flex flex-col h-[28rem]">
      <div className="flex items-center gap-2 mb-3 text-sm text-[var(--muted)]">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        Beskriv ditt företag i chatten — du får granska allt innan det sparas.
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--border)] pt-3 mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Skriv här..."
          disabled={streaming}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || streaming}
          className="p-2.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-40"
        >
          {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
