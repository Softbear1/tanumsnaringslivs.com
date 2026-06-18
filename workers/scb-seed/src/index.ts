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

// Variabler vi vill hämta. ID:n bekräftas via ?mode=discover (GET je/variabler).
// Namnen nedan är SCB:s variabelnamn enligt variabelbeskrivningen.
const REQUEST_VARIABLER = [
  "Företagsnamn",
  "OrgNr",
  "Telefon",
  "Epost",
  "PostAdress",
  "PostNr",
  "PostOrt",
  "BesöksAdress",
  "Bransch1",   // SNI 2025, huvudnäringsgren
  "Reklam",
];

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

// Bygger filter-/hämtkroppen. Justeras efter discover om SCB förväntar annat format.
function buildQuery() {
  return {
    Företagsstatus: "1",          // 1 = aktiva
    Registreringsstatus: "1",
    Kategorier: [{ Kategori: "Kommun", Kod: [TANUM_KOMMUN] }],
    variabler: REQUEST_VARIABLER,
  };
}

// Plockar ut ett variabelvärde ur en SCB-rad (rader returneras vanligen som
// { Företagsnamn: "...", Varden: [{ Id, Varde_kod, Varde_text }] } e.d.).
// Robust mot båda vanliga formaten.
function pick(row: Record<string, unknown>, key: string): string | null {
  if (typeof row[key] === "string") return row[key] as string;
  const vals = (row["Varden"] ?? row["variabler"]) as
    | Array<{ Id?: string; Variabel?: string; Varde_kod?: string; Varde_text?: string; Värde?: string }>
    | undefined;
  if (Array.isArray(vals)) {
    const hit = vals.find((v) => v.Id === key || v.Variabel === key);
    if (hit) return hit.Varde_text ?? hit.Värde ?? hit.Varde_kod ?? null;
  }
  return null;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function isReklamsparr(reklam: string | null): boolean {
  return reklam === "21" || reklam === "22" || reklam === "23";
}

async function upsertBusinesses(env: Env, rows: Array<Record<string, unknown>>): Promise<number> {
  const records = rows
    .map((r) => {
      const name = pick(r, "Företagsnamn");
      const org = pick(r, "OrgNr");
      if (!name || !org) return null;
      const ort = pick(r, "PostOrt");
      const addr = [pick(r, "BesöksAdress") ?? pick(r, "PostAdress"), pick(r, "PostNr"), ort]
        .filter(Boolean).join(", ");
      const email = pick(r, "Epost");
      return {
        scb_org_nr: org,
        name,
        category_id: mapSniToCategory(pick(r, "Bransch1")),
        description: `${name} i ${ort ?? "Tanum"}.`,
        phone: pick(r, "Telefon") ?? "",
        email: email ?? "",
        website: null,
        address: addr || "Tanums kommun",
        postort: ort,
        initials: initialsFrom(name),
        claim_email: email,
        reklamsparr: isReklamsparr(pick(r, "Reklam")),
        claimed: false,
        owner_id: null,
        source: "scb",
        active: true,
        scb_synced_at: new Date().toISOString(),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (records.length === 0) return 0;

  // Supabase REST upsert på scb_org_nr (merge-duplicates uppdaterar befintliga).
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
  return records.length;
}

async function runSeed(env: Env): Promise<{ count: number; fetched: number }> {
  const query = buildQuery();

  const countRes = await scbPost(env, "/api/je/raknaforetag", query);
  if (!countRes.ok) throw new Error(`raknaforetag ${countRes.status}: ${await countRes.text()}`);

  const fetchRes = await scbPost(env, "/api/je/hamtaforetag", query);
  if (!fetchRes.ok) throw new Error(`hamtaforetag ${fetchRes.status}: ${await fetchRes.text()}`);

  const data = (await fetchRes.json()) as unknown;
  // Svaret kan vara en array eller { Företag: [...] } — hantera båda.
  const rows: Array<Record<string, unknown>> = Array.isArray(data)
    ? data
    : ((data as { Företag?: unknown[]; data?: unknown[] }).Företag
      ?? (data as { data?: unknown[] }).data
      ?? []) as Array<Record<string, unknown>>;

  const count = await upsertBusinesses(env, rows);
  return { count, fetched: rows.length };
}

async function runDiscover(env: Env): Promise<unknown> {
  const [vars, cats] = await Promise.all([
    scbGet(env, "/api/je/variabler").then((r) => r.json()).catch((e) => String(e)),
    scbGet(env, "/api/je/kategoriermedkodtabeller").then((r) => r.json()).catch((e) => String(e)),
  ]);
  return { variabler: vars, kategorier: cats };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.searchParams.get("secret") !== env.SEED_SECRET) {
      return new Response("Forbidden", { status: 403 });
    }
    try {
      if (url.searchParams.get("mode") === "discover") {
        return Response.json(await runDiscover(env));
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
