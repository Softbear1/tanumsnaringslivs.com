"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, CheckCircle } from "lucide-react";
import { Business, Category } from "@/lib/data";
import { ChatMessage, ReadyPayload, extractReady, toApiMessages } from "@/lib/chat";

type Props = {
  businesses: Business[];
  categories: Category[];
};

type Step = "chat" | "contact" | "confirm" | "done";

export default function ChatWidget({ businesses, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [ready, setReady] = useState<ReadyPayload | null>(null);
  const [step, setStep] = useState<Step>("chat");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!initialized.current) {
        initialized.current = true;
        // Seed a hardcoded greeting client-side. We must NOT call the AI with an
        // empty messages array — the Anthropic API requires at least one user
        // message and returns 400 otherwise.
        setMessages([{ role: "assistant", content: "Hej! Vad behöver du hjälp med?" }]);
      }
    }
  }, [open]);

  async function sendToAI(msgs: ChatMessage[]) {
    setStreaming(true);

    const bizForAI = businesses.map((b) => ({
      id: b.id,
      name: b.name,
      categoryId: b.categoryId,
      description: b.description,
    }));
    const catForAI = categories.map((c) => ({ id: c.id, name: c.name }));

    let fullText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(msgs), businesses: bizForAI, categories: catForAI }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const body = (await res.json()) as { error?: unknown };
          detail = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
        } catch { /* non-JSON error body */ }
        throw new Error(detail || `AI-tjänsten svarade med fel (${res.status})`);
      }
      if (!res.body) throw new Error("Fel från AI");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Keep the trailing partial line in the buffer until the next read so we
        // never try to JSON.parse a line that was split across chunk boundaries.
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
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: detail
            ? `Något gick fel: ${detail}`
            : "Något gick fel. Försök igen.",
        };
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

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    await sendToAI(newMessages);
  }

  async function handleSubmitQuote() {
    if (!ready) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: ready.summary,
          categoryId: ready.categoryId,
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          businessIds: ready.businessIds,
          details: {},
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuoteId(data.quoteId);
      setStep("done");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedBusinesses = businesses.filter((b) => ready?.businessIds.includes(b.id));

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[var(--primary)] text-white px-4 py-3 rounded-2xl shadow-lg hover:bg-[var(--primary)]/90 transition-all duration-200 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label="Öppna AI-assistent"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Få hjälp av AI</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-24px))] bg-white rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col overflow-hidden"
          style={{ maxHeight: "min(600px, calc(100vh - 48px))" }}>

          {/* Header */}
          <div className="bg-[var(--primary)] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">AI-assistent</div>
                <div className="text-[10px] text-white/60">Tanums Näringsliv</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

            {/* Contact form step */}
            {ready && step === "chat" && (
              <div className="bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-[var(--primary)]">Skicka offertförfrågan till:</p>
                {selectedBusinesses.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-sm text-[var(--primary)]">
                    <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-xs font-bold shrink-0">{b.initials}</div>
                    {b.name}
                  </div>
                ))}
                <button
                  onClick={() => setStep("contact")}
                  className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent)]/90 transition-colors"
                >
                  Ange kontaktuppgifter →
                </button>
              </div>
            )}

            {step === "contact" && (
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-[var(--primary)]">Dina kontaktuppgifter</p>
                <input
                  type="text"
                  placeholder="Namn *"
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <input
                  type="email"
                  placeholder="E-post * (du får en länk till din offert)"
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <input
                  type="tel"
                  placeholder="Telefon (valfritt)"
                  value={contact.phone}
                  onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <button
                  onClick={() => contact.name && contact.email && setStep("confirm")}
                  disabled={!contact.name || !contact.email}
                  className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50"
                >
                  Fortsätt →
                </button>
              </div>
            )}

            {step === "confirm" && ready && (
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-[var(--primary)]">Bekräfta och skicka</p>
                <div className="text-xs text-[var(--muted)] space-y-1">
                  <p><span className="font-medium text-[var(--primary)]">Vad:</span> {ready.summary}</p>
                  <p><span className="font-medium text-[var(--primary)]">Namn:</span> {contact.name}</p>
                  <p><span className="font-medium text-[var(--primary)]">E-post:</span> {contact.email}</p>
                  {contact.phone && <p><span className="font-medium text-[var(--primary)]">Tel:</span> {contact.phone}</p>}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Förfrågan skickas till: {selectedBusinesses.map((b) => b.name).join(", ")}
                </p>
                <button
                  onClick={handleSubmitQuote}
                  disabled={submitting}
                  className="w-full py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? "Skickar..." : "Skicka offertförfrågan"}
                </button>
                <button onClick={() => setStep("contact")} className="w-full text-xs text-[var(--muted)] hover:text-[var(--primary)]">
                  ← Ändra uppgifter
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-[var(--primary)] mb-1">Förfrågan skickad!</p>
                <p className="text-sm text-[var(--muted)]">
                  Kolla din e-post — vi har skickat en länk till din offert på <strong>{contact.email}</strong>.
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {step === "chat" && (
            <div className="border-t border-[var(--border)] px-3 py-3 shrink-0 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Skriv ett meddelande..."
                disabled={streaming}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="p-2.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
