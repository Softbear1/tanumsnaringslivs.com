export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getSeason, getSeasonTheme, isoWeekKey, type SeasonalContent } from "@/lib/season";

export const maxDuration = 30;

// Regenerates this week's seasonal copy via Anthropic and caches it in Supabase.
// Designed to be called weekly by a scheduled trigger (e.g. a Cloudflare Cron),
// or manually. Protected by SEASON_REFRESH_SECRET so it can't be triggered by
// anyone. The deterministic theme is always the fallback, so a failure here
// never breaks the homepage — it just keeps showing last week's (or static) copy.
function buildPrompt(season: string, weekKey: string): string {
  const theme = getSeasonTheme(seasonToDate(season));
  return `Du skriver säsongsanpassad copy för startsidan på Tanums Näringsliv — en lokal företagskatalog för Tanums kommun på Bohuskusten i Sverige.

Säsong just nu: ${theme.label} (${season}). Vecka: ${weekKey}.
Relevanta kategorier denna säsong: ${theme.categoryIds.join(", ")}.

Skriv färsk, varm och lokal copy för just den här säsongen. Variera tonen lite från vecka till vecka så sidan känns levande, men håll den trovärdig och inte tramsig. Skriv på svenska.

Returnera ENBART giltig JSON, inga kodblock, exakt dessa fält:
{
  "heroTitle": "kort kraftfull rubrik, max ~6 ord",
  "heroSubtitle": "1-2 meningar, max ~30 ord",
  "spotlightTitle": "kort rubrik för 'I säsong just nu'-sektionen",
  "spotlightBody": "1 mening som lyfter fram vad som är relevant nu, max ~25 ord",
  "chatGreeting": "öppningsmening för en chattassistent, vänlig och säsongsmässig, max ~20 ord"
}`;
}

function seasonToDate(season: string): Date {
  const month = { winter: 0, spring: 3, summer: 6, autumn: 9 }[season] ?? 0;
  return new Date(Date.UTC(2026, month, 15));
}

function parseContent(text: string): SeasonalContent | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1)) as Partial<SeasonalContent>;
    if (!obj.heroTitle || !obj.heroSubtitle || !obj.spotlightTitle || !obj.spotlightBody || !obj.chatGreeting) {
      return null;
    }
    return obj as SeasonalContent;
  } catch {
    return null;
  }
}

async function handle(request: NextRequest): Promise<Response> {
  const secret = process.env.SEASON_REFRESH_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY saknas" }, { status: 503 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY saknas" }, { status: 503 });
  }

  const now = new Date();
  const season = getSeason(now);
  const weekKey = isoWeekKey(now);

  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: buildPrompt(season, weekKey) }],
    }),
  });

  if (!aiRes.ok) {
    return Response.json({ error: await aiRes.text() }, { status: aiRes.status });
  }

  const data = (await aiRes.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.map((c) => c.text ?? "").join("") ?? "";
  const content = parseContent(text);
  if (!content) {
    return Response.json({ error: "Kunde inte tolka AI-svaret", raw: text }, { status: 502 });
  }

  const { error } = await admin.from("seasonal_content").upsert({
    week_key: weekKey,
    season,
    hero_title: content.heroTitle,
    hero_subtitle: content.heroSubtitle,
    spotlight_title: content.spotlightTitle,
    spotlight_body: content.spotlightBody,
    chat_greeting: content.chatGreeting,
    generated_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, weekKey, season, content });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

// Allow GET too so scheduled HTTP triggers (which often only do GET) can call it.
export async function GET(request: NextRequest) {
  return handle(request);
}
