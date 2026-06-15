"use client";
export const runtime = "edge";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { TreePine, Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Något gick fel. Kontrollera e-postadressen och försök igen.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-[var(--accent)] rounded-xl flex items-center justify-center">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-[var(--primary)]">Tanums Näringsliv</span>
        </a>

        <div className="bg-white rounded-2xl p-8 card-shadow">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[var(--accent)]" />
              </div>
              <h1 className="text-xl font-bold text-[var(--primary)] mb-2">Kolla din e-post!</h1>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Vi har skickat en inloggningslänk till{" "}
                <span className="font-medium text-[var(--primary)]">{email}</span>.
                Länken är giltig i 60 minuter.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-sm text-[var(--accent)] hover:underline"
              >
                Använd en annan e-postadress
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-[var(--primary)] mb-1">Välkommen tillbaka</h1>
                <p className="text-sm text-[var(--muted)]">
                  Ange din e-postadress så skickar vi en inloggningslänk
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">
                    E-postadress
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="din@epost.se"
                      className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium text-sm hover:bg-[#152E3D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Skickar..." : (
                    <>Skicka inloggningslänk <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-xs text-[var(--muted)] text-center mt-5">
                Inget konto? Registrera ditt företag — du skapar ett konto automatiskt.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          <a href="/" className="hover:text-[var(--primary)] transition-colors">← Tillbaka till startsidan</a>
        </p>
      </div>
    </div>
  );
}
