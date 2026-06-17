export const runtime = "edge";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI ej konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text, context } = await request.json() as { text: string; context?: string };
  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "Ingen text angiven." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = `Du är en copywriter-assistent för lokala svenska företag i Tanums kommun.
Din uppgift är att förbättra texter för företagspresentationer, annonser och erbjudanden.

Regler:
- Svara ENDAST med den förbättrade texten — ingen förklaring, inga rubriker, inga citattecken
- Behåll ungefär samma längd som originalet (±20%)
- Håll tonen professionell men personlig och lokal
- Skriv på svenska
- Var konkret och specifik — undvik vaga påståenden
- Bevara all faktainfo från originaltexten (priser, datum, produktnamn etc.)`;

  const userMessage = context
    ? `Förbättra den här texten (${context}):\n\n${text}`
    : `Förbättra den här texten:\n\n${text}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "AI-tjänsten svarade inte." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const improved = data.content?.[0]?.text?.trim() ?? text;

  return new Response(JSON.stringify({ text: improved }), {
    headers: { "Content-Type": "application/json" },
  });
}
