"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

// Utloggning via webbläsarklienten. Låg tidigare som server action, men de
// svarar 404 på Cloudflare Pages-deployen — knappen var i praktiken död.
export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/logga-in";
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}
