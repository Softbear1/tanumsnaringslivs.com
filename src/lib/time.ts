// Hjälpfunktioner för svensk tid (Europe/Stockholm). Edge-runtime-säkra —
// bygger på Intl, ingen extern tidszons-lib. Används för blixterbjudandena så
// att "idag", "imorgon" och nedräkningen alltid följer svensk lokaltid oavsett
// var servern eller besökaren befinner sig.

const TZ = "Europe/Stockholm";

/** Dagens datum i svensk tid som "YYYY-MM-DD". */
export function stockholmToday(at: Date = new Date()): string {
  // sv-SE formaterar som YYYY-MM-DD.
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** Offset mellan svensk tid och UTC i millisekunder vid en given tidpunkt. */
function stockholmOffsetMs(at: Date = new Date()): number {
  const local = new Date(at.toLocaleString("en-US", { timeZone: TZ }));
  const utc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }));
  return local.getTime() - utc.getTime();
}

/**
 * Tidpunkten då dagens svenska dygn tar slut (nästa midnatt svensk tid),
 * som ISO-sträng i UTC. Klienten räknar ner till denna.
 */
export function endOfStockholmDayISO(at: Date = new Date()): string {
  const [y, m, d] = stockholmToday(at).split("-").map(Number);
  const offset = stockholmOffsetMs(at);
  // Nästa midnatt i svensk väggklockstid, tolkad som UTC, minus offset = UTC-instans.
  const nextMidnightWall = Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0);
  return new Date(nextMidnightWall - offset).toISOString();
}

/** Tidpunkten då dagens svenska dygn började (senaste midnatt), ISO i UTC. */
export function startOfStockholmDayISO(at: Date = new Date()): string {
  const [y, m, d] = stockholmToday(at).split("-").map(Number);
  const offset = stockholmOffsetMs(at);
  const midnightWall = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return new Date(midnightWall - offset).toISOString();
}

/** Antal dagar mellan dagens svenska datum och ett "YYYY-MM-DD"-datum. */
export function daysFromToday(dealDate: string, at: Date = new Date()): number {
  const today = stockholmToday(at);
  const [ty, tm, td] = today.split("-").map(Number);
  const [dy, dm, dd] = dealDate.split("-").map(Number);
  const a = Date.UTC(ty, tm - 1, td);
  const b = Date.UTC(dy, dm - 1, dd);
  return Math.round((b - a) / 86_400_000);
}

/** Människovänlig etikett för ett kommande datum, på svenska. */
export function relativeDayLabel(dealDate: string, at: Date = new Date()): string {
  const diff = daysFromToday(dealDate, at);
  if (diff <= 0) return "Idag";
  if (diff === 1) return "Imorgon";
  if (diff < 7) {
    const [y, m, d] = dealDate.split("-").map(Number);
    const weekday = new Intl.DateTimeFormat("sv-SE", { weekday: "long", timeZone: TZ }).format(
      new Date(Date.UTC(y, m - 1, d, 12)),
    );
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  const [y, m, d] = dealDate.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", timeZone: TZ }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}
