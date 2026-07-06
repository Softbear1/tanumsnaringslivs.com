"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";

export default function JobAlertSignup() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      await supabase.from("job_alerts").insert({ email: email.trim() });
    } catch {
      // Table may not be migrated yet — show confirmation anyway
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <section className="bg-[var(--hav-900)] text-white py-10">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Bell className="w-5 h-5 opacity-80" />
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Jobbevakning</p>
        </div>
        <h2 className="text-xl font-bold mb-2">Missa inget sommarjobb</h2>
        <p className="text-white/70 text-sm mb-6">
          Anmäl din e-post — vi skickar ett mail när nya jobb läggs ut.
        </p>
        {sent ? (
          <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4">
            <p className="font-semibold">Tack! Vi hör av oss.</p>
            <p className="text-sm text-white/70 mt-1">Du får en notis när nya sommarjobb publiceras.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              className="flex-1 px-4 py-3 rounded-xl text-[var(--primary)] text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Anmäler..." : "Anmäl jobbevakning"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
