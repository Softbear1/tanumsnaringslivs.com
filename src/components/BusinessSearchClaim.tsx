"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Building2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";
import EliasClaimModal from "@/components/EliasClaimModal";

type Result = { id: string; name: string; postort: string | null };

interface Props {
  /** Anropas när användaren valt sitt företag i listan. */
  onSelect?: (name: string) => void;
  /** Anropas när inloggningslänken har skickats. */
  onClaimSent?: () => void;
  /** Anropas när claim-modalen stängs. */
  onModalClose?: () => void;
}

export default function BusinessSearchClaim({ onSelect, onClaimSent, onModalClose }: Props = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); return; }

    timerRef.current = setTimeout(async () => {
      setSearching(true);
      const supabase = createBrowserClient();
      // Bara oclaimade listningar — en som redan har ägare går inte att ta
      // över, och att upptäcka det först efter e-post + org-nr är onödigt surt.
      const { data } = await supabase
        .from("businesses")
        .select("id, name, postort")
        .eq("claimed", false)
        .ilike("name", `%${query.trim()}%`)
        .limit(6);
      setResults(data ?? []);
      setSearching(false);
    }, 300);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök företagsnamn..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] text-[var(--primary)] text-[16px] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
        />
      </div>

      {query.trim() && (
        <div className="mt-2 space-y-1">
          {searching && (
            <p className="text-sm text-[var(--muted)] px-1">Söker...</p>
          )}
          {!searching && results.length === 0 && (
            <p className="text-sm text-[var(--muted)] px-1">Inga träffar — kontakta oss om ditt företag saknas.</p>
          )}
          {results.map((biz) => (
            <button
              key={biz.id}
              onClick={() => { setSelected({ id: biz.id, name: biz.name }); onSelect?.(biz.name); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition-colors text-left"
            >
              <Building2 className="w-4 h-4 text-[var(--muted)] shrink-0" />
              <div>
                <span className="text-sm font-medium text-[var(--primary)]">{biz.name}</span>
                {biz.postort && <span className="text-xs text-[var(--muted)] ml-2">{biz.postort}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <EliasClaimModal
          businessId={selected.id}
          businessName={selected.name}
          onClose={() => { setSelected(null); onModalClose?.(); }}
          onSent={onClaimSent}
        />
      )}
    </>
  );
}
