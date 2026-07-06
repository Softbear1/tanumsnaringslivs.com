# Tanums Näringsliv – Designsystem

Brand- och designguide för tanumsnaringsliv.com. Klistra in detta dokument i CLAUDE.md eller ge det som kontext till agenter som bygger på sajten.

**Koncept:** Sol som stiger bakom en rosa Bohuslän-granithäll, över en havslinje. Symboliserar tillväxt och framtid för hela kommunen – kust och inland. Slogan: **"Hela Tanum. Ett näringsliv."**

**Känsla:** Varm, jordnära, trovärdig, modern skandinavisk minimalism. Inte "corporate tech", inte gullig turistbyrå. Tänk: kommunal legitimitet möter startup-tydlighet.

---

## 1. Färgpalett

### Primärfärger (från loggan)

| Namn | Hex | Användning |
|---|---|---|
| **Hav** (primär) | `#16657A` | Primär varumärkesfärg. Länkar, primärknappar, rubrik-accenter, "Näringsliv" i wordmark |
| **Sol** (accent) | `#E8A13C` | Accent/energi. CTA-highlights, badges, ikoner, hover-detaljer. Används sparsamt |
| **Granit** (sekundär) | `#C4877A` | Sekundär värme. Dekorativa ytor, illustrationer, kategorimarkeringar |
| **Skiffer** (text) | `#1C2B2A` | Brödtext och rubriker på ljus bakgrund |

### Havsskala (primär ramp)

| Steg | Hex | Användning |
|---|---|---|
| hav-50 | `#E8F2F5` | Tonade bakgrundsytor, info-boxar |
| hav-100 | `#C6E1E8` | Hover på tonade ytor, taggar |
| hav-300 | `#6FB4C4` | Dekorativa element, grafer |
| hav-500 | `#16657A` | Standard – knappar, länkar |
| hav-700 | `#0E4757` | Hover/active på knappar, rubriker |
| hav-900 | `#072B36` | Mörk text på hav-50/100, footer-bakgrund |

### Solskala (accent-ramp)

| Steg | Hex | Användning |
|---|---|---|
| sol-50 | `#FDF4E3` | Highlight-bakgrunder ("Ny!", sponsrat innehåll) |
| sol-100 | `#F9E3BC` | Badge-bakgrunder |
| sol-500 | `#E8A13C` | Ikoner, accenter, stjärnmarkeringar |
| sol-700 | `#B87A1E` | Text på sol-50/100-bakgrund |

### Granitskala (sekundär ramp)

| Steg | Hex | Användning |
|---|---|---|
| granit-50 | `#F8EEEB` | Alternativ sektionsbakgrund |
| granit-100 | `#EDD5CE` | Kort-hover, dekorativt |
| granit-500 | `#C4877A` | Illustrationer, kategorifärg |
| granit-700 | `#96604F` | Text på granit-50/100-bakgrund |

### Neutraler

| Namn | Hex | Användning |
|---|---|---|
| sand-0 | `#FAF8F4` | Sidbakgrund (varm off-white – aldrig ren vit sida) |
| sand-50 | `#F3F0E9` | Kortbakgrund, avdelare mellan sektioner |
| vit | `#FFFFFF` | Kort och paneler ovanpå sand-0 |
| grå-400 | `#6B6F6C` | Sekundär text, bildtexter, metadata |
| grå-200 | `#D8D6CF` | Kantlinjer (borders) |
| skiffer | `#1C2B2A` | Primär text |

### Semantiska färger

| Roll | Hex | Bakgrund (tint) |
|---|---|---|
| Success | `#2E7D4F` | `#E5F2EA` |
| Varning | `#B87A1E` | `#FDF4E3` (delar solskalan) |
| Fel | `#B3402E` | `#FAEAE7` |

### Regler för färganvändning

- **Hav är arbetshästen.** 90 % av interaktiva element är hav-500/700.
- **Sol är kryddan.** Max en sol-accent per vy/sektion – annars tappar den kraft. Aldrig sol som knappbakgrund med vit text (för låg kontrast) – använd sol-100-bakgrund med sol-700-text.
- **Granit är dekorativ**, aldrig interaktiv. Inga granit-knappar eller granit-länkar.
- Text på tonad bakgrund använder alltid den mörka änden av **samma** ramp (t.ex. hav-900 på hav-50). Aldrig svart eller grå på färgade ytor.
- Sidbakgrund är alltid sand-0, aldrig `#FFFFFF`. Vitt reserveras för kort som ska "lyfta" från sidan.

---

## 2. Mörkt läge

| Ljus | Mörk motsvarighet |
|---|---|
| sand-0 bakgrund | `#131C1B` |
| vit (kort) | `#1D2827` |
| skiffer text | `#F1EFE8` |
| grå-400 sekundärtext | `#B4B2A9` |
| grå-200 border | `#37403F` |
| hav-500 | `#4FA8BE` |
| sol-500 | `#F0B45A` |
| granit-500 | `#D49A8C` |

