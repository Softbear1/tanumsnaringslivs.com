"use server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmail, renderEmail } from "@/lib/email";
import { BOARD_CATEGORIES } from "@/lib/chat";

const BASE = "https://tanumsnaringsliv.com";
const MODERATOR = "elias.bengtsson@live.com";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function catName(id: string): string {
  return BOARD_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export async function submitBoardAd(data: {
  category: string;
  title: string;
  body: string;
  contact_phone: string | null;
  contact_email: string;
  suspicious?: boolean;
}): Promise<{ ok?: true; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { error: "Tjänsten är inte tillgänglig just nu." };

  const title = data.title.trim().slice(0, 80);
  const body = data.body.trim().slice(0, 400);
  const email = data.contact_email.trim();
  if (title.length < 3 || body.length < 3) return { error: "Rubrik och text behövs." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Ogiltig e-postadress." };
  if (!BOARD_CATEGORIES.some((c) => c.id === data.category)) return { error: "Ogiltig kategori." };

  const { data: row, error } = await admin
    .from("board_ads")
    .insert({
      category: data.category,
      title,
      body,
      contact_phone: data.contact_phone?.trim() || null,
      contact_email: email,
    })
    .select("id, manage_token, moderation_token")
    .single();

  if (error || !row) return { error: "Något gick fel. Försök igen." };

  const flag = data.suspicious ? " ⚠️ AI-flaggad — granska extra noga" : "";
  const modBase = `${BASE}/api/anslagstavla-moderate?id=${row.id}&token=${row.moderation_token}`;

  // Modereringsmejl till Elias — Godkänn/Neka direkt från mejlet.
  await sendEmail({
    to: MODERATOR,
    subject: `Anslagstavlan: ${catName(data.category)} — ${title}${flag}`,
    replyTo: email,
    html: renderEmail({
      heading: `Ny radannons väntar${flag}`,
      intro: `${catName(data.category)}: "${escapeHtml(title)}"`,
      body: `<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;white-space:pre-wrap;">${escapeHtml(body)}</p>
             <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Kontakt: ${escapeHtml(email)}${data.contact_phone ? ` · ${escapeHtml(data.contact_phone)}` : ""}</p>
             <p style="margin:0 0 8px;"><a href="${modBase}&action=approve" style="display:inline-block;background:#2E7D4F;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:10px;margin-right:8px;">Godkänn</a>
             <a href="${modBase}&action=reject" style="display:inline-block;background:#B3402E;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:10px;">Neka</a></p>`,
    }),
  });

  // Bekräftelse + hantera-länk till annonsören.
  await sendEmail({
    to: email,
    subject: "Din radannons är mottagen",
    html: renderEmail({
      heading: "Tack! Din annons granskas",
      intro: `"${escapeHtml(title)}" läggs ut på anslagstavlan så fort den är granskad — oftast samma dag. Den ligger sedan uppe i 30 dagar.`,
      body: `<p style="margin:0 0 16px;font-size:14px;color:#334155;">Spara det här mejlet — med länken nedan kan du ta bort annonsen när den är såld eller inaktuell.</p>`,
      ctaLabel: "Hantera din annons",
      ctaUrl: `${BASE}/anslagstavlan/hantera?token=${row.manage_token}`,
    }),
  });

  return { ok: true };
}

export async function deleteBoardAd(manageToken: string): Promise<{ ok?: true; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { error: "Tjänsten är inte tillgänglig just nu." };
  if (!manageToken) return { error: "Ogiltig länk." };

  const { error, count } = await admin
    .from("board_ads")
    .delete({ count: "exact" })
    .eq("manage_token", manageToken);

  if (error) return { error: "Något gick fel. Försök igen." };
  if (!count) return { error: "Annonsen hittades inte — den kan redan vara borttagen." };
  return { ok: true };
}
