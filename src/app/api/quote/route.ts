export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

interface QuotePayload {
  summary: string;
  categoryId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  businessIds: string[];
  details: Record<string, unknown>;
}

async function sendBusinessEmail(
  resendKey: string,
  to: string,
  businessName: string,
  payload: QuotePayload,
  quoteId: string,
  origin: string,
) {
  const body = `
Hej ${businessName},

Du har fått en ny offertförfrågan via Tanums Näringsliv.

Sammanfattning: ${payload.summary}

Kontakt:
  Namn:     ${payload.contactName}
  E-post:   ${payload.contactEmail}
  Telefon:  ${payload.contactPhone || "–"}

Svara kunden direkt eller logga in i admin-portalen för att hantera förfrågan.

${origin}/admin

– Tanums Näringsliv
  `.trim();

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Tanums Näringsliv <noreply@tanumsnaringsliv.com>",
      to,
      subject: `Ny offertförfrågan: ${payload.summary.slice(0, 60)}`,
      text: body,
    }),
  });
}

async function sendCustomerMagicLink(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  quoteId: string,
  origin: string,
) {
  // Use Supabase signInWithOtp via REST to send magic link with redirect to quote page
  return fetch(`${supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/offert/${quoteId}`,
      },
    }),
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as QuotePayload;
  const origin = request.headers.get("origin") ?? "https://tanumsnaringsliv.com";

  const supabase = await createServerClient();

  // Generate the id here so we don't need to read the row back —
  // an anonymous visitor has no RLS SELECT access to the new quote.
  const quoteId = crypto.randomUUID();

  // 1. Save quote request
  const { error: quoteError } = await supabase
    .from("quote_requests")
    .insert({
      id: quoteId,
      summary: payload.summary,
      category_id: payload.categoryId,
      contact_name: payload.contactName,
      contact_email: payload.contactEmail,
      contact_phone: payload.contactPhone || null,
      details: payload.details,
      status: "pending",
    });

  if (quoteError) {
    return new Response(JSON.stringify({ error: quoteError.message ?? "Kunde inte spara förfrågan" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Link to businesses
  if (payload.businessIds.length > 0) {
    await supabase.from("quote_request_businesses").insert(
      payload.businessIds.map((bid) => ({
        quote_request_id: quoteId,
        business_id: bid,
      }))
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const resendKey = process.env.RESEND_API_KEY;

  // 3. Send magic link to customer
  await sendCustomerMagicLink(supabaseUrl, anonKey, payload.contactEmail, quoteId, origin);

  // 4. Notify businesses via email (if Resend is configured)
  if (resendKey && payload.businessIds.length > 0) {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, name, email")
      .in("id", payload.businessIds);

    if (businesses) {
      await Promise.allSettled(
        businesses.map((biz) =>
          sendBusinessEmail(resendKey, biz.email, biz.name, payload, quoteId, origin)
        )
      );
    }
  }

  return new Response(JSON.stringify({ quoteId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
