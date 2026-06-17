export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { renderEmail } from "@/lib/email";

interface QuotePayload {
  summary: string;
  categoryId: string | null;
  flowType: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  businessIds: string[];
  details: Record<string, unknown>;
}

/** Substantiv per flödestyp för rubriker och ämnesrader i mailet. */
const FLOW_NOUN: Record<string, { subject: string; heading: string; whatLabel: string }> = {
  projekt: { subject: "projektförfrågan", heading: "Ny projektförfrågan 🔨", whatLabel: "Vad kunden vill göra" },
  bokning: { subject: "bokningsförfrågan", heading: "Ny bokningsförfrågan 📅", whatLabel: "Vad kunden vill boka" },
  tidsbokning: { subject: "tidsbokning", heading: "Ny tidsbokning 📅", whatLabel: "Vad kunden vill boka" },
  förfrågan: { subject: "förfrågan", heading: "Ny förfrågan 🎉", whatLabel: "Vad kunden söker" },
  ärende: { subject: "ärende", heading: "Nytt ärende 🛠️", whatLabel: "Vad det gäller" },
  fråga: { subject: "fråga", heading: "Ny fråga 💬", whatLabel: "Vad kunden undrar" },
};

const DEFAULT_NOUN = FLOW_NOUN["förfrågan"];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plocka ut de strukturerade detaljerna som rad-par (label, värde). */
function detailPairs(details: Record<string, unknown>): [string, string][] {
  return Object.entries(details ?? {})
    .filter(([, v]) => typeof v === "string" && v.trim())
    .map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), String(v)] as [string, string]);
}

async function sendBusinessEmail(
  resendKey: string,
  to: string,
  businessName: string,
  payload: QuotePayload,
  quoteId: string,
  origin: string,
) {
  const noun = (payload.flowType && FLOW_NOUN[payload.flowType]) || DEFAULT_NOUN;
  const pairs = detailPairs(payload.details);

  const detailsText = pairs.length
    ? `\nDetaljer:\n${pairs.map(([k, v]) => `  ${k}: ${v}`).join("\n")}\n`
    : "";

  const text = `Hej ${businessName},

Du har fått en ny ${noun.subject} via Tanums Näringsliv.

${noun.whatLabel}:
${payload.summary}
${detailsText}
Kontaktuppgifter:
  Namn:    ${payload.contactName}
  E-post:  ${payload.contactEmail}
  Telefon: ${payload.contactPhone || "–"}

Logga in för att svara: ${origin}/admin

– Tanums Näringsliv`;

  const detailsHtml = pairs.length
    ? `<div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;">Detaljer</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a;">
          ${pairs.map(([k, v]) => `<tr><td style="padding:4px 0;color:#64748b;width:120px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(v)}</td></tr>`).join("")}
        </table>
      </div>`
    : "";

  const html = renderEmail({
    heading: noun.heading,
    intro: `Hej ${escapeHtml(businessName)}, du har fått en ny ${escapeHtml(noun.subject)} via Tanums Näringsliv.`,
    body: `
      <div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;">${escapeHtml(noun.whatLabel)}</p>
        <p style="margin:0;font-size:15px;color:#0f172a;line-height:1.5;">${escapeHtml(payload.summary)}</p>
      </div>
      ${detailsHtml}
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a;">
        <tr><td style="padding:6px 0;color:#64748b;width:90px;">Namn</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(payload.contactName)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">E-post</td><td style="padding:6px 0;font-weight:600;"><a href="mailto:${escapeHtml(payload.contactEmail)}" style="color:#2F8765;text-decoration:none;">${escapeHtml(payload.contactEmail)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Telefon</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(payload.contactPhone || "–")}</td></tr>
      </table>`,
    ctaLabel: "Logga in och svara",
    ctaUrl: `${origin}/admin`,
  });

  // Ämnesrad: väv in nyckeldetaljer (ex. "4 pers · 21 juni") när de finns.
  const detailSnippet = pairs.slice(0, 2).map(([, v]) => v).join(" · ");
  const subject = detailSnippet
    ? `Ny ${noun.subject}: ${detailSnippet}`.slice(0, 70)
    : `Ny ${noun.subject}: ${payload.summary.slice(0, 50)}`;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Tanums Näringsliv <noreply@tanumsnaringsliv.com>",
      to,
      subject,
      text,
      html,
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

  // Derive the category from the selected businesses instead of trusting the
  // AI's categoryId — the model can hallucinate ids that don't exist, which
  // would violate the quote_requests_category_id_fkey foreign key. A business's
  // own category_id is guaranteed to exist in the categories table.
  let categoryId: string | null = null;
  if (payload.businessIds.length > 0) {
    const { data: bizCats } = await supabase
      .from("businesses")
      .select("category_id")
      .in("id", payload.businessIds);
    categoryId = bizCats?.[0]?.category_id ?? null;
  }

  // 1. Save quote request
  const { error: quoteError } = await supabase
    .from("quote_requests")
    .insert({
      id: quoteId,
      summary: payload.summary,
      category_id: categoryId,
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
