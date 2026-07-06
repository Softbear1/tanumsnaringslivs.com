import { Business, Category, getCategory } from "./data";

/**
 * Filtrerar företag baserat på vald kategori och fritextsökning.
 * Matchar mot namn, kategorinamn och beskrivning. Semantisk matchning
 * hanteras av AI-chatten — gallerisöket är avsiktligt precist.
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
      return (
        b.name.toLowerCase().includes(q) ||
        (cat?.name.toLowerCase().includes(q) ?? false) ||
        b.description.toLowerCase().includes(q)
      );
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
  // Verifierade (claimade) företag alltid först — de har riktigt innehåll
  // (bild, beskrivning, kontakt) och det är samtidigt moroten för att claima.
  // Vald sortering gäller inom respektive grupp.
  const byClaimed = (a: Business, b: Business) => Number(b.claimed) - Number(a.claimed);
  switch (key) {
    case "name-desc":
      return [...businesses].sort((a, b) => byClaimed(a, b) || b.name.localeCompare(a.name, "sv"));
    case "name-asc":
    default:
      return [...businesses].sort((a, b) => byClaimed(a, b) || a.name.localeCompare(b.name, "sv"));
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
