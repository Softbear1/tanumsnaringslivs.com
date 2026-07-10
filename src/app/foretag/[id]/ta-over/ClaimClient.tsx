"use client";
import { useState } from "react";
import { Loader2, MailCheck, ShieldQuestion } from "lucide-react";
import { sendClaimLink, requestManualClaim, type ClaimResult } from "./actions";

type Props = {
  businessId: string;
  hasClaimEmail: boolean;
};

export default function ClaimClient({ businessId, hasClaimEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(!hasClaimEmail);
  const [error, setError] = useState<string | null>(null);

  // Manuell begäran
  const [manualEmail, setManualEmail] = useState("");
  const [manualMsg, setManualMsg] = useState("");
  const [manualDone, setManualDone] = useState(false);

  async function handleSend() {
    setLoading(true);
    setError(null);
    let res: ClaimResult;
    try {
      res = await sendClaimLink(businessId);
    } catch {
      // Kastad server-action fick tidigare knappen att snurra för alltid
      // (loading gick aldrig tillbaka till false). Visa fel i stället.
      res = { status: "error", message: "Något gick fel på vägen. Försök igen om en stund." };
    }
    setLoading(false);
    if (res.status === "sent") setSentTo(res.email);
    else if (res.status === "already") setError("Den här listningen administreras redan.");
    else if (res.status === "no-email") setShowManual(true);
    else setError(res.message);
  }

  async function handleManual(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let res: { ok: boolean; error?: string };
    try {
      res = await requestManualClaim(businessId, manualEmail, manualMsg);
    } catch {
      res = { ok: false, error: "Något gick fel på vägen. Försök igen om en stund." };
    }
    setLoading(false);
    if (res.ok) setManualDone(true);
    else setError(res.error ?? "Något gick fel.");
  }

  // Bekräftelse: länk skickad — visa tydligt vilken adress den gick till.
  if (sentTo) {
    return (
      <div className="mt-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-7 h-7 text-[var(--accent)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Kolla din e-post</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Vi har skickat en inloggningslänk till företagets registrerade adress:
        </p>
        <p className="my-3 font-semibold text-[var(--primary)] break-all bg-[var(--bg)] rounded-xl py-2.5 px-4">
          {sentTo}
        </p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Klicka på länken i mejlet så blir du verifierad ägare och kommer direkt till din
          administration.
        </p>
        <button
          onClick={() => { setShowManual(true); setSentTo(null); }}
          className="text-xs text-[var(--muted)] underline mt-5 hover:text-[var(--primary)]"
        >
          Har du inte tillgång till den adressen?
        </button>
      </div>
    );
  }

  if (manualDone) {
    return (
      <div className="mt-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-4">
          <ShieldQuestion className="w-7 h-7 text-[var(--accent)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Tack — vi hör av oss</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Din begäran om att ta över listningen har skickats för granskning. Vi återkommer till{" "}
          <strong className="text-[var(--primary)]">{manualEmail}</strong> så snart vi har verifierat
          att du hör till företaget.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!showManual ? (
        <>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
            Vi skickar en inloggningslänk till företagets registrerade e-postadress. Den som kan ta
            emot mejlet blir verifierad ägare — enkelt och säkert, utan lösenord.
          </p>
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full py-3 px-6 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Skicka inloggningslänk
          </button>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <button
            onClick={() => setShowManual(true)}
            className="text-xs text-[var(--muted)] underline mt-4 block mx-auto hover:text-[var(--primary)]"
          >
            Har du inte tillgång till den registrerade adressen?
          </button>
        </>
      ) : (
        <form onSubmit={handleManual}>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
            Ingen tillgång till den registrerade adressen? Lämna dina uppgifter så granskar vi din
            begäran manuellt och hör av oss.
          </p>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1">Din e-postadress</label>
          <input
            type="email"
            required
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            placeholder="din@email.se"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-3"
          />
          <label className="block text-sm font-medium text-[var(--primary)] mb-1">Meddelande (valfritt)</label>
          <textarea
            value={manualMsg}
            onChange={(e) => setManualMsg(e.target.value)}
            rows={3}
            placeholder="Berätta kort hur du hör till företaget."
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-4 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Skicka begäran
          </button>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          {hasClaimEmail && (
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="text-xs text-[var(--muted)] underline mt-4 block mx-auto hover:text-[var(--primary)]"
            >
              ← Tillbaka
            </button>
          )}
        </form>
      )}
    </div>
  );
}
