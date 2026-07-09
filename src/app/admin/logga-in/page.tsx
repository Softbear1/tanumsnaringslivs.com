"use client";
export const runtime = "edge";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import BusinessSearchClaim from "@/components/BusinessSearchClaim";
import { TnIcon } from "@/components/Logo";

export default function LoggaIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const linkExpired = searchParams.get("error") === "expired_link";
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
            className="inline-flex items-center justify-center mb-4 hover:scale-105 transition-transform"
          >
            <TnIcon size={64} />
          </a>
          <h1 className="text-2xl font-bold text-[var(--primary)]">Tanums Näringsliv</h1>
          <p className="text-[var(--muted)] mt-1">Logga in för företag</p>
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
                Ange din e-postadress så skickar vi en inloggningslänk — inget lösenord behövs.
              </p>
              {linkExpired && (
                <p className="mb-4 text-sm bg-[var(--error-bg)] text-[var(--error)] rounded-lg px-4 py-3">
                  Länken har gått ut eller redan använts. Öppna den i samma webbläsare som du begärde
                  den i, eller be om en ny länk nedan.
                </p>
              )}
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
                  className="w-full py-3 px-6 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Skickar..." : "Skicka magisk länk"}
                </button>
                <p className="text-xs text-[var(--muted)] text-center mt-3 leading-relaxed">
                  Genom att logga in godkänner du våra{" "}
                  <a href="/anvandarvillkor" className="underline hover:text-[var(--primary)]">användarvillkor</a>{" "}
                  och{" "}
                  <a href="/integritetspolicy" className="underline hover:text-[var(--primary)]">integritetspolicy</a>.
                </p>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            ← Tillbaka till Tanums Näringsliv
          </a>
        </div>

        {/* Employer claim section */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[var(--background)] text-[var(--muted)]">Ny arbetsgivare?</span>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--primary)] mb-1">Hitta och claima ditt företag</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Sök upp ditt företag — claima det gratis och börja lägga upp sommarjobb och blixterbjudanden.
            </p>
            <BusinessSearchClaim />
          </div>
        </div>
      </div>
    </div>
  );
}
