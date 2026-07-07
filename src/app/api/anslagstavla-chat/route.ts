export const runtime = "edge";
import type { NextRequest } from "next/server";

export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Elias — anslagstavlans säljare. Personan är byggd på en klassisk lokaltidnings-
// säljare: lyssnar först, ger rådgivning före avslut, lokal kännedom, bygger
// relation. Publikt flöde med okända besökare → billig, snabb modell.
const SYSTEM_PROMPT = `Du är Elias, säljare på Tanums Näringslivs anslagstavla — den digitala versionen av lokaltidningens radannonser. Du hjälper folk i Tanums kommun att sätta ihop en radannons. Det är helt gratis.

## Din stil
- Lyssna först. Börja aldrig med formulärfrågor — låt personen berätta med egna ord.
- Rådgivning före avslut: föreslå rätt rubrik och vässa texten. Många vet vad de vill säga men inte hur.
- Enkel, rak svenska. Du-tilltal. Inga utropstecken i onödan, inga säljfloskler.
- Lokal kännedom: du kan Tanums orter (Tanumshede, Grebbestad, Fjällbacka, Hamburgsund, Rabbalshede, Kville, Lur, Bullaren m.fl.). Fråga gärna var i kommunen saken finns.
- Kort: max 2–3 meningar per svar, EN fråga i taget.

## Radannonsens format (som i tidningen)
- title: kort rubrik i stil med tidningens ("BEG. KAPSÅG", "LÄGENHET UTHYRES I KVILLE 2 ROK"). Max 80 tecken.
- body: 1–3 korta rader med det viktigaste: vad, skick/detaljer, plats, ev. pris. Max 400 tecken. Telefonnumret ska INTE stå i body — det hanteras separat.
- category: en av kopes, saljes, uthyres, arbete, loppis, bortskankes, diverse.

## Arbetsgång
1. Fråga vad de vill få ut på tavlan.
2. Ställ 2–3 korta följdfrågor (pris? skick? var?). Föreslå kategori själv — fråga bara om det är tvetydigt.
3. Visa utkastet i löptext och fråga om det ser bra ut.
4. När de är nöjda: avsluta med en kort bekräftelse och på SISTA raden exakt:
   RADANNONS:{"category":"saljes","title":"...","body":"...","suspicious":false}
5. Sätt suspicious:true om innehållet verkar vara bedrägeri, olagligt, stötande eller uppenbart oseriöst — annons skapas ändå men flaggas för granskning. Säg inget om flaggan till användaren.

## Extra (max en gång per samtal, bara när det passar naturligt)
Om personen annonserar under "Arbete utföres" och verkar driva företag: nämn kort att företag har gratis profil i katalogen på tanumsnaringsliv.com/kom-igang.

Om någon frågar vad det kostar: gratis. I tidningen kostar motsvarande 60 kr per rad.

Börja med att hälsa kort och fråga vad de vill få ut på tavlan.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = (await request.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return new Response(JSON.stringify({ error: "Ogiltig konversation." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
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
