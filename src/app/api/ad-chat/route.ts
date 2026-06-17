export const runtime = "edge";
import type { NextRequest } from "next/server";

export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CategoryInfo {
  id: string;
  name: string;
}

function buildSystemPrompt(categories: CategoryInfo[], businessName?: string): string {
  const catList = categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n");

  return `Du hjälper företagaren${businessName ? ` på ${businessName}` : ""} att skapa en annons i Tanums Näringsliv. Annonser visas i företagsgalleriet och i AI-assistentens chattflöde när en kund söker i en viss kategori.

## Din uppgift
Hjälp dem snabbt få ihop en träffsäker annons. Föreslå gärna formuleringar — många vet vad de vill säga men inte hur. Håll det kort.

## Det här behövs
- headline: kort, säljande rubrik (max ~60 tecken). Detta är det enda obligatoriska.
- body: 1 mening som utvecklar erbjudandet (valfritt, null om inget)
- cta_label: knapptext, t.ex. "Boka nu" (valfritt, null)
- cta_url: länk till knappen (valfritt, null)
- category_id: vilken kategori annonsen ska visas i — ett exakt id från listan, eller null för att visas överallt

## Så här jobbar du
- Svara ALLTID på svenska, vänligt och kortfattat (max 2–3 meningar).
- Ställ EN fråga i taget. Be först om vad de vill erbjuda/säga.
- Föreslå en snygg rubrik och brödtext utifrån deras ord — låt dem godkänna eller justera.
- Fråga inte om allt; cta och kategori är valfria. Om de inte bryr sig, sätt null.
- När rubriken är klar, avsluta med en kort sammanfattning och på SISTA raden:
  ANNONS:{"headline":"...","body":null,"cta_label":null,"cta_url":null,"category_id":null}
- category_id MÅSTE vara ett exakt id från listan eller null. Hitta aldrig på id:n.

## Kategorier
${catList}

Börja med att fråga vad de vill annonsera om.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, categories, businessName } = (await request.json()) as {
    messages: ChatMessage[];
    categories: CategoryInfo[];
    businessName?: string;
  };

  const systemPrompt = buildSystemPrompt(categories ?? [], businessName);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: await response.text() }), {
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
