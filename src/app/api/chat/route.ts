export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OfferInfo {
  business_name: string;
  headline: string;
  body?: string | null;
  kind: "annons" | "blixt";
}

function buildSystemPrompt(
  businesses: { id: string; name: string; categoryId: string; description: string }[],
  categories: { id: string; name: string }[],
  offers: OfferInfo[],
): string {
  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.id] = c.name;

  const byCategory: Record<string, typeof businesses> = {};
  for (const b of businesses) {
    const cat = catMap[b.categoryId] ?? b.categoryId;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(b);
  }

  const bizLines = Object.entries(byCategory)
    .map(([cat, bibs]) => {
      const lines = bibs.map((b) => `  - ${b.name} [id:${b.id}]: ${b.description.slice(0, 80)}`).join("\n");
      return `### ${cat}\n${lines}`;
    })
    .join("\n\n");

  const offerLines = offers.length
    ? "\n## Aktuella erbjudanden och annonser\n" +
      offers
        .map((o) => `- [${o.kind === "blixt" ? "Blixterbjudande" : "Annons"} – ${o.business_name}] ${o.headline}${o.body ? ": " + o.body.slice(0, 60) : ""}`)
        .join("\n")
    : "";

  return `Du är en hjälpsam assistent i Tanums Näringsliv — en lokal företagskatalog för Tanums kommun. Din uppgift är att hjälpa besökaren hitta rätt lokalt företag.

## Hur du jobbar
- Svara ALLTID på svenska, kortfattat och konkret. Max 2–3 meningar per tur. Inga inledningsfraser som "Vad kul att du hör av dig!".
- Använd ALDRIG markdown — inga **, inga #, inga -, inga listor. Skriv vanlig löptext.
- Ställ EN följdfråga i taget om du behöver förstå bättre.
- Matcha mot yrkeskunnande och vad företagen GÖR, inte bara vad de heter. En "snickare" kan finnas under bygg, hantverk eller renovering.
- När du identifierat 1–3 bra matchningar: presentera dem kort och skriv på SISTA raden:
  READY:{"businessIds":["id1","id2"],"summary":"kort sammanfattning","categoryId":"kategori-id eller null"}
- categoryId: välj det kategori-id som bäst matchar förfrågan, eller null om oklar.
- businessIds: EXAKT de id:n från listan nedan, max 3 stycken.
- Om ingen bra match finns: förklara kort och fråga om mer info. Skriv INTE READY om du är osäker.
- Nämn gärna relevanta erbjudanden nedan om de passar förfrågan.

## Kategorier
${categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n")}

## Företag i katalogen
${bizLines}
${offerLines}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, offers } = (await request.json()) as {
    messages: ChatMessage[];
    offers: OfferInfo[];
  };

  // Fetch businesses and categories server-side so the system prompt is
  // identical across all users → prompt cache hits across sessions.
  const supabase = await createServerClient();
  const [{ data: bizRows }, { data: catRows }] = await Promise.all([
    supabase.from("businesses").select("id, name, category_id, description").eq("active", true),
    supabase.from("categories").select("id, name"),
  ]);

  const businesses = (bizRows ?? []).map((b) => ({
    id: b.id as string,
    name: b.name as string,
    categoryId: b.category_id as string,
    description: (b.description as string) ?? "",
  }));
  const categories = (catRows ?? []).map((c) => ({ id: c.id as string, name: c.name as string }));

  const systemPrompt = buildSystemPrompt(businesses, categories, offers ?? []);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-1",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return new Response(JSON.stringify({ error: errText }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
