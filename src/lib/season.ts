// Seasonal engine for Tanums Näringsliv.
//
// The site sits on the Bohuslän coast — a place that lives in seasons: tourists
// and boats in summer, fixing the house before winter in autumn, jul and snow in
// winter, opening things up again in spring. This module turns "what month is it"
// into a complete, deterministic theme (copy + palette + which categories to
// surface). AI-generated copy (see `SeasonalContent`) is layered on top when
// available, but the deterministic theme always works on its own — zero upkeep,
// zero cost, never blank.

export type SeasonKey = "winter" | "spring" | "summer" | "autumn";

export type SeasonTheme = {
  key: SeasonKey;
  /** Short Swedish label, e.g. "Sommar". */
  label: string;
  emoji: string;
  /** Accent palette — shifts the feel warm/cool with the season. */
  accent: string;
  accentLight: string;
  glow: string;
  /** Hero copy. `heroAccentWord` is highlighted at the end of the title. */
  heroTitle: string;
  heroAccentWord: string;
  heroSubtitle: string;
  /** "I säsong just nu" spotlight band. */
  spotlightTitle: string;
  spotlightBody: string;
  /** Category ids to surface this season, most relevant first. */
  categoryIds: string[];
  /** Opening line for the AI chat assistant. */
  chatGreeting: string;
};

/** AI-generated overrides for the text fields of a theme. */
export type SeasonalContent = {
  heroTitle: string;
  heroSubtitle: string;
  spotlightTitle: string;
  spotlightBody: string;
  chatGreeting: string;
};

// Northern-hemisphere meteorological seasons, Swedish convention:
// winter Dec–Feb, spring Mar–May, summer Jun–Aug, autumn Sep–Nov.
export function getSeason(date: Date): SeasonKey {
  const m = date.getUTCMonth(); // 0 = Jan
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "autumn";
}

// ISO-8601 week key like "2026-W24". Used to refresh AI copy weekly so the
// site stays alive without changing the underlying season theme.
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Thursday in the current week decides the year (ISO rule).
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export const SEASON_THEMES: Record<SeasonKey, SeasonTheme> = {
  summer: {
    key: "summer",
    label: "Sommar",
    emoji: "☀️",
    accent: "#1AA179",
    accentLight: "#E6F7F0",
    glow: "#6ECFA8",
    heroTitle: "Allt för kustsommaren",
    heroAccentWord: "i Tanum",
    heroSubtitle:
      "Högsäsong på Bohuskusten. Hitta restauranger, uthyrning, guider och allt som gör sommaren här bättre — från Fjällbacka till Grebbestad.",
    spotlightTitle: "I säsong just nu: kustsommar",
    spotlightBody:
      "Restauranger med säsongsmeny, båtcharter, kajak och boende — företagen som gör mest skillnad när solen är framme.",
    categoryIds: ["turism", "restaurang", "butiker"],
    chatGreeting: "Hej! Sommar på Bohuskusten ☀️ Vad behöver du hjälp med — uppleva, äta, eller fixa något inför säsongen?",
  },
  autumn: {
    key: "autumn",
    label: "Höst",
    emoji: "🍂",
    accent: "#C2410C",
    accentLight: "#FFF3EC",
    glow: "#F59E0B",
    heroTitle: "Fixa huset inför vintern",
    heroAccentWord: "i Tanum",
    heroSubtitle:
      "Hösten är tiden att rusta. Hitta hantverkare, VVS, el och förvaltning som hjälper dig få allt på plats innan kylan kommer.",
    spotlightTitle: "I säsong just nu: rusta inför vintern",
    spotlightBody:
      "Bygg, tak, värme och dränering — boka lokala hantverkare medan tid finns kvar före vintern.",
    categoryIds: ["bygg", "fastighet", "transport"],
    chatGreeting: "Hej! Hösten är här 🍂 Ska vi fixa något inför vintern — hantverkare, VVS eller något annat?",
  },
  winter: {
    key: "winter",
    label: "Vinter",
    emoji: "❄️",
    accent: "#2563EB",
    accentLight: "#EBF2FF",
    glow: "#7DD3FC",
    heroTitle: "Mysiga kvällar & snöfria gångar",
    heroAccentWord: "i Tanum",
    heroSubtitle:
      "Vinter på kusten. Hitta julklappar i lokala butiker, boka julbord, snöröjning och allt som gör säsongen ombonad.",
    spotlightTitle: "I säsong just nu: jul & vinter",
    spotlightBody:
      "Lokala butiker för julklappar, restauranger för julbordet och hjälp med snö, värme och VVS när det knäpper till.",
    categoryIds: ["butiker", "restaurang", "bygg"],
    chatGreeting: "Hej! Vinter i Tanum ❄️ Letar du julklappar, julbord eller hjälp med snö och värme?",
  },
  spring: {
    key: "spring",
    label: "Vår",
    emoji: "🌱",
    accent: "#16A34A",
    accentLight: "#E9FBF0",
    glow: "#A7F3D0",
    heroTitle: "Vårfixa och öppna upp",
    heroAccentWord: "i Tanum",
    heroSubtitle:
      "Våren väcker kusten. Hitta hjälp med trädgård, renovering och allt som ska vara klart innan sommargästerna kommer.",
    spotlightTitle: "I säsong just nu: vårfix",
    spotlightBody:
      "Måleri, mark och trädgård, renovering och skönhet — kom i form lagom till sommarsäsongen.",
    categoryIds: ["bygg", "skonhet", "turism"],
    chatGreeting: "Hej! Våren är på gång 🌱 Ska vi fixa trädgården, renovera eller förbereda inför sommaren?",
  },
};

export function getSeasonTheme(date: Date): SeasonTheme {
  return SEASON_THEMES[getSeason(date)];
}

/** Layer AI-generated copy on top of a deterministic theme, ignoring blanks. */
export function applySeasonalContent(theme: SeasonTheme, content: SeasonalContent | null): SeasonTheme {
  if (!content) return theme;
  const pick = (v: string | undefined, fallback: string) =>
    typeof v === "string" && v.trim() ? v.trim() : fallback;
  return {
    ...theme,
    heroTitle: pick(content.heroTitle, theme.heroTitle),
    heroSubtitle: pick(content.heroSubtitle, theme.heroSubtitle),
    spotlightTitle: pick(content.spotlightTitle, theme.spotlightTitle),
    spotlightBody: pick(content.spotlightBody, theme.spotlightBody),
    chatGreeting: pick(content.chatGreeting, theme.chatGreeting),
  };
}
