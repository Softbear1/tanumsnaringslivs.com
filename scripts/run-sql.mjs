// Kör SQL mot Supabase via Management API (HTTPS) — för migreringar och
// DB-underhåll i miljöer där direkt psql-anslutning inte är möjlig.
//
// Token läses ALLTID från miljövariabel (committas aldrig):
//   SUPABASE_ACCESS_TOKEN   — Supabase Personal Access Token (krävs)
//   SUPABASE_PROJECT_REF    — projekt-ref (default: tflrdlyquvndapjwnccu)
//
// Användning:
//   node scripts/run-sql.mjs --file supabase/add_fb_posts.sql
//   node scripts/run-sql.mjs --query "select 1;"

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF || "tflrdlyquvndapjwnccu";

if (!token) {
  console.error("Saknar SUPABASE_ACCESS_TOKEN i miljön.");
  process.exit(1);
}

const args = process.argv.slice(2);
let sql = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--query") sql = args[++i];
  else if (args[i] === "--file") {
    const { readFileSync } = await import("node:fs");
    sql = readFileSync(args[++i], "utf8");
  }
}

if (!sql) {
  console.error("Ange --file <path> eller --query <sql>.");
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${text}`);
  process.exit(1);
}
console.log(text || "(inget resultat)");
