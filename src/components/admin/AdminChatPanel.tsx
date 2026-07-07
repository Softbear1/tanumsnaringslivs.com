"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { ChatMessage, toApiMessages } from "@/lib/chat";

type Props<T> = {
  endpoint: string;
  greeting: string;
  hint: string;
  placeholder?: string;
  // Extra fields merged into the request body alongside `messages`.
  body: Record<string, unknown>;
  // Pull a finished result (and the visible text) out of the streamed reply.
  parse: (fullText: string) => { clean: string; result: T | null };
  onResult: (result: T) => void;
};

// Streaming admin chat panel shared by the listing- and ad-onboarding flows.
// Each caller supplies its endpoint, request body, and a parser for the
// trailing result marker.
export default function AdminChatPanel<T>({
  endpoint, greeting, hint, placeholder, body, parse, onResult,
}: Props<T>) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scrolla ENDAST meddelandelistan — scrollIntoView drar med sig hela
    // sidan (särskilt illa på iOS när tangentbordet öppnas och fokus flyttar
    // vyn så att chatten hamnar utanför skärmen).
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function sendToAI(msgs: ChatMessage[]) {
    setStreaming(true);
    let fullText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(msgs), ...body }),
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
                updated[updated.length - 1] = { role: "assistant", content: parse(fullText).clean };
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
      const { result } = parse(fullText);
      if (result) onResult(result);
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
    <div className="flex flex-col h-[28rem] max-h-[70vh]">
      <div className="flex items-center gap-2 mb-3 text-sm text-[var(--muted)]">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        {hint}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
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
      </div>

      <div className="border-t border-[var(--border)] pt-3 mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={placeholder ?? "Skriv här..."}
          disabled={streaming}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || streaming}
          className="p-2.5 bg-[var(--brand)] text-white rounded-xl hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-40"
        >
          {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
