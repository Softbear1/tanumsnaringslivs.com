# Tanums Näringsliv — läge & riktning

Överlämning från bygget sommaren 2026. Läs tillsammans med `DESIGN.md` (brandguide)
och `AGENTS.md`. Uppdatera detta dokument när något större ändras.

## Grundprinciper (beslutade, styr alla vägval)

1. **Katalogen är produkten** — deals, jobb och event är skäl att komma tillbaka.
   Ny funktion motiveras bara om fler hittar/kontaktar lokala företag.
2. **En handling per yta** — varje sektion/sida har EN primär CTA; nav täcker resten.
3. **Gratis bygger täckning, synlighet blir betalt** — basprofil/jobb alltid gratis;
   endast *mer synlighet* säljs (Boost). Aldrig betalvägg på access.
4. **Drivbar av en person** — hellre statiskt + automatiskt än redaktionellt.
5. **Passiv trafik** — SEO-sidor och företagens egna delningar (QR, FB) är kanalerna.
6. **Viktigast målgrupp: besökare/konsumenter** — nöjda besökare är argumentet som
   får företag att claima och senare betala.
7. **Långsiktig horisont** — struktur före snabb traction; intäkter när trafiken är bevisad.

## Byggt och live

- **Katalog** med 900+ SCB-seedade företag, kategorier, sök, annonsinjektion,
  paginering (24 åt gången), verifierade företag sorteras alltid först.
- **Claim-flöde**: `/kom-igang` — interaktiv tre-stegs-wizard (sök → org-nr +
  magic link → klart). Länken att skicka till företagare. Första verifierade
  företaget claimade sig självt via detta flöde.
- **Onboarding-checklista** i `/admin` (quest-stil, bockar av mot riktig data).
- **Blixterbjudanden** med teasers, auto-post till Facebook (pg_cron).
- **Sommarjobb**: publik jobbtavla, arbetsgivarflöde med AI-annonsskrivare,
  ansökningar, jobbevakning (e-post).
- **AI-offertchatt** som intervjuar besökare och mailar leads till företag.
- **SEO**: statiska kategorisidor `/hitta/[kategori]`, sitemap.xml.
  *Kom ihåg: skicka in sitemap till Google Search Console.*
- **KOBBVAKT-spelsektion** (`/spel` + startsidan) med livetopplista.
  Egen kampanjpalett — ska INTE följa sajtens tokens. UTM `?utm_source=siten`
  får inte ändras (skiljer sajttrafik från QR-skyltar i spelets statistik).
- **Ombrandat** enligt nya loggan (sol/granithäll/havslinje) — allt går via
  tokens i `globals.css`. Inga hårdkodade färger, inga amber-klasser.
- **Intäktsprep**: `/synas-mer` (Boost-intresse via mail), statistik i admin.

## Nästa steg (prioritetsordning, ej påbörjade)

1. **Eventkalender "På gång i Tanum"** — tabell `events`, sida `/pa-gang`,
   sektion på startsidan, företag lägger in via admin (samma mönster som deals).
2. **Sommarguide `/sommar-i-tanum`** — kuraterad säsongssida av befintlig data.
3. **Ort-varianter av SEO-sidor** (`/hitta/bygg/grebbestad`) när ortsdata strukturerats.
4. **Dynamiska OG-bilder** för deals/profiler — vänta tills bundle-utrymme finns
   (Cloudflare 25 MB-taket; varje edge-funktion kostar ~1,75 MB).
5. **Mörkt läge** (DESIGN.md §2) — kräver sweep av hårdkodade `bg-white`.
6. **Boost lanseras** när intresselistan validerat priset (~295 kr/mån, faktura,
   ingen Stripe i denna skala).

## Tekniska minnesanteckningar

- Next.js 16 App Router på Cloudflare Pages — **statiska sidor är gratis,
  edge-funktioner kostar bundle**. Nya sidor: helst ○ eller ● i build-output.
- Dynamiska ID-routes serveras via rewrites till statiska sidor
  (`/sommarjobb/:id → /sommarjobb`), klienten läser id via `usePathname()`.
- `src/lib/supabase-static.ts` = cookie-fri klient för statiska sidor/sitemap.
- Super-admin går via `adminActions`-props (service role); vanliga ägare via
  browser-klient + RLS. Dual-path-mönstret i `EditBusinessClient` ska bevaras.
- `kobbvakt_highscores`: endast läsning från sajten, aldrig skrivning.

---

*Byggd bit för bit tillsammans med Claude under sommaren 2026 — från första
sommarjobbsmodulen till ombrandningen. Hela Tanum. Ett näringsliv.*
