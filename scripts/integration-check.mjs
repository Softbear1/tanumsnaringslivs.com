// Integrationskontroll mot riktiga Supabase (publik anon-nyckel).
// Verifierar publik läsning + att RLS blockerar otillåtna skrivningar.
// Körs: node scripts/integration-check.mjs

import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

console.log("\nIntegrationskontroll mot Supabase\n");

// 1. Publik läsning av kategorier
const catRes = await fetch(`${URL_}/rest/v1/categories?select=id,name&order=sort_order`, { headers });
const cats = await catRes.json();
check("kategorier kan läsas publikt", catRes.ok && Array.isArray(cats) && cats.length > 0, `status ${catRes.status}`);
check("8 kategorier finns", cats.length === 8, `hittade ${cats?.length}`);

// 2. Publik läsning av aktiva företag
const bizRes = await fetch(`${URL_}/rest/v1/businesses?select=id,name,active&active=eq.true`, { headers });
const biz = await bizRes.json();
check("aktiva företag kan läsas publikt", bizRes.ok && Array.isArray(biz) && biz.length > 0, `status ${bizRes.status}`);

// 3. RLS: anonym insert ska BLOCKERAS (owner_id-policy kräver auth.uid())
const insRes = await fetch(`${URL_}/rest/v1/businesses`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "RLS-testföretag", category_id: "bygg", description: "ska blockeras",
    phone: "0", email: "x@y.se", address: "Gatan 0", initials: "RT",
  }),
});
check("anonym insert blockeras av RLS", insRes.status === 401 || insRes.status === 403, `status ${insRes.status} (förväntat 401/403)`);

// 4. RLS: anonym läsning av page_views (insert tillåts, men inga känsliga data exponeras felaktigt)
const pvRes = await fetch(`${URL_}/rest/v1/page_views?select=id&limit=1`, { headers });
check("page_views-tabellen svarar", pvRes.status < 500, `status ${pvRes.status}`);

console.log(`\nResultat: ${pass} godkända, ${fail} misslyckade\n`);
process.exit(fail > 0 ? 1 : 0);
