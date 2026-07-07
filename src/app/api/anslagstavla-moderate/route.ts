export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmail, renderEmail } from "@/lib/email";

// Modereringslänkar från mejlet: Godkänn/Neka utan inloggning.
// Säkerhet: per-annons hemlig moderation_token krävs; utan den 403.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  const page = (title: string, text: string) =>
    new Response(
      `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui,sans-serif;background:#FAF8F4;color:#1C2B2A;display:grid;place-items:center;min-height:100vh;margin:0"><div style="text-align:center;padding:24px"><h1 style="font-size:20px">${title}</h1><p style="color:#6B6F6C">${text}</p></div></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  if (!id || !token || (action !== "approve" && action !== "reject")) {
    return page("Ogiltig länk", "Kontrollera att du använde länken från mejlet.");
  }

  const admin = createAdminClient();
  if (!admin) return page("Fel", "Tjänsten är inte tillgänglig just nu.");

  const { data: ad } = await admin
    .from("board_ads")
    .select("id, title, status, contact_email, moderation_token")
    .eq("id", id)
    .maybeSingle();

  if (!ad || ad.moderation_token !== token) {
    return page("Ogiltig länk", "Annonsen hittades inte eller så stämmer inte länken.");
  }
  if (ad.status !== "pending") {
    return page("Redan hanterad", `Annonsen är redan ${ad.status === "active" ? "godkänd" : "nekad"}.`);
  }

  const newStatus = action === "approve" ? "active" : "rejected";
  const { error } = await admin.from("board_ads").update({ status: newStatus }).eq("id", id);
  if (error) return page("Fel", "Kunde inte uppdatera annonsen. Försök igen.");

  if (newStatus === "active") {
    await sendEmail({
      to: ad.contact_email,
      subject: "Din radannons är ute på tavlan",
      html: renderEmail({
        heading: "Nu ligger din annons ute",
        intro: `"${ad.title}" är godkänd och syns på anslagstavlan i 7 dagar.`,
        ctaLabel: "Se anslagstavlan",
        ctaUrl: "https://tanumsnaringsliv.com/anslagstavlan",
      }),
    });
  }

  return page(
    newStatus === "active" ? "Godkänd ✓" : "Nekad",
    newStatus === "active"
      ? "Annonsen ligger nu ute på tavlan och annonsören har fått besked."
      : "Annonsen publiceras inte."
  );
}
