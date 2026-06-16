"use client";
import { useState } from "react";
import { Star, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  quoteRequestId: string;
  businessId: string;
  businessName: string;
  businessInitials: string;
};

// Lets a verified customer rate a business after a handled quote. One per
// business; on success it collapses into a thank-you state.
export default function ReviewForm({ quoteRequestId, businessId, businessName, businessInitials }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteRequestId, businessId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <p className="text-sm text-[var(--primary)]">
          Tack för ditt omdöme om <strong>{businessName}</strong>!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0">
          {businessInitials}
        </div>
        <p className="text-sm font-medium text-[var(--primary)]">{businessName}</p>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} av 5`}
            className="p-0.5"
          >
            <Star
              className="w-7 h-7 transition-colors"
              style={{ color: (hover || rating) >= n ? "#FBBF24" : "#D1D5DB" }}
              fill={(hover || rating) >= n ? "#FBBF24" : "none"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Berätta kort hur det gick (valfritt)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
      />

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <button
        onClick={submit}
        disabled={rating < 1 || submitting}
        className="mt-3 w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Skickar..." : "Skicka omdöme"}
      </button>
    </div>
  );
}
