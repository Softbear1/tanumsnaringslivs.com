// SCB Seed Worker — hämtar Tanums företag (kommun 1435) från SCB:s allmänna
// företagsregister via mTLS och upsertar dem i Supabase som oclaimerade listningar.
//
// mTLS: certifikatet laddas upp till Cloudflare som en mTLS-certifikat-binding
// (env.SCB_CERT). env.SCB_CERT.fetch() presenterar klientcertet automatiskt.
//
// Körs via cron (nattligen) eller manuellt via HTTP med ?secret=<SEED_SECRET>.
// Första gången: kör ?mode=discover för att läsa ut exakta kategori-/variabel-id:n
// och justera REQUEST_VARIABLER/KOMMUN_KATEGORI nedan om de avviker.

import { mapSniToCategory } from "./sni-map";

interface Env {
  SCB_CERT: Fetcher;                 // mTLS-binding (Cloudflare)
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SEED_SECRET: string;
}

const SCB_BASE = "https://privateapi.scb.se/nv0101/v1/sokpavar";
const TANUM_KOMMUN = "1435";

const KOMMUN_KATEGORI = "Kommun (huvudarbetsställe)";

// SCB tillåter max 2000 rader/anrop utan paginering. Tanum har ~2700 företag, så
// vi partitionerar på 2-siffrig huvudbransch i grupper (varje grupp << 2000) och
// slår ihop resultaten (deduplicerat på org-nr). Täcker 00–99.
function branschGroups(): string[][] {
  const codes: string[] = [];
  for (let i = 0; i <= 99; i++) codes.push(String(i).padStart(2, "0"));
  const groups: string[][] = [];
  for (let i = 0; i < codes.length; i += 10) groups.push(codes.slice(i, i + 10));
  return groups;
}

async function scbGet(env: Env, path: string): Promise<Response> {
  return env.SCB_CERT.fetch(`${SCB_BASE}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}

async function scbPost(env: Env, path: string, body: unknown): Promise<Response> {
  return env.SCB_CERT.fetch(`${SCB_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
}

// Filterkropp enligt sokpavar: verksamma, registrerade Tanum-företag, avgränsat
// till en grupp 2-siffriga huvudbranscher. Layouten avgör returnerade fält.
function buildQuery(branschCodes: string[]) {
  return {
    Företagsstatus: "1",
    Registreringsstatus: "1",
    Kategorier: [
      { Kategori: KOMMUN_KATEGORI, Kod: [TANUM_KOMMUN] },
      { Kategori: "2-siffrig bransch 1", Kod: branschCodes },
      { Kategori: "Juridisk form", Kod: ["49"] },
    ],
  };
}

// Svaret är platta objekt: { "Företagsnamn": "...", "OrgNr": "...", "Bransch_1, kod": "...", ... }
function str(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  return typeof v === "string" ? v.trim() : "";
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function toRecord(r: Record<string, unknown>) {
  const name = str(r, "Företagsnamn");
  const org = str(r, "OrgNr");
  if (!name || !org) return null;
  const ort = str(r, "PostOrt");
  const email = str(r, "E-post") || str(r, "Epost");
  const phone = str(r, "Telefon");
  const addr = [str(r, "PostAdress"), str(r, "PostNr"), ort].filter(Boolean).join(", ");
  const reklamKod = str(r, "Reklam, kod");
  return {
    scb_org_nr: org,
    name,
    category_id: mapSniToCategory(str(r, "Bransch_1, kod")),
    description: `${name}${ort ? ` i ${ort}` : ""}.`,
    phone,
    email,
    website: null as string | null,
    address: addr || "Tanums kommun",
    postort: ort || null,
    initials: initialsFrom(name),
    claim_email: email || null,
    reklamsparr: reklamKod === "21" || reklamKod === "22" || reklamKod === "23",
    claimed: false,
    owner_id: null as string | null,
    source: "scb",
    active: true,
    scb_synced_at: new Date().toISOString(),
  };
}

async function upsertBatch(env: Env, records: object[]): Promise<void> {
  if (records.length === 0) return;
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/businesses?on_conflict=scb_org_nr`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error(`Supabase upsert ${res.status}: ${await res.text()}`);
}

async function runSeed(env: Env): Promise<{ fetched: number; upserted: number; withEmail: number }> {
  const seen = new Set<string>();
  const records: ReturnType<typeof toRecord>[] = [];

  for (const group of branschGroups()) {
    const res = await scbPost(env, "/api/je/hamtaforetag", buildQuery(group));
    if (res.status === 404) continue;            // tom grupp
    if (!res.ok) throw new Error(`hamtaforetag ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const rec = toRecord(row);
      if (rec && !seen.has(rec.scb_org_nr)) {
        seen.add(rec.scb_org_nr);
        records.push(rec);
      }
    }
  }

  // Upsert i batchar om 500.
  for (let i = 0; i < records.length; i += 500) {
    await upsertBatch(env, records.slice(i, i + 500) as object[]);
  }

  const withEmail = records.filter((r) => r && r.claim_email).length;
  return { fetched: seen.size, upserted: records.length, withEmail };
}

async function probe(env: Env, path: string): Promise<unknown> {
  try {
    const r = await scbGet(env, path);
    const text = await r.text();
    return { path, status: r.status, contentType: r.headers.get("content-type"), body: text.slice(0, 8000) };
  } catch (e) {
    return { path, error: e instanceof Error ? e.message : String(e) };
  }
}

async function runDiscover(env: Env): Promise<unknown> {
  // Prova flera vägar/casing för att hitta rätt — SCB:s help-sida är auktoritativ.
  const paths = [
    "/help/exampleJe",
    "/api/je/koptavariabler",
    "/api/je/koptakategorier",
  ];
  const results = [];
  for (const p of paths) results.push(await probe(env, p));
  return { results };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.searchParams.get("secret") !== env.SEED_SECRET) {
      return new Response("Forbidden", { status: 403 });
    }
    try {
      const mode = url.searchParams.get("mode");
      if (mode === "discover") {
        return Response.json(await runDiscover(env));
      }
      if (mode === "count") {
        const r = await scbPost(env, "/api/je/raknaforetag", buildQuery(["41", "42", "43", "45", "46", "47", "56", "68", "96"]));
        return new Response(`status ${r.status}\n${await r.text()}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
      }
      if (mode === "sample") {
        const r = await scbPost(env, "/api/je/hamtaforetag", buildQuery(["41", "42", "43"]));
        const t = await r.text();
        return new Response(`status ${r.status}\n${t.slice(0, 4000)}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
      }
      return Response.json(await runSeed(env));
    } catch (err) {
      return new Response(`Error: ${err instanceof Error ? err.message : String(err)}`, { status: 500 });
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runSeed(env).then((r) => console.log("SCB seed:", JSON.stringify(r))));
  },
};