---

## 3. CSS-variabler (klistra in i global CSS)

```css
:root {
  /* Primärfärger */
  --hav-50: #E8F2F5;
  --hav-100: #C6E1E8;
  --hav-300: #6FB4C4;
  --hav-500: #16657A;
  --hav-700: #0E4757;
  --hav-900: #072B36;

  --sol-50: #FDF4E3;
  --sol-100: #F9E3BC;
  --sol-500: #E8A13C;
  --sol-700: #B87A1E;

  --granit-50: #F8EEEB;
  --granit-100: #EDD5CE;
  --granit-500: #C4877A;
  --granit-700: #96604F;

  /* Neutraler */
  --sand-0: #FAF8F4;
  --sand-50: #F3F0E9;
  --vit: #FFFFFF;
  --gra-200: #D8D6CF;
  --gra-400: #6B6F6C;
  --skiffer: #1C2B2A;

  /* Semantiska */
  --success: #2E7D4F;
  --success-bg: #E5F2EA;
  --varning: #B87A1E;
  --varning-bg: #FDF4E3;
  --fel: #B3402E;
  --fel-bg: #FAEAE7;

  /* Aliaser (använd dessa i komponenter) */
  --bg-page: var(--sand-0);
  --bg-card: var(--vit);
  --bg-section-alt: var(--sand-50);
  --text-primary: var(--skiffer);
  --text-secondary: var(--gra-400);
  --border: var(--gra-200);
  --brand: var(--hav-500);
  --brand-hover: var(--hav-700);
  --accent: var(--sol-500);

  /* Form */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 3px rgba(28, 43, 42, 0.08);
  --shadow-lift: 0 4px 16px rgba(28, 43, 42, 0.10);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: #131C1B;
    --bg-card: #1D2827;
    --bg-section-alt: #182221;
    --text-primary: #F1EFE8;
    --text-secondary: #B4B2A9;
    --border: #37403F;
    --brand: #4FA8BE;
    --brand-hover: #6FB4C4;
    --accent: #F0B45A;
  }
}
```

---

## 4. Tailwind-konfiguration

```ts
// tailwind.config.ts (utdrag) – eller motsvarande @theme-block i Tailwind v4
export default {
  theme: {
    extend: {
      colors: {
        hav: {
          50: '#E8F2F5', 100: '#C6E1E8', 300: '#6FB4C4',
          500: '#16657A', 700: '#0E4757', 900: '#072B36',
        },
        sol: {
          50: '#FDF4E3', 100: '#F9E3BC', 500: '#E8A13C', 700: '#B87A1E',
        },
        granit: {
          50: '#F8EEEB', 100: '#EDD5CE', 500: '#C4877A', 700: '#96604F',
        },
        sand: { 0: '#FAF8F4', 50: '#F3F0E9' },
        skiffer: '#1C2B2A',
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(28,43,42,0.08)',
        lift: '0 4px 16px rgba(28,43,42,0.10)',
      },
    },
  },
}
```

---

## 5. Typografi

