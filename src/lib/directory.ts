import { Business, Category, getCategory } from "./data";

/**
 * Filtrerar företag baserat på vald kategori och fritextsökning.
 * Sökning matchar mot namn, kategorinamn och beskrivning (skiftlägesokänsligt).
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

/** Antal företag i en given kategori. */
export function getCategoryCount(businesses: Business[], categoryId: string): number {
  return businesses.filter((b) => b.categoryId === categoryId).length;
}
