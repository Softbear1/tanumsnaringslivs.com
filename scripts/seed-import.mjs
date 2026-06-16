// PROTOTYP: hämtar Tanum-företag från fria endpoints, mappar SNI -> kategori,
// och skriver en förhandsgransknings-fil. Publicerar INGET till databasen.
//
// Körs med: node scripts/seed-import.mjs
// Output:   /tmp/tanum-seed-preview.json  (+ sammanfattning i terminalen)
//
// Källor (ingen nyckel, "guest"-läge):
//   - https://data.foretagsapi.se/v1/search  (namnsök -> namn, adress, SNI, beskrivning)
//   - https://abpi.se/api/<orgnr>/data        (berikning -> telefon, koordinater)

import { writeFileSync } from "node:fs";

const SEARCH_API = "https://data.foretagsapi.se/v1/search";
const ENRICH_API = (org) => `https://abpi.se/api/${org}/data`;

// Postorter som ligger i Tanums kommun (versaler för matchning).
const TANUM_ORTER = new Set([
  "TANUMSHEDE", "FJÄLLBACKA", "GREBBESTAD", "HAMBURGSUND", "RABBALSHEDE",
  "KVILLE", "SANNÄS", "HÄLLEVADSHOLM", "HEESTRAND", "BACKA", "ÖSTAD",
  "BULLAREN", "LUR", "TANUM",
]);

// Sökord: ortnamn (hittar företag med orten i namnet) + generiska bransch-/
// affärsord (hittar Tanum-företag UTAN orten i namnet, filtreras sen på postort).
const SEARCH_TERMS = [
  "Tanumshede", "Fjällbacka", "Grebbestad", "Hamburgsund", "Rabbalshede",
  "Kville", "Sannäs", "Hällevadsholm", "Tanum", "Bullaren", "Bohus", "Kosters",
  "bygg", "måleri", "snickeri", "el", "vvs", "mark", "café", "restaurang",
  "krog", "pizzeria", "frisör", "salong", "massage", "butik", "handel",
  "transport", "taxi", "åkeri", "data", "it", "web", "fastighet", "mäklare",
  "förvaltning", "camping", "charter", "vandrarhem", "bageri", "glass",
];

// SNI (2-siffrig avdelning) -> en av sajtens 8 kategorier.
// Osäkra koder lämnas omappade (null) för manuell granskning — vi gissar inte.
const SNI_TO_CATEGORY = {
  // Bygg & Hantverk
  "41": "bygg", "42": "bygg", "43": "bygg",
  // Restaurang & Café (inkl. bageri/livsmedelstillverkning)
  "56": "restaurang", "10": "restaurang", "11": "restaurang",
  // Skönhet & Hälsa
  "86": "skonhet", "87": "skonhet", "88": "skonhet", "96": "skonhet",
  // Butiker / handel
  "47": "butiker", "46": "butiker", "45": "butiker",
  // Transport
  "49": "transport", "50": "transport", "51": "transport",
  "52": "transport", "53": "transport",
  // IT & Teknik
  "62": "it", "63": "it",
  // Fastighet
  "68": "fastighet", "81": "fastighet",
  // Turism & Upplevelser
  "55": "turism", "79": "turism", "90": "turism", "91": "turism", "93": "turism",
};

const initialsFrom = (name) =>
  name.replace(/\b(AB|HB|KB|Aktiebolag|i|och|&)\b/gi, " ")
    .trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

// Enskild firma (jurform-koder för EF i SCB) -> dölj gatuadress, visa bara ort.
const isEnskildFirma = (c) => c.jurform === 10 || /enskild/i.test(c.legalForm || "");

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

async function collect() {
  const byOrg = new Map();
  for (const q of SEARCH_TERMS) {
    try {
      const d = await postJSON(SEARCH_API, { q, limit: 100 });
      for (const c of d.companies || []) {
        const city = ((c.postalAddress || {}).city || "").toUpperCase();
        if (TANUM_ORTER.has(city) && !byOrg.has(c.orgNumber)) byOrg.set(c.orgNumber, c);
      }
    } catch (e) {
      console.error(`  sök '${q}' misslyckades: ${e.message}`);
    }
  }
  return [...byOrg.values()];
}

function toListing(c) {
  const sni = (c.sniCodes || {}).sni1 || "";
  const category = SNI_TO_CATEGORY[sni.slice(0, 2)] ?? null;
  const ef = isEnskildFirma(c);
  const addr = c.postalAddress || {};
  return {
    org_number: c.orgNumber,
    name: c.name,
    category_id: category,                       // null = behöver manuell kategori
    sni_code: sni,
    sni_name: (c.sniCodes || {}).sni1_name || null,
    description: c.businessDescription || null,
    // GDPR: dölj gatuadress för enskild firma, visa bara ort.
    address: ef ? (addr.city || "") : [addr.street, addr.city].filter(Boolean).join(", "),
    city: addr.city || null,
    initials: initialsFrom(c.name),
    legal_form: c.legalForm || null,
    is_sole_trader: ef,
    marketing_block: c.reklamsparr === 1 || c.reklamsparr === true,
    status: "preliminary",                       // ej bekräftad av företaget
    source: "foretagsapi.se",
  };
}

async function enrich(listing) {
  try {
    const d = await (await fetch(ENRICH_API(listing.org_number))).json();
    const phone = (d.basic_info?.phone_numbers || [])[0] || d.basic_info?.legal_phone_number || null;
    const coords = (d.location?.coordinates || [])[0];
    return {
      ...listing,
      phone: phone || null,
      home_page: d.basic_info?.home_page || null,
      lat: coords?.ycoordinate ?? null,
      lng: coords?.xcoordinate ?? null,
      marketing_block: listing.marketing_block || d.marketing_protection === true,
    };
  } catch {
    return listing;
  }
}

const log = (...a) => console.log(...a);

const companies = await collect();
let listings = companies.map(toListing);

// Berika ett urval via abpi (max ~30, respekterar dygnsgräns 100/dag).
const SAMPLE = Math.min(30, listings.length);
log(`Berikar ${SAMPLE} av ${listings.length} via abpi.se ...`);
for (let i = 0; i < SAMPLE; i++) listings[i] = await enrich(listings[i]);

writeFileSync("/tmp/tanum-seed-preview.json", JSON.stringify(listings, null, 2));

// --- Sammanfattning ---
const byCat = {};
for (const l of listings) byCat[l.category_id ?? "(omappad)"] = (byCat[l.category_id ?? "(omappad)"] || 0) + 1;
log(`\n=== ${listings.length} unika Tanum-företag ===`);
log("Per kategori:");
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => log(`  ${k.padEnd(12)} ${v}`));
log(`Enskilda firmor: ${listings.filter((l) => l.is_sole_trader).length}`);
log(`Reklamspärr-flaggade: ${listings.filter((l) => l.marketing_block).length}`);
log(`Med telefon (berikade): ${listings.filter((l) => l.phone).length}`);
log(`Med koordinater: ${listings.filter((l) => l.lat).length}`);
log(`\nExempel (10 första, berikade):`);
listings.slice(0, 10).forEach((l) =>
  log(`  • ${l.name}  [${l.category_id ?? "?"}]  ${l.city ?? ""}  ${l.phone ? "📞" + l.phone : ""}`));
log(`\nFullständig förhandsgranskning: /tmp/tanum-seed-preview.json`);
