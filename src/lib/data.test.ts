import { describe, it, expect } from "vitest";
import { staticCategories, staticBusinesses, getCategory } from "./data";

describe("staticCategories", () => {
  it("har unika id:n", () => {
    const ids = staticCategories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("har unika sortOrder-värden", () => {
    const orders = staticCategories.map((c) => c.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("har giltiga hex-färger", () => {
    for (const c of staticCategories) {
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(c.bgColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("staticBusinesses", () => {
  it("har unika id:n", () => {
    const ids = staticBusinesses.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("refererar bara till befintliga kategorier", () => {
    const catIds = new Set(staticCategories.map((c) => c.id));
    for (const b of staticBusinesses) {
      expect(catIds.has(b.categoryId)).toBe(true);
    }
  });

  it("har rimliga betyg (0–5)", () => {
    for (const b of staticBusinesses) {
      expect(b.rating).toBeGreaterThanOrEqual(0);
      expect(b.rating).toBeLessThanOrEqual(5);
    }
  });

  it("har e-post som innehåller @", () => {
    for (const b of staticBusinesses) {
      expect(b.email).toContain("@");
    }
  });

  it("har initialer på max 3 tecken", () => {
    for (const b of staticBusinesses) {
      expect(b.initials.length).toBeGreaterThan(0);
      expect(b.initials.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("getCategory", () => {
  it("hittar en kategori via id", () => {
    expect(getCategory(staticCategories, "bygg")?.name).toBe("Bygg & Hantverk");
  });

  it("returnerar undefined för okänt id", () => {
    expect(getCategory(staticCategories, "finns-ej")).toBeUndefined();
  });
});
