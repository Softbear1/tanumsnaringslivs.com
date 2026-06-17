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

/**
 * Per-kategori-recept: vilken typ av flöde det är, vilka frågor som ska ställas
 * och vad CTA-knappen i UI:t kallas. Mottagaren (företaget) behöver de
 * strukturerade svaren för att kunna agera — en byggare kan inte prissätta
 * utan scope och tidplan, en restaurang behöver datum/tid/antal.
 */
type FlowRecipe = {
  flowType: string;
  /** Frågor att samla in, i ordning. En fråga per tur. */
  collect: string;
  /** Nycklar som ska finnas i details-objektet i READY-markören. */
  detailKeys: string[];
  /** Hur uppdraget ska beskrivas för användaren. */
  noun: string;
};

const FLOW_RECIPES: Record<string, FlowRecipe> = {
  bygg: {
    flowType: "projekt",
    collect:
      "vad som ska göras (typ av arbete), var (adress eller ort), ungefärlig storlek/omfattning, önskat startdatum, ungefärlig budget om kunden har en",
    detailKeys: ["arbete", "adress", "omfattning", "start", "budget"],
    noun: "projektet",
  },
  restaurang: {
    flowType: "bokning",
    collect:
      "vilket datum, vilken tid, antal gäster, eventuella allergier eller önskemål, anledning (t.ex. middag, fest)",
    detailKeys: ["datum", "tid", "antal", "allergier", "anledning"],
    noun: "bokningen",
  },
  turism: {
    flowType: "bokning",
    collect:
      "vilken aktivitet, vilket datum, antal deltagare, erfarenhetsnivå (nybörjare/van)",
    detailKeys: ["aktivitet", "datum", "antal", "erfarenhet"],
    noun: "bokningen",
  },
  skonhet: {
    flowType: "tidsbokning",
    collect: "vilken behandling, önskat datum, önskad tid på dagen",
    detailKeys: ["behandling", "datum", "tid"],
    noun: "tidsbokningen",
  },
  transport: {
    flowType: "förfrågan",
    collect:
      "varifrån, vart, vilket datum, vad som ska transporteras (gods eller passagerare, ungefärlig mängd)",
    detailKeys: ["från", "till", "datum", "last"],
    noun: "förfrågan",
  },
  it: {
    flowType: "ärende",
    collect:
      "vad problemet eller behovet är, vilket system eller utrustning det gäller, hur brådskande det är",
    detailKeys: ["problem", "system", "prioritet"],
    noun: "ärendet",
  },
  fastighet: {
    flowType: "förfrågan",
    collect:
      "typ av fastighet, vilken tjänst som behövs, var (ort), önskad tidpunkt",
    detailKeys: ["fastighet", "tjänst", "ort", "tidpunkt"],
    noun: "förfrågan",
  },
  butiker: {
    flowType: "fråga",
    collect: "vilken produkt eller vara, eventuella specifikationer, budget om relevant",
    detailKeys: ["produkt", "specifikation", "budget"],
    noun: "frågan",
  },
};

const DEFAULT_RECIPE: FlowRecipe = {
  flowType: "förfrågan",
  collect: "vad de vill ha gjort, var i Tanum, ungefär när, eventuell budget",
  detailKeys: ["beskrivning", "plats", "tidpunkt"],
  noun: "förfrågan",
};

function buildSystemPrompt(businesses: BusinessInfo[], categories: CategoryInfo[]): string {
  const bizList = businesses
    .map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      return `- ${b.name} (${cat?.name ?? b.categoryId}, id: ${b.id}): ${b.description}`;
    })
    .join("\n");

  const detailsExample = (recipe: FlowRecipe) =>
    `{${recipe.detailKeys.map((k) => `"${k}":"..."`).join(",")}}`;

  // Bygg ett kategoristyrt avsnitt: AI:n vet inte i förväg vad kunden vill, så
  // vi beskriver hur den ska anpassa frågorna när kategorin klarnar.
  const flowGuide = Object.entries(FLOW_RECIPES)
    .map(([catId, r]) => {
      const cat = categories.find((c) => c.id === catId);
      return `### ${cat?.name ?? catId} (flowType: "${r.flowType}")
Samla in: ${r.collect}.
Avsluta med: READY:{"businessIds":[...],"summary":"...","flowType":"${r.flowType}","details":${detailsExample(r)}}`;
    })
    .join("\n\n");

  return `Du är assistenten på Tanums Näringsliv — en lokal företagskatalog för Tanums kommun i Bohuslän.

Din uppgift: förstå vad besökaren behöver, hitta rätt lokalt företag, och samla in den konkreta information som företaget behöver för att kunna svara.

## Så här gör du
1. Öppna med: "Vad behöver du hjälp med?"
2. Lista ut vilken sorts behov det är och anpassa frågorna efter kategorin (se nedan).
3. Ställ de konkreta frågorna — EN i taget — tills du har det företaget behöver för att kunna ge ett svar/pris.
4. Identifiera 1–3 relevanta företag från listan längst ned och föreslå dem.
5. Avsluta med rätt READY-markör för kategorin.

## Ton
- Svara ALLTID på svenska.
- Var kortfattad och konkret. Max 2 meningar per tur.
- Gå rakt på sak. Inga inledningsfraser som "Vad kul att du hör av dig!" eller utfyllnad om "Bohuskusten", "havet" eller "vår fina bygd".
- Ställ EN fråga i taget.
- Fråga ALDRIG om kontaktuppgifter (namn, e-post, telefon) — det sköts av ett formulär efteråt.

## Anpassa frågorna efter behovet
${flowGuide}

För övriga behov: samla in ${DEFAULT_RECIPE.collect} och avsluta med READY:{"businessIds":[...],"summary":"...","flowType":"${DEFAULT_RECIPE.flowType}","details":${detailsExample(DEFAULT_RECIPE)}}.

## Regler för READY-markören
- Lägg den på SISTA raden, först när du har samlat in det som behövs OCH valt företag.
- businessIds MÅSTE vara exakta id:n från listan nedan. Hitta aldrig på id:n.
- summary: en kort mening som sammanfattar behovet.
- details: fyll i de fält du fått svar på; utelämna fält du inte fick svar på (tomma värden är okej men hellre korrekt info).

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
