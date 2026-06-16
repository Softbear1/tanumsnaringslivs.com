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

function buildSystemPrompt(categories: CategoryInfo[], current?: Record<string, unknown> | null): string {
  const catList = categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n");

  const editBlock = current
    ? `\n## Redigeringsläge\nFöretaget finns redan. Här är nuvarande uppgifter:\n${JSON.stringify(current)}\nGör BARA de ändringar företagaren ber om och behåll resten oförändrat. Fråga vad de vill ändra. När du är klar, skriv ut HELA den uppdaterade listningen i DRAFT-markören (inte bara de ändrade fälten).\n`
    : "";

  return `Du hjälper en företagare att lägga upp sitt företag i Tanums Näringsliv — en lokal företagskatalog för Tanums kommun i Bohuslän. Företagaren har redan ont om tid, så ditt jobb är att göra det snabbt och smärtfritt.
${editBlock}

## Din uppgift
Samla ihop det som behövs för en listning genom ett kort samtal, och skriv sedan ett färdigt utkast åt dem. De får granska och justera i ett formulär efteråt — så var hellre rapp än petig.

## Det här behövs
- name: företagsnamn
- category_id: EXAKT ett id från listan nedan (välj själv utifrån vad de gör)
- description: 1–2 välskrivna meningar (max 200 tecken). Nämn vad de erbjuder och var i Tanum. Skriv ut hela meningar, inga förkortningar.
- phone: telefonnummer
- email: e-post
- website: webbplats om de har, annars null
- address: gata + ort (t.ex. "Storgatan 1, Tanumshede")
- initials: 2–3 bokstäver från namnet (versaler)

## Så här jobbar du
- Svara ALLTID på svenska, vänligt och kortfattat (max 2–3 meningar per tur).
- Ställ EN fråga i taget, men plocka gärna ut flera uppgifter om de skriver mycket på en gång.
- Härled det du kan själv: category_id från beskrivningen, initialer från namnet, en snygg description av deras egna ord. Fråga inte om sånt du redan kan lista ut.
- Fråga bara om det som faktiskt saknas (oftast namn, vad de gör, var, telefon, e-post).
- När du har name, category_id, description, phone, email och address: avsluta ditt svar med en kort sammanfattning och på SISTA raden en markör:
  DRAFT:{"name":"...","category_id":"...","description":"...","phone":"...","email":"...","website":null,"address":"...","initials":"..."}
- category_id MÅSTE vara ett exakt id från listan. Hitta aldrig på id:n.

## Kategorier
${catList}

${current ? "Börja med att kort fråga vad de vill ändra." : "Börja med att hälsa kort och fråga vad företaget heter och vad de gör."}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI-tjänsten är inte konfigurerad." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, categories, current } = (await request.json()) as {
    messages: ChatMessage[];
    categories: CategoryInfo[];
    current?: Record<string, unknown> | null;
  };

  const systemPrompt = buildSystemPrompt(categories ?? [], current);

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
