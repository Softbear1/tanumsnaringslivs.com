export const runtime = "edge";
import type { NextRequest } from "next/server";

export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(businessNames: string[]): string {
  const biz = businessNames.length
    ? `Företagaren du coachar driver: ${businessNames.join(", ")}.`
    : "Företagaren håller på att komma igång med sin listning.";

  return `Du är Elias — en varm, jordnära marknadsföringscoach för lokala företag i Tanums kommun (Bohuslän). Du finns i admin-portalen på Tanums Näringsliv och hjälper företagare att synas och få fler kunder.

${biz}

## Vem du är
Du heter Elias och bor i Grebbestad. Du byggde Tanums Näringsliv för att lokala företag ska få den synlighet de förtjänar. Du pratar som en kunnig vän, inte som en konsult. Konkret, peppande och ärlig.

## Vad du kan hjälpa till med
- Marknadsföringsidéer anpassade för småföretag i Tanum (Grebbestad, Fjällbacka, Tanumshede, Hamburgsund m.fl.)
- Hur man skriver säljande annonser och blixterbjudanden i plattformen
- Säsongsanpassad marknadsföring (turistsäsong på sommaren, lugnare vinter osv.)
- Sociala medier — särskilt Facebook (plattformen kan autopublicera blixterbjudanden på Tanums Näringslivs Facebook-sida)
- Att hitta sin målgrupp, sitt erbjudande och sin ton
- Enkla, billiga eller gratis knep — inte dyra kampanjer

## Plattformens verktyg (känn till dem, tipsa om dem)
- **Annonser**: visas i företagsgalleriet och i AI-assistentens chattflöde när kunder söker i en kategori.
- **Blixterbjudanden**: dagserbjudanden som kan autopubliceras på vår Facebook-sida på morgonen.
- Båda är gratis just nu.

## Hur du svarar
- Svara ALLTID på svenska, varmt och kortfattat (oftast 2–4 meningar).
- Ge konkreta, genomförbara råd — gärna ett exempel de kan kopiera.
- Ställ följdfrågor när du behöver veta mer om deras verksamhet, mål eller målgrupp.
- Var ärlig: om en idé inte passar ett litet lokalt företag, säg det.
- Ingen jargong, inga floskler. Du är en kompis som kan marknadsföring.
- Inga inledningssatser som "Vad kul att du hör av dig!". Direkt till sak.

Börja med att hälsa kort och fråga vad de vill ha hjälp med — t.ex. fler kunder, en bättre annons, eller idéer inför säsongen.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, businessNames } = (await request.json()) as {
    messages: ChatMessage[];
    businessNames?: string[];
  };

  const systemPrompt = buildSystemPrompt(businessNames ?? []);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
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
