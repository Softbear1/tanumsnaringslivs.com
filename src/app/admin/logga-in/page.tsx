"use client";
export const runtime = "edge";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoggaIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const isCustomer = next.includes("/offert");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a
            href="/"
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)] text-white text-2xl font-bold mb-4 hover:scale-105 transition-transform"
          >
            T
          </a>
          <h1 className="text-2xl font-bold text-[var(--primary)]">Tanums Näringsliv</h1>
          <p className="text-[var(--muted)] mt-1">
            {isCustomer ? "Logga in för att se din offertförfrågan" : "Logga in för företag och beställare"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[var(--border)] p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#6ECFA8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#6ECFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">Kolla din e-post!</h2>
              <p className="text-[var(--muted)]">
                Vi har skickat en inloggningslänk till <strong>{email}</strong>.
                Klicka på länken i e-postmeddelandet för att logga in.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">Logga in</h2>
              <p className="text-[var(--muted)] mb-6 text-sm">
                {isCustomer
                  ? "Ange e-postadressen du använde i offertförfrågan så skickar vi en inloggningslänk."
                  : "Ange din e-postadress så skickar vi en inloggningslänk — inget lösenord behövs."}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--primary)] mb-1">
                    E-postadress
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="din@email.se"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Skickar..." : "Skicka magisk länk"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            ← Tillbaka till Tanums Näringsliv
          </a>
        </div>
      </div>
    </div>
  );
}
