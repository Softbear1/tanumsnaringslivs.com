export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

interface ReviewPayload {
  quoteRequestId: string;
  businessId: string;
  rating: number;
  comment: string;
}

// A verified customer leaves a review for a business on a handled quote.
// Trust is enforced in two layers: this route checks the logged-in user owns
// the quote, and the RLS policy on `reviews` re-checks the same conditions
// (right email, business linked to the quote, quote status = 'handled').
export async function POST(request: NextRequest) {
  const payload = (await request.json()) as ReviewPayload;

  if (!payload.quoteRequestId || !payload.businessId) {
    return Response.json({ error: "Saknar offert eller företag." }, { status: 400 });
  }
  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Betyget måste vara 1–5." }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return Response.json({ error: "Du måste vara inloggad för att lämna omdöme." }, { status: 401 });
  }

  // Read the quote (RLS lets the customer read their own) to confirm it's handled
  // and to reuse the contact name as the reviewer name.
  const { data: quote } = await supabase
    .from("quote_requests")
    .select("contact_name, status")
    .eq("id", payload.quoteRequestId)
    .single();

  if (!quote) {
    return Response.json({ error: "Hittar inte offerten." }, { status: 404 });
  }
  if (quote.status !== "handled") {
    return Response.json({ error: "Du kan lämna omdöme först när offerten är hanterad." }, { status: 409 });
  }

  const { error } = await supabase.from("reviews").insert({
    business_id: payload.businessId,
    quote_request_id: payload.quoteRequestId,
    reviewer_email: user.email,
    reviewer_name: quote.contact_name,
    rating,
    comment: payload.comment?.trim() || null,
  });

  if (error) {
    // Unique violation = already reviewed this business for this quote.
    const msg = error.code === "23505"
      ? "Du har redan lämnat ett omdöme för det här företaget."
      : error.message;
    return Response.json({ error: msg }, { status: 400 });
  }

  return Response.json({ ok: true });
}
