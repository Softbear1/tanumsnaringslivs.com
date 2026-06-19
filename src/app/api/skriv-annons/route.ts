export const runtime = "edge";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { description, businessName, location } = await req.json() as {
    description: string;
    businessName?: string;
    location?: string;
  };

  if (!description?.trim()) {
    return Response.json({ error: "description required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "no api key" }, { status: 500 });

  const systemPrompt = `Du är en HR-assistent som skriver svenska platsannonser för sommarjobb i Tanums kommun på Bohuskusten.
Givet en kort beskrivning av ett jobb, returnera ENDAST ett JSON-objekt med dessa fält:
{
  "title": "Jobbets titel (kort, lockande)",
  "description": "2-3 stycken beskrivning av jobbet och arbetsplatsen",
  "requirements": "Vad söker vi? (punktlista eller kort text)",
  "salary_range": "Löneinformation om känd, annars null",
  "job_type": "sommarjobb" | "deltid" | "heltid" | "praktik"
}
Ton: vänlig, lokal, inbjudande. Max 300 ord totalt. Returnera BARA JSON, ingen annan text.`;

  const userMsg = [
    description,
    businessName ? `Företag: ${businessName}` : "",
    location ? `Ort: ${location}` : "",
  ].filter(Boolean).join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!res.ok) {
    return Response.json({ error: "AI error" }, { status: 500 });
  }

  const data = await res.json() as { content: Array<{ text: string }> };
  const text = data.content?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(text);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "parse error", raw: text }, { status: 500 });
  }
}
