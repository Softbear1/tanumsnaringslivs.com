"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pause, Play, Trash2, Pencil, ExternalLink, BadgeCheck } from "lucide-react";
import { adminToggleBusiness, adminDeleteBusiness } from "./actions";
import CampaignTimeline, { type TimelineState } from "@/components/admin/CampaignTimeline";

interface Business {
  id: string;
  name: string;
  active: boolean;
  boosted: boolean;
  owner_id: string | null;
  category_id: string;
  claimed: boolean;
}

type ClaimFilter = "alla" | "claimade" | "ej-claimade";

const FILTERS: { value: ClaimFilter; label: string }[] = [
  { value: "alla", label: "Alla" },
  { value: "claimade", label: "Claimade" },
  { value: "ej-claimade", label: "Ej claimade" },
];

const PAGE_SIZE = 50;

export default function SuperBusinessTable({
  businesses,
  catName,
  timelineById,
}: {
  businesses: Business[];
  catName: Record<string, string>;
  timelineById: Record<string, TimelineState>;
}) {
  const [query, setQuery] = useState("");
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>("alla");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((b) => {
      if (claimFilter === "claimade" && !b.claimed) return false;
      if (claimFilter === "ej-claimade" && b.claimed) return false;
      if (!q) return true;
      const cat = (catName[b.category_id] ?? b.category_id ?? "").toLowerCase();
      return b.name.toLowerCase().includes(q) || cat.includes(q);
    });
  }, [businesses, catName, query, claimFilter]);

  const shown = filtered.slice(0, visible);

  async function toggle(b: Business) {
    setBusyId(b.id);
    await adminToggleBusiness(b.id, b.active);
    setBusyId(null);
  }

  async function remove(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setBusyId(id);
    await adminDeleteBusiness(id);
    setBusyId(null);
    setConfirmId(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Sök på namn eller kategori…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setClaimFilter(f.value); setVisible(PAGE_SIZE); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                claimFilter === f.value
                  ? "bg-[var(--brand)] text-white"
                  : "bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] mb-2">
        Visar {shown.length} av {filtered.length}
        {filtered.length !== businesses.length && ` (filtrerat från ${businesses.length})`}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Namn</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Bearbetning</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Kategori</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {shown.map((b) => (
              <tr key={b.id} className={busyId === b.id ? "opacity-50" : ""}>
                <td className="px-4 py-3 font-medium text-[var(--primary)]">
                  {b.name}
                  {b.claimed && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] bg-[var(--accent-light)] text-[var(--brand)] px-1.5 py-0.5 rounded-full font-semibold">
                      <BadgeCheck className="w-3 h-3" /> Verifierad
                    </span>
                  )}
                  {b.boosted && <span className="ml-2 text-[10px] bg-[var(--boost-border)] text-[var(--boost)] px-1.5 py-0.5 rounded-full">Boost</span>}
                  {!b.owner_id && !b.claimed && <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Ingen ägare</span>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {timelineById[b.id] ? <CampaignTimeline state={timelineById[b.id]} /> : <span className="text-[var(--border)]">–</span>}
                </td>
                <td className="px-4 py-3 text-[var(--muted)] hidden sm:table-cell">{catName[b.category_id] ?? b.category_id}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{b.active ? "Aktiv" : "Pausad"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/admin/foretag/${b.id}`} className="p-2 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg" title="Redigera"><Pencil className="w-3.5 h-3.5" /></Link>
                    <Link href={`/foretag/${b.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)] rounded-lg" title="Visa publik profil"><ExternalLink className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => toggle(b)} disabled={busyId === b.id} className="p-2 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg disabled:opacity-50" title={b.active ? "Pausa" : "Aktivera"}>{b.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => remove(b.id)} disabled={busyId === b.id} className={`p-2 border rounded-lg disabled:opacity-50 ${confirmId === b.id ? "bg-red-600 text-white border-red-600" : "text-[var(--muted)] hover:text-red-600 border-[var(--border)]"}`} title={confirmId === b.id ? "Klicka igen för att bekräfta" : "Ta bort"}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--muted)]">Inga företag matchar sökningen.</td></tr>}
          </tbody>
        </table>
      </div>

      {visible < filtered.length && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl bg-white hover:bg-[var(--bg)] transition-colors text-[var(--primary)] font-medium"
          >
            Visa fler ({filtered.length - visible} kvar)
          </button>
        </div>
      )}
    </div>
  );
}
