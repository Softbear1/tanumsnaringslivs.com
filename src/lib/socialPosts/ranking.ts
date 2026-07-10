// Ren, beroendefri rangordning för auto-urvalet (inga alias-imports → enkelt
// att enhetstesta). Företag som redan är köade idag/framåt filtreras bort;
// resten sorteras bäst först: aldrig-visade före sedan-länge-visade, tiebreak
// på created_at.

export type PoolBusiness = { id: string; name: string; created_at: string };
export type HistoryRow = { business_id: string | null; scheduled_date: string };

export function rankPool(
  pool: PoolBusiness[],
  history: HistoryRow[],
  today: string,
): Array<{ id: string; name: string }> {
  const lastSeen = new Map<string, string>();
  const queuedFuture = new Set<string>();
  for (const r of history) {
    if (!r.business_id) continue;
    const prev = lastSeen.get(r.business_id);
    if (!prev || r.scheduled_date > prev) lastSeen.set(r.business_id, r.scheduled_date);
    if (r.scheduled_date >= today) queuedFuture.add(r.business_id);
  }

  const candidates = pool.filter((b) => !queuedFuture.has(b.id));
  candidates.sort((a, b) => {
    const la = lastSeen.get(a.id);
    const lb = lastSeen.get(b.id);
    if (!la && !lb) return String(a.created_at).localeCompare(String(b.created_at));
    if (!la) return -1;
    if (!lb) return 1;
    if (la !== lb) return la.localeCompare(lb);
    return String(a.created_at).localeCompare(String(b.created_at));
  });

  return candidates.map((b) => ({ id: b.id, name: b.name }));
}
