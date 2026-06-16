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

function buildSystemPrompt(businesses: BusinessInfo[], categories: CategoryInfo[]): string {
  const bizList = businesses
    .map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      return `- ${b.name} (${cat?.name ?? b.categoryId}, id: ${b.id}): ${b.description}`;
    })
    .join("\n");

  return `Du är en hjälpsam assistent på Tanums Näringsliv — en lokal företagskatalog för Tanums kommun i Bohuslän.

Din uppgift är att hjälpa besökaren hitta rätt lokalt företag och samla in information för en offertförfrågan.

## Konversationsflöde
1. Ställ öppningsfrågan: "Vad behöver du hjälp med?"
2. Intervjua användaren för att samla: vad de vill ha gjort, var i Tanum, ungefär när, eventuell budget
3. Identifiera 1–3 relevanta företag från listan nedan
4. Föreslå de matchande företagen och fråga om användaren vill skicka en förfrågan

## Regler
- Svara ALLTID på svenska
- Håll svar korta — max 2–3 meningar per tur
- Ställ EN fråga i taget
- Var vänlig och lokal i tonen ("här i Tanum", "på Bohuskusten" osv.)
- Fråga ALDRIG om kontaktuppgifter (namn, e-post, telefon) — det sköts av ett formulär efteråt.
- När du har samlat tillräcklig info om uppdraget och valt företag, avsluta ditt svar med en JSON-markör på sista raden:
  READY:{"businessIds":["id1","id2"],"summary":"kort sammanfattning av uppdraget"}
- businessIds MÅSTE vara exakta id:n från listan nedan. Hitta aldrig på id:n.

## Tillgängliga företag
${bizList}

Börja konversationen direkt med din första fråga till användaren.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, businesses, categories } = (await request.json()) as {
    messages: ChatMessage[];
    businesses: BusinessInfo[];
    categories: CategoryInfo[];
  };

  const systemPrompt = buildSystemPrompt(businesses ?? [], categories ?? []);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
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

  // Forward the SSE stream from Anthropic directly to the client
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
