"use client";
import { useSyncExternalStore } from "react";

// Läser token_hash/type/next från URL:en först i webbläsaren. Sidan kan då
// prerendras statiskt — en serverrenderad variant kostade 1,5 MiB i Pages
// Functions-bundlen och knuffade deployen över Cloudflares 25 MiB-gräns.
// useSyncExternalStore ger hydreringssäker läsning: null på servern,
// riktiga query-strängen direkt på klienten.
const subscribe = () => () => {};
const getSearch = () => window.location.search;
const getServerSearch = () => null;

export default function BekraftaForm() {
  const search = useSyncExternalStore<string | null>(subscribe, getSearch, getServerSearch);

  const sp = search === null ? null : new URLSearchParams(search);
  const tokenHash = sp?.get("token_hash") ?? "";
  const type = sp?.get("type") ?? "";
  const rawNext = sp?.get("next") ?? "/admin";
  const next = rawNext.startsWith("/") ? rawNext : "/admin";

  if (sp && (!tokenHash || !type)) {
    return (
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Länken är ofullständig eller har redan använts.{" "}
        <a href="/admin/logga-in" className="text-[var(--brand)] underline">
          Be om en ny inloggningslänk
        </a>
        .
      </p>
    );
  }

  return (
    <form method="POST" action="/auth/callback">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        disabled={!sp}
        className="w-full py-3 px-6 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60"
      >
        Logga in
      </button>
    </form>
  );
}
