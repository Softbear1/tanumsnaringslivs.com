"use client";
import { useState, useEffect, useRef } from "react";
import { X, Send, MailCheck, BadgeCheck } from "lucide-react";
import { claimApi, type ClaimVerifyResult } from "@/lib/claim-api";

type Step =
  | "pitch"
  | "email"
  | "orgnr"
  | "sending"
  | "sent"
  | "error"
  | "manualAsk"
  | "manualSent";

interface Msg {
  from: "elias" | "user";
  text: string;
}

interface Props {
  businessId: string;
  businessName: string;
  onClose: () => void;
  /** Anropas när inloggningslänken har skickats. */
  onSent?: () => void;
}

const TYPING_DELAY = 700;

export default function EliasClaimModal({ businessId, businessName, onClose, onSent }: Props) {
  const [step, setStep] = useState<Step>("pitch");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function elias(text: string, nextStep?: Step, delay = TYPING_DELAY) {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "elias", text }]);
      setTyping(false);
      if (nextStep) setStep(nextStep);
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    }, delay);
  }

  useEffect(() => {
    elias(
      `Hej! Kul att du vill ta över ${businessName}. Som verifierad ägare får du direkt tillgång till:\n\n` +
      `→ Redigera och hålla uppgifterna uppdaterade\n` +
      `→ Posta blixterbjudanden som syns i katalogen\n` +
      `→ Skapa riktade annonser\n` +
      `→ Mig — din personliga marknadsföringscoach\n\n` +
      `Det är gratis och tar en minut. Ska vi köra?`,
      undefined,
      300,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleStart() {
    setMessages((m) => [...m, { from: "user", text: "Ja, kör!" }]);
    elias("Vad är din e-postadress?", "email");
  }

  function handleEmailSubmit() {
    const val = input.trim().toLowerCase();
    if (!val.includes("@") || !val.includes(".")) return;
    setMessages((m) => [...m, { from: "user", text: val }]);
    setEmail(val);
    setInput("");
    elias(`Bra! Och vad är organisationsnumret för ${businessName}?`, "orgnr");
  }

  async function handleOrgNrSubmit() {
    const val = input.trim();
    if (!val) return;
    setMessages((m) => [...m, { from: "user", text: val }]);
    setInput("");
    setStep("sending");
    setTyping(true);

    let res: ClaimVerifyResult;
    try {
      res = await claimApi<ClaimVerifyResult>({ op: "verify-orgnr", businessId, email, orgNr: val });
    } catch {
      // Nätverksfel eller serverfel. Fastna aldrig på "skriver…"-indikatorn —
      // visa ett fel och låt användaren gå vidare.
      res = { ok: false, error: "Något gick fel på vägen. Försök igen om en stund." };
    }

    setTyping(false);
    if (res.ok) {
      setMessages((m) => [...m, { from: "elias", text: `Perfekt! Jag har skickat en inloggningslänk till ${email}. Klicka på länken i mejlet så är du inne direkt.` }]);
      setStep("sent");
      onSent?.();
    } else if (res.code === "no_orgnr") {
      // Registret saknar org-nr — automatisk verifiering är omöjlig. Gå ärligt
      // och direkt till manuell granskning i stället för "numret stämmer inte".
      setMessages((m) => [...m, { from: "elias", text: `Jag saknar tyvärr organisationsnummer för ${businessName} i mitt register, så jag kan inte verifiera automatiskt. Men det löser vi manuellt!` }]);
      startManual();
    } else {
      setMessages((m) => [...m, { from: "elias", text: res.error ?? "Något gick fel. Försök igen." }]);
      setErrorMsg(res.error ?? "");
      setStep("error");
    }
  }

  function startManual() {
    setInput("");
    elias(
      `Inga problem. Skriv en kort rad om hur du hör till ${businessName}, så granskar jag din begäran manuellt och hör av mig till ${email}.`,
      "manualAsk",
    );
  }

  async function handleManualSubmit() {
    const note = input.trim();
    setMessages((m) => [...m, { from: "user", text: note || "(vill bli kontaktad)" }]);
    setInput("");
    setStep("sending");
    setTyping(true);

    let res: { ok: boolean; error?: string };
    try {
      res = await claimApi<{ ok: boolean; error?: string }>({ op: "manual", businessId, email, message: note });
    } catch {
      res = { ok: false, error: "Något gick fel på vägen. Försök igen om en stund." };
    }

    setTyping(false);
    if (res.ok) {
      setMessages((m) => [...m, { from: "elias", text: `Tack! Din begäran är inskickad. Jag återkommer till ${email} så snart jag har verifierat att du hör till företaget.` }]);
      setStep("manualSent");
    } else {
      setMessages((m) => [...m, { from: "elias", text: res.error ?? "Något gick fel. Försök igen." }]);
      setErrorMsg(res.error ?? "");
      setStep("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (step === "email") handleEmailSubmit();
    else if (step === "orgnr") handleOrgNrSubmit();
    else if (step === "manualAsk") handleManualSubmit();
  }

  const placeholder =
    step === "email" ? "din@email.se" :
    step === "orgnr" ? "XXXXXX-XXXX" :
    step === "manualAsk" ? "Hur hör du till företaget? (valfritt)" : "";

  const inputType = step === "email" ? "email" : "text";
  const inputActive = step === "email" || step === "orgnr" || step === "manualAsk";
  // Org-nr och e-post kräver ifyllt värde; den manuella noteringen är valfri.
  const canSubmit = step === "manualAsk" || (input.trim().length > 0 && (step === "email" || step === "orgnr"));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — full screen mobile, centered card desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[440px] sm:rounded-2xl sm:shadow-2xl"
        style={{ height: "100dvh", maxHeight: "100dvh" }}
      >
        {/* Header */}
        <div className="bg-[var(--brand)] text-white px-4 py-3 flex items-center gap-3 shrink-0 sm:rounded-t-2xl">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">E</div>
          <div className="flex-1">
            <div className="text-sm font-semibold leading-tight">Elias</div>
            <div className="text-[11px] text-white/70">Tanums Näringsliv</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start gap-2"}`}>
              {msg.from === "elias" && (
                <div className="w-7 h-7 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">E</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.from === "user"
                  ? "bg-[var(--brand)] text-white rounded-tr-sm"
                  : "bg-white text-[var(--primary)] rounded-tl-sm shadow-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-xs font-bold shrink-0">E</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-3 shadow-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {step === "sent" && !typing && (
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-full">
                <MailCheck className="w-4 h-4" /> Kolla din e-post!
              </div>
            </div>
          )}

          {step === "manualSent" && !typing && (
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-full">
                <MailCheck className="w-4 h-4" /> Begäran inskickad
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Action area */}
        <div className="shrink-0 bg-white border-t border-[var(--border)] p-3 sm:rounded-b-2xl">
          {step === "pitch" && !typing && messages.length > 0 && (
            <button
              onClick={handleStart}
              className="w-full py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors text-sm"
            >
              Ja, kör! →
            </button>
          )}

          {inputActive && (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type={inputType}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete={step === "email" ? "email" : "off"}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-[16px] text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <button
                onClick={step === "email" ? handleEmailSubmit : step === "orgnr" ? handleOrgNrSubmit : handleManualSubmit}
                disabled={!canSubmit}
                className="p-2.5 bg-[var(--brand)] text-white rounded-xl hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-2">
              <button
                onClick={() => { setInput(""); setStep("orgnr"); }}
                className="w-full py-3 bg-[var(--brand)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--brand-hover)] transition-colors"
              >
                Försök igen
              </button>
              <button
                onClick={startManual}
                className="w-full py-3 border border-[var(--border)] rounded-xl text-sm text-[var(--primary)] hover:bg-[var(--bg)] transition-colors"
              >
                Numret stämmer inte — begär manuell granskning
              </button>
            </div>
          )}

          {(step === "sent" || step === "manualSent") && (
            <button onClick={onClose} className="w-full py-3 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors text-sm flex items-center justify-center gap-2">
              <BadgeCheck className="w-4 h-4" /> Stäng
            </button>
          )}
        </div>
      </div>
    </>
  );
}
