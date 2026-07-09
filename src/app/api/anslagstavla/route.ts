export const runtime = "edge";
import type { NextRequest } from "next/server";
import { submitBoardAd, deleteBoardAd, getBoardAd, updateBoardAd } from "@/lib/boardAds";

// Inlämning, hantering och borttagning av radannonser. Egen API-route i
// stället för server actions — inlämningssidan är statisk och actions
// därifrån visade sig inte nå servern på next-on-pages.

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") ?? "";
    const result = await getBoardAd(token);
    return Response.json(result, { status: result.error ? 400 : 200 });
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string } & Parameters<typeof updateBoardAd>[1];
    const result = await updateBoardAd(body.token ?? "", body);
    return Response.json(result, { status: result.error ? 400 : 200 });
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Parameters<typeof submitBoardAd>[0] & { website?: string };
    // Honeypot verifieras även server-side — klientkoden går att kringgå.
    if (body.website) return Response.json({ ok: true, published: false });
    const result = await submitBoardAd(body);
    return Response.json(result, { status: result.error ? 400 : 200 });
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token?: string };
    const result = await deleteBoardAd(token ?? "");
    return Response.json(result, { status: result.error ? 400 : 200 });
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }
}
