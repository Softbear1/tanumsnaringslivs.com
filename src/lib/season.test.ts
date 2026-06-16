import { describe, it, expect } from "vitest";
import {
  getSeason,
  isoWeekKey,
  getSeasonTheme,
  applySeasonalContent,
  SEASON_THEMES,
  type SeasonalContent,
} from "./season";
import { staticCategories } from "./data";

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

describe("getSeason", () => {
  it("mappar månader till rätt säsong", () => {
    expect(getSeason(utc(2026, 0, 15))).toBe("winter"); // jan
    expect(getSeason(utc(2026, 1, 15))).toBe("winter"); // feb
    expect(getSeason(utc(2026, 2, 15))).toBe("spring"); // mar
    expect(getSeason(utc(2026, 4, 15))).toBe("spring"); // maj
    expect(getSeason(utc(2026, 5, 15))).toBe("summer"); // jun
    expect(getSeason(utc(2026, 7, 15))).toBe("summer"); // aug
    expect(getSeason(utc(2026, 8, 15))).toBe("autumn"); // sep
    expect(getSeason(utc(2026, 10, 15))).toBe("autumn"); // nov
    expect(getSeason(utc(2026, 11, 15))).toBe("winter"); // dec
  });
});

describe("isoWeekKey", () => {
  it("ger ett stabilt veckonyckel-format", () => {
    expect(isoWeekKey(utc(2026, 5, 16))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("ger samma nyckel för dagar i samma vecka", () => {
    // Mån–sön samma ISO-vecka
    expect(isoWeekKey(utc(2026, 5, 15))).toBe(isoWeekKey(utc(2026, 5, 21)));
  });
});

describe("SEASON_THEMES", () => {
  it("har giltiga hex-färger och relevanta kategorier för varje säsong", () => {
    const catIds = new Set(staticCategories.map((c) => c.id));
    for (const theme of Object.values(SEASON_THEMES)) {
      expect(theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.glow).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.categoryIds.length).toBeGreaterThan(0);
      for (const id of theme.categoryIds) {
        expect(catIds.has(id)).toBe(true);
      }
    }
  });
});

describe("getSeasonTheme", () => {
  it("returnerar temat som matchar datumets säsong", () => {
    expect(getSeasonTheme(utc(2026, 6, 1)).key).toBe("summer");
    expect(getSeasonTheme(utc(2026, 9, 1)).key).toBe("autumn");
  });
});

describe("applySeasonalContent", () => {
  const base = SEASON_THEMES.summer;

  it("behåller temat när inget AI-innehåll finns", () => {
    expect(applySeasonalContent(base, null)).toEqual(base);
  });

  it("lägger AI-copy ovanpå men behåller palett och kategorier", () => {
    const ai: SeasonalContent = {
      heroTitle: "Ny rubrik",
      heroSubtitle: "Ny underrubrik",
      spotlightTitle: "Nytt spotlight",
      spotlightBody: "Ny text",
      chatGreeting: "Ny hälsning",
    };
    const merged = applySeasonalContent(base, ai);
    expect(merged.heroTitle).toBe("Ny rubrik");
    expect(merged.chatGreeting).toBe("Ny hälsning");
    expect(merged.accent).toBe(base.accent);
    expect(merged.categoryIds).toEqual(base.categoryIds);
  });

  it("faller tillbaka på temat för tomma fält", () => {
    const ai = {
      heroTitle: "  ",
      heroSubtitle: "",
      spotlightTitle: "X",
      spotlightBody: "",
      chatGreeting: "",
    } as SeasonalContent;
    const merged = applySeasonalContent(base, ai);
    expect(merged.heroTitle).toBe(base.heroTitle);
    expect(merged.spotlightTitle).toBe("X");
  });
});
