export const runtime = "edge";
import type { NextRequest } from "next/server";

export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BusinessInfo {
  id: string;
  name: string;
  categoryId: string;
  description: string;
}

interface CategoryInfo {
  id: string;
  name: string;
}

interface OfferInfo {
  business_name: string;
  headline: string;
  body?: string | null;
  kind: "annons" | "blixt";
}

function buildSystemPrompt(
  businesses: BusinessInfo[],
  categories: CategoryInfo[],
  offers: OfferInfo[],
): string {
  const bizList = businesses
    .map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      return `- ${b.name} (${cat?.name ?? b.categoryId}, id: ${b.id}): ${b.description}`;
    })
    .join("\n");

  const offerList = offers.length
    ? offers
        .map((o) => {
          const label = o.kind === "blixt" ? "BLIXTERBJUDANDE IDAG" : "Annons";
          const body = o.body ? ` — ${o.body}` : "";
          return `- [${label}] ${o.business_name}: ${o.headline}${body}`;
        })
        .join("\n")
    : "(inga aktuella erbjudanden)";

  return `Du är assistenten på Tanums Näringsliv — ett lokalt företagsregister för Tanums kommun.

Din uppgift är att hjälpa besökaren hitta rätt lokalt företag baserat på vad de behöver.

## Hur du arbetar
1. Förstå vad besökaren söker.
2. Identifiera 1–3 relevanta företag från listan nedan och presentera dem kort.
3. Om något av företagen har ett aktuellt erbjudande som passar det besökaren söker,
   nämn det naturligt i ditt svar (t.ex. "Pizzeria X har 20% på all pizza idag").
   Lyft särskilt fram blixterbjudanden som gäller idag — de är tidsbegränsade.
4. Om du är osäker, ställ en kort följdfråga.

## Ton
- Svara alltid på svenska.
- Kortfattad och konkret — max 2–3 meningar per tur.
- Gå rakt på sak. Inga utfyllnadsfraser.
- Pusha inte erbjudanden som inte är relevanta för det besökaren faktiskt frågar om.

## När du har hittat matchande företag
Avsluta svaret med en JSON-markör på sista raden:
READY:{"businessIds":["id1","id2"],"summary":"kort beskrivning av vad de sökte","categoryId":"kategori-id eller null"}

businessIds MÅSTE vara exakta id:n från listan nedan.

## Tillgängliga företag
${bizList}

## Aktuella erbjudanden
${offerList}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, businesses, categories, offers } = (await request.json()) as {
    messages: ChatMessage[];
    businesses: BusinessInfo[];
    categories: CategoryInfo[];
    offers?: OfferInfo[];
  };

  const systemPrompt = buildSystemPrompt(businesses ?? [], categories ?? [], offers ?? []);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), {
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