**Typsnitt:** [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts (eller `@fontsource/inter` i Vite). Fallback: `system-ui, sans-serif`.

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

| Element | Storlek | Vikt | Färg | Övrigt |
|---|---|---|---|---|
| H1 | 36–44 px (2.5rem) | 700 | skiffer | line-height 1.15, letter-spacing -0.02em |
| H2 | 28 px (1.75rem) | 600 | skiffer | line-height 1.2 |
| H3 | 20 px (1.25rem) | 600 | skiffer | |
| Brödtext | 16 px (1rem) | 400 | skiffer | line-height 1.65 |
| Liten text/metadata | 14 px | 400 | grå-400 | |
| Slogan/tagline | 14 px | 500 | grå-400 | UPPERCASE, letter-spacing 0.15em |
| Knapptext | 15 px | 600 | – | |

**Regler:**
- Endast vikterna 400, 600, 700. Aldrig 500 i brödtext, aldrig 800/900.
- Rubriker i meningsform ("Hitta sommarjobb i Tanum"), aldrig Versaler I Varje Ord.
- UPPERCASE endast för slogan och små kategorietiketter (12–14 px med letter-spacing).

---

## 6. Logotyp

### Huvudlogga (liggande, ljus bakgrund)

```svg
<svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tanums Näringsliv">
  <defs>
    <clipPath id="tn-sea"><rect x="0" y="0" width="180" height="112"/></clipPath>
  </defs>
  <g clip-path="url(#tn-sea)">
    <circle fill="#E8A13C" cx="118" cy="62" r="26"/>
    <path fill="#C4877A" d="M 2 112 C 12 66, 56 44, 90 44 C 124 44, 108 78, 136 96 C 148 104, 162 108, 174 112 Z"/>
  </g>
  <line stroke="#16657A" stroke-width="4" stroke-linecap="round" x1="2" y1="112" x2="178" y2="112"/>
  <text x="200" y="78" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="600">
    <tspan fill="#1C2B2A">Tanums </tspan><tspan fill="#16657A">Näringsliv</tspan>
  </text>
  <text x="200" y="106" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500" fill="#6B6F6C" letter-spacing="2.5">HELA TANUM. ETT NÄRINGSLIV.</text>
</svg>
```

### Ikon (kvadratisk – favicon, profilbild, app-ikon)

```svg
<svg viewBox="0 0 180 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tanums Näringsliv">
  <defs>
    <clipPath id="tn-sea-icon"><rect x="0" y="0" width="180" height="112"/></clipPath>
  </defs>
  <g clip-path="url(#tn-sea-icon)">
    <circle fill="#E8A13C" cx="118" cy="62" r="26"/>
    <path fill="#C4877A" d="M 2 112 C 12 66, 56 44, 90 44 C 124 44, 108 78, 136 96 C 148 104, 162 108, 174 112 Z"/>
  </g>
  <line stroke="#16657A" stroke-width="6" stroke-linecap="round" x1="4" y1="114" x2="176" y2="114"/>
</svg>
```

### Mörk bakgrund – byt färger till:

- Sol: `#F0B45A`
- Granit: `#D49A8C`
- Hav (linje + "Näringsliv"): `#4FA8BE`
- "Tanums" + slogan: `#F1EFE8` / `#B4B2A9`

### Logotypregler

- **Friyta:** minst solens diameter (26 px i basstorlek) runt hela loggan.
- **Minsta storlek:** liggande logga 180 px bred; under det används enbart ikonen.
- Placeras alltid på sand-0, vit eller mörk bakgrund – aldrig på foto utan tonplatta.
- Skala aldrig icke-proportionerligt, rotera inte, ändra inte inbördes färger.
- I sidhuvudet: ikon + wordmark utan slogan (sloganen används i hero, footer och delningsbilder).

---

## 7. Komponenter

### Knappar

```css
/* Primär */
background: var(--brand); color: #fff;
border-radius: var(--radius-md); padding: 10px 20px;
font-weight: 600; font-size: 15px;
/* hover: */ background: var(--brand-hover);

/* Sekundär */
background: transparent; color: var(--brand);
border: 1.5px solid var(--brand); border-radius: var(--radius-md);

/* Ghost */
background: transparent; color: var(--text-primary);
/* hover: */ background: var(--sand-50);
```

- Max **en** primärknapp per vy/sektion.
- CTA-text: verb först, 1–3 ord ("Skapa annons", "Hitta sommarjobb").

### Kort

```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-card);
padding: 20px 24px;
/* hover (klickbara kort): */ box-shadow: var(--shadow-lift); border-color: var(--hav-300);
```

### Badges/taggar

```css
/* Kategori */    background: var(--hav-50);    color: var(--hav-900);
/* Nyhet/utvald */ background: var(--sol-50);    color: var(--sol-700);
/* Ort */          background: var(--granit-50); color: var(--granit-700);
font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
```

### Länkar

Hav-500, ingen understrykning i vila, understrykning vid hover. Aldrig sol-färgade länkar.

### Sektioner

Växla sand-0 / sand-50 för att skapa rytm på långa sidor. Hero kan använda hav-900-bakgrund med ljus text och sol-accent för maximal kontrast.

---

## 8. Ton och språk (för agenter som skriver copy)

- Svenska, enkel och rak – "bondsvenska". Inga anglicismer när svenska ord finns.
- Meningsform i rubriker och knappar.
- Du-tilltal. Varmt men inte fjäskigt.
- Inga utropstecken i systemtext. Max ett i marknadscopy per sektion.
- Undvik: "unik", "sömlös", "revolutionerande", "boosta". Säg vad det gör istället.
- Sloganen skrivs alltid exakt: **Hela Tanum. Ett näringsliv.** (versal H, punkt efter båda leden).

---

## 9. Snabbreferens för agenter

```
PRIMÄR:    #16657A (hav)  |  hover #0E4757
ACCENT:    #E8A13C (sol) – sparsamt, aldrig knappbakgrund
SEKUNDÄR:  #C4877A (granit) – endast dekorativ
TEXT:      #1C2B2A  |  sekundär #6B6F6C
BAKGRUND:  #FAF8F4 (sida)  |  #FFFFFF (kort)  |  #F3F0E9 (alt sektion)
BORDER:    #D8D6CF
FONT:      Inter (400/600/700)
RADIUS:    6 / 10 / 16 px
SLOGAN:    Hela Tanum. Ett näringsliv.
```
