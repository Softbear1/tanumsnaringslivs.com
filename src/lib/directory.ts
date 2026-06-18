import { Business, Category, getCategory } from "./data";

// Expanderar söktermen med vanliga svenska yrkesynonymer så att t.ex.
// "snickare" matchar företag som heter "Bygg AB" eller har "snickeri" i beskrivningen.
const SYNONYMS: Record<string, string[]> = {
  snickare: ["bygg", "snickeri", "hantverk", "träarbete", "renovering", "carpenter"],
  elektriker: ["el", "elektro", "elinstallation", "installation"],
  rörmokare: ["vvs", "rör", "värme", "vatten", "sanitär"],
  målare: ["måleri", "fasad", "tapetsering", "renovering"],
  städ: ["städning", "rengöring", "hemservice", "lokalvård"],
  frisör: ["hår", "salong", "klippning", "frisörsal"],
  massör: ["massage", "naprapat", "kiropraktor", "spa", "behandling"],
  restaurang: ["mat", "lunch", "middag", "café", "krog", "pizzeria"],
  bageri: ["bröd", "konditori", "café", "bakverk"],
  bilverkstad: ["bil", "mekaniker", "service", "däck", "motor"],
  taxi: ["transport", "skjuts", "bil"],
  flyttfirma: ["flytt", "transport", "lastbil"],
  trädgård: ["mark", "anläggning", "gräs", "häck", "utomhus"],
  städfirma: ["städ", "rengöring", "lokalvård", "hemstäd"],
  advokat: ["juridik", "juridisk", "rätt", "lag"],
  revisor: ["redovisning", "bokföring", "ekonomi", "skatt"],
  fotograf: ["foto", "bild", "studio"],
  arkitekt: ["ritning", "design", "hus", "bygg"],
};

function expandQuery(q: string): string[] {
  const terms = [q];
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (key.includes(q) || q.includes(key)) {
      terms.push(...syns, key);
    }
    for (const syn of syns) {
      if (syn.includes(q) || q.includes(syn)) {
        terms.push(key, ...syns);
        break;
      }
    }
  }
  return [...new Set(terms)];
}

/**
 * Filtrerar företag baserat på vald kategori och fritextsökning.
 * Sökning matchar mot namn, kategorinamn och beskrivning, med synonymexpansion.
 */
export function filterBusinesses(
  businesses: Business[],
  categories: Category[],
  categoryFilter: string | null,
  search: string
): Business[] {
  return businesses.filter((b) => {
    if (categoryFilter && b.categoryId !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      const cat = getCategory(categories, b.categoryId);
      const haystack = [
        b.name.toLowerCase(),
        cat?.name.toLowerCase() ?? "",
        b.description.toLowerCase(),
      ].join(" ");
      const terms = expandQuery(q);
      return terms.some((t) => haystack.includes(t));
    }
    return true;
  });
}

/** Sorterar boostade företag först, övrig ordning bevaras (stabil sort). */
export function sortBoostedFirst(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0));
}

/** Tillgängliga sorteringsval för katalogen på förstasidan. */
export type SortKey = "name-asc" | "name-desc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Namn (A–Ö)" },
  { value: "name-desc", label: "Namn (Ö–A)" },
];

/** Sorterar företagslistan enligt valt sorteringsval. */
export function sortBusinesses(businesses: Business[], key: SortKey): Business[] {
  switch (key) {
    case "name-desc":
      return [...businesses].sort((a, b) => b.name.localeCompare(a.name, "sv"));
    case "name-asc":
    default:
      return [...businesses].sort((a, b) => a.name.localeCompare(b.name, "sv"));
  }
}

/** Antal företag i en given kategori. */
export function getCategoryCount(businesses: Business[], categoryId: string): number {
  return businesses.filter((b) => b.categoryId === categoryId).length;
}

/** Minsta annonsform som behövs för urval (matchar Ad i AdCard). */
type AdLike = { id: string; category_id: string | null };

/**
 * Väljer vilka annonser som är relevanta för den aktuella vyn.
 * - Kategorifilter aktivt → annonser för den kategorin + generella (null).
 * - Sökning aktiv → generella (null) + annonser vars kategori finns bland träffarna.
 * - Ingen filtrering → alla annonser.
 * Generella annonser (category_id === null) är alltid relevanta, precis som i chatten.
 */
export function selectRelevantAds<T extends AdLike>(
  ads: T[],
  categoryFilter: string | null,
  search: string,
  filteredBusinesses: Business[]
): T[] {
  if (categoryFilter) {
    return ads.filter((a) => a.category_id === categoryFilter || a.category_id === null);
  }
  if (search.trim()) {
    const cats = new Set(filteredBusinesses.map((b) => b.categoryId));
    return ads.filter((a) => a.category_id === null || (a.category_id !== null && cats.has(a.category_id)));
  }
  return ads;
}
