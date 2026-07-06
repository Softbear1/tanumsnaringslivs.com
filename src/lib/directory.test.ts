import { describe, it, expect } from "vitest";
import { filterBusinesses, sortBusinesses, sortBoostedFirst, getCategoryCount, selectRelevantAds } from "./directory";
import { Business, Category } from "./data";

const categories: Category[] = [
  { id: "bygg", name: "Bygg & Hantverk", icon: "Hammer", color: "#000", bgColor: "#fff", sortOrder: 1 },
  { id: "restaurang", name: "Restaurang & Café", icon: "Utensils", color: "#000", bgColor: "#fff", sortOrder: 2 },
];

function biz(partial: Partial<Business> & Pick<Business, "id" | "name" | "categoryId">): Business {
  return {
    description: "",
    phone: "0000",
    email: "a@b.se",
    address: "Gatan 1",
    initials: "XX",
    boosted: false,
    featured: false,
    rating: 4,
    reviewCount: 1,
    claimed: true,
    ...partial,
  };
}

const data: Business[] = [
  biz({ id: "1", name: "Tanums Bygg", categoryId: "bygg", boosted: false, description: "snickeri och renovering" }),
  biz({ id: "2", name: "Fjällbacka Måleri", categoryId: "bygg", boosted: true, description: "målar hus" }),
  biz({ id: "3", name: "Café Havsbris", categoryId: "restaurang", boosted: false, description: "fika vid havet" }),
];

describe("sortBusinesses", () => {
  const mixed: Business[] = [
    biz({ id: "a", name: "Alfa Bygg", categoryId: "bygg", claimed: false }),
    biz({ id: "b", name: "Zäta Måleri", categoryId: "bygg", claimed: true }),
    biz({ id: "c", name: "Mellan Snickeri", categoryId: "bygg", claimed: false }),
  ];

  it("lägger verifierade (claimade) företag först oavsett sortering", () => {
    expect(sortBusinesses(mixed, "name-asc").map((b) => b.id)).toEqual(["b", "a", "c"]);
    expect(sortBusinesses(mixed, "name-desc").map((b) => b.id)).toEqual(["b", "c", "a"]);
  });

  it("sorterar på namn inom samma verifieringsgrupp", () => {
    const all = mixed.map((b) => ({ ...b, claimed: true }));
    expect(sortBusinesses(all, "name-asc").map((b) => b.name)).toEqual([
      "Alfa Bygg", "Mellan Snickeri", "Zäta Måleri",
    ]);
  });
});

describe("filterBusinesses", () => {
  it("returnerar alla när inget filter eller sökning anges", () => {
    expect(filterBusinesses(data, categories, null, "")).toHaveLength(3);
  });

  it("filtrerar på kategori", () => {
    const result = filterBusinesses(data, categories, "bygg", "");
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.categoryId === "bygg")).toBe(true);
  });

  it("matchar sökning på företagsnamn (skiftlägesokänsligt)", () => {
    const result = filterBusinesses(data, categories, null, "café");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("matchar sökning på kategorinamn", () => {
    const result = filterBusinesses(data, categories, null, "restaurang");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("matchar sökning på beskrivning", () => {
    const result = filterBusinesses(data, categories, null, "snickeri");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returnerar tom lista vid sökning utan träff", () => {
    expect(filterBusinesses(data, categories, null, "frisör")).toHaveLength(0);
  });

  it("ignorerar omslutande blanksteg i sökning", () => {
    expect(filterBusinesses(data, categories, null, "  café  ")).toHaveLength(1);
  });
});

describe("sortBoostedFirst", () => {
  it("placerar boostade företag först", () => {
    const sorted = sortBoostedFirst(data);
    expect(sorted[0].boosted).toBe(true);
    expect(sorted[0].id).toBe("2");
  });

  it("muterar inte ursprungslistan", () => {
    const copy = [...data];
    sortBoostedFirst(data);
    expect(data).toEqual(copy);
  });

  it("bevarar inbördes ordning för icke-boostade (stabil)", () => {
    const sorted = sortBoostedFirst(data);
    const nonBoosted = sorted.filter((b) => !b.boosted).map((b) => b.id);
    expect(nonBoosted).toEqual(["1", "3"]);
  });
});

describe("getCategoryCount", () => {
  it("räknar företag per kategori", () => {
    expect(getCategoryCount(data, "bygg")).toBe(2);
    expect(getCategoryCount(data, "restaurang")).toBe(1);
  });

  it("returnerar 0 för kategori utan företag", () => {
    expect(getCategoryCount(data, "transport")).toBe(0);
  });
});

describe("selectRelevantAds", () => {
  const ads = [
    { id: "a-bygg", category_id: "bygg" },
    { id: "a-rest", category_id: "restaurang" },
    { id: "a-general", category_id: null },
  ];

  it("returnerar alla annonser när inget filter eller sökning anges", () => {
    expect(selectRelevantAds(ads, null, "", data)).toHaveLength(3);
  });

  it("visar kategoririktade + generella annonser vid kategorifilter", () => {
    const result = selectRelevantAds(ads, "bygg", "", data);
    expect(result.map((a) => a.id).sort()).toEqual(["a-bygg", "a-general"]);
  });

  it("visar bara generella annonser för kategori utan riktade annonser", () => {
    const result = selectRelevantAds(ads, "transport", "", data);
    expect(result.map((a) => a.id)).toEqual(["a-general"]);
  });

  it("visar generella + annonser vars kategori finns bland sökträffarna", () => {
    // söker "café" → bara restaurang-företag i träfflistan
    const hits = filterBusinesses(data, categories, null, "café");
    const result = selectRelevantAds(ads, null, "café", hits);
    expect(result.map((a) => a.id).sort()).toEqual(["a-general", "a-rest"]);
  });

  it("innehåller aldrig dubletter (varje annons-id en gång)", () => {
    const result = selectRelevantAds(ads, "bygg", "", data);
    const ids = result.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
