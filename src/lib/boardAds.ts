// Delad serverlogik för anslagstavlan — anropas från API-routen
// /api/anslagstavla. Kördes tidigare som server actions från den statiska
// inlämningssidan, vilket inte fungerade tillförlitligt på next-on-pages.
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmail, renderEmail } from "@/lib/email";
import { BOARD_CATEGORIES } from "@/lib/chat";
import { facebookConfigured, postLinkToPage } from "@/lib/facebook";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

const BASE = "https://tanumsnaringsliv.com";
const MODERATOR = "elias.bengtsson@live.com";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function catName(id: string): string {
  return BOARD_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

/**
 * Postar en teaser om en nypublicerad radannons till Facebook-sidan. Bara
 * kategori + rubrik som lockbete — själva texten och kontaktuppgifterna kräver
 * ett besök på hemsidan, så inlägget driver trafik dit i stället för att ge
 * bort allt i flödet. Bäst effort: FB-fel får aldrig fälla publiceringen, och
 * fb_post_id hindrar att samma annons postas två gånger.
 */
export async function postBoardAdTeaser(
  admin: AdminClient,
  ad: { id: string; category: string; title: string; fb_post_id: string | null }
): Promise<void> {
  if (ad.fb_post_id) return;
  if (!facebookConfigured()) {
    console.error("FB-teaser hoppas över: FB_PAGE_ID/FB_PAGE_TOKEN saknas i runtimen");
    return;
  }
  try {
    const caption = [
      "📌 Ny annons på Tanums anslagstavla",
      "",
      `${catName(ad.category)}: ${ad.title}`,
      "",
      "Se hela annonsen och kontaktuppgifter på hemsidan 👇",
      "Vill du lägga in en egen? Det är gratis.",
    ].join("\n");
    const postId = await postLinkToPage(caption, `${BASE}/anslagstavlan`);
    if (postId) {
      await admin.from("board_ads").update({ fb_post_id: postId }).eq("id", ad.id);
    }
  } catch (err) {
    console.error("FB-teaser för anslagstavlan misslyckades:", err);
  }
}

/**
 * Server-side granskning med Claude (körs på slutgiltig text — även den som
 * chattat kan ha redigerat efteråt). Fail-safe: går anropet inte att göra
 * flaggas annonsen för manuell granskning i stället för att släppas igenom.
 */
async function aiReview(title: string, body: string): Promise<{ ok: boolean; reason: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, reason: "AI-granskning otillgänglig" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        system: `Du granskar radannonser för en lokal anslagstavla i Tanums kommun (köpes/säljes/uthyres/tjänster/loppis). Vardagliga annonser från privatpersoner och småföretag är OK — var generös mot normalt innehåll. Flagga ENDAST: olagligt (vapen, droger, stöldgods), bedrägerimönster (kryptoinvesteringar, förskottsbetalning, lånelöften), vuxeninnehåll, hat/trakasserier, uppenbart test-/skräpinnehåll ("asdf"), eller massreklam utan lokal koppling. Svara med ENDAST rå JSON: {"ok":true} eller {"ok":false,"reason":"kort motivering på svenska"}`,
        messages: [{ role: "user", content: `Rubrik: ${title}\nText: ${body}` }],
      }),
    });
    if (!res.ok) return { ok: false, reason: "AI-granskning svarade med fel" };
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = data.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    const verdict = JSON.parse(match ? match[0] : text) as { ok: boolean; reason?: string };
    return { ok: verdict.ok === true, reason: verdict.reason ?? "" };
  } catch {
    return { ok: false, reason: "AI-granskning misslyckades" };
  }
}

export async function submitBoardAd(data: {
  category: string;
  title: string;
  body: string;
  contact_phone: string | null;
  contact_email: string;
  suspicious?: boolean;
}): Promise<{ ok?: true; published?: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { error: "Tjänsten är inte tillgänglig just nu." };

  const title = data.title.trim().slice(0, 80);
  const body = data.body.trim().slice(0, 400);
  const email = data.contact_email.trim();
  if (title.length < 3 || body.length < 3) return { error: "Rubrik och text behövs." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Ogiltig e-postadress." };
  if (!BOARD_CATEGORIES.some((c) => c.id === data.category)) return { error: "Ogiltig kategori." };

  // Tveksamhetssignaler → manuell granskning i stället för auto-publicering.
  const reasons: string[] = [];
  if (data.suspicious) reasons.push("Flaggad av Elias i chatten");

  // Dublett: samma rubrik i samma kategori som redan ligger/väntar.
  const { count: dupCount } = await admin
    .from("board_ads")
    .select("id", { count: "exact", head: true })
    .eq("category", data.category)
    .ilike("title", title)
    .in("status", ["pending", "active"]);
  if ((dupCount ?? 0) > 0) reasons.push("Möjlig dublett — samma rubrik finns redan på tavlan");

  // Volym: många annonser från samma avsändare senaste dygnet.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await admin
    .from("board_ads")
    .select("id", { count: "exact", head: true })
    .eq("contact_email", email)
    .gte("created_at", dayAgo);
  if ((recentCount ?? 0) >= 3) reasons.push(`Många annonser från samma avsändare (${recentCount} senaste dygnet)`);

  // AI-granskning av slutgiltig text (körs alltid — texten kan ha ändrats
  // efter chatten, och formulärspåret har ingen tidigare granskning).
  const review = await aiReview(title, body);
  if (!review.ok) reasons.push(`AI-granskningen tvekar: ${review.reason}`);

  const autoApprove = reasons.length === 0;

  const { data: row, error } = await admin
    .from("board_ads")
    .insert({
      category: data.category,
      title,
      body,
      contact_phone: data.contact_phone?.trim() || null,
      contact_email: email,
      status: autoApprove ? "active" : "pending",
    })
    .select("id, category, title, manage_token, moderation_token, fb_post_id")
    .single();

  if (error || !row) return { error: "Något gick fel. Försök igen." };

  if (autoApprove) {
    // Direktpublicerad → teaser till Facebook (bäst effort, blockar inte svaret).
    await postBoardAdTeaser(admin, row);

    // Direktpublicerad — annonsören får bekräftelse + hanterlänk. Inget mejl
    // till moderatorn; rena annonser ska inte skapa arbete.
    await sendEmail({
      to: email,
      subject: "Din radannons ligger ute på tavlan",
      html: renderEmail({
        heading: "Nu ligger din annons ute",
        intro: `"${escapeHtml(title)}" är publicerad på anslagstavlan och syns i 7 dagar.`,
        body: `<p style="margin:0 0 16px;font-size:14px;color:#334155;">Spara det här mejlet — med länken nedan kan du ta bort annonsen när den är såld eller inaktuell.</p>`,
        ctaLabel: "Hantera din annons",
        ctaUrl: `${BASE}/anslagstavlan/hantera?token=${row.manage_token}`,
      }),
    });
    return { ok: true, published: true };
  }

  // Tveksam → väntar på manuell granskning; Elias (människan) får mejl med skälen.
  const modBase = `${BASE}/api/anslagstavla-moderate?id=${row.id}&token=${row.moderation_token}`;
  await sendEmail({
    to: MODERATOR,
    subject: `⚠️ Anslagstavlan behöver din blick: ${catName(data.category)} — ${title}`,
    replyTo: email,
    html: renderEmail({
      heading: "Radannons väntar på granskning",
      intro: `${catName(data.category)}: "${escapeHtml(title)}"`,
      body: `<p style="margin:0 0 12px;font-size:13px;color:#B3402E;"><strong>Skäl:</strong> ${reasons.map(escapeHtml).join(" · ")}</p>
             <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;white-space:pre-wrap;">${escapeHtml(body)}</p>
             <p style="margin:0 0 16px;font-size:13px;color:#64748b;">Kontakt: ${escapeHtml(email)}${data.contact_phone ? ` · ${escapeHtml(data.contact_phone)}` : ""}</p>
             <p style="margin:0 0 8px;"><a href="${modBase}&action=approve" style="display:inline-block;background:#2E7D4F;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:10px;margin-right:8px;">Godkänn</a>
             <a href="${modBase}&action=reject" style="display:inline-block;background:#B3402E;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:10px;">Neka</a></p>`,
    }),
  });

  await sendEmail({
    to: email,
    subject: "Din radannons är mottagen",
    html: renderEmail({
      heading: "Tack! Din annons granskas",
      intro: `"${escapeHtml(title)}" läggs ut på anslagstavlan så fort den är granskad — oftast samma dag. Den ligger sedan uppe i 7 dagar.`,
      body: `<p style="margin:0 0 16px;font-size:14px;color:#334155;">Spara det här mejlet — med länken nedan kan du ta bort annonsen när den är såld eller inaktuell.</p>`,
      ctaLabel: "Hantera din annons",
      ctaUrl: `${BASE}/anslagstavlan/hantera?token=${row.manage_token}`,
    }),
  });

  return { ok: true, published: false };
}

export async function getBoardAd(manageToken: string): Promise<{
  ok?: true;
  error?: string;
  ad?: {
    category: string;
    title: string;
    body: string;
    contact_phone: string | null;
    status: string;
  };
}> {
  const admin = createAdminClient();
  if (!admin) return { error: "Tjänsten är inte tillgänglig just nu." };
  if (!manageToken) return { error: "Ogiltig länk." };

  const { data, error } = await admin
    .from("board_ads")
    .select("category, title, body, contact_phone, status")
    .eq("manage_token", manageToken)
    .maybeSingle();

  if (error) return { error: "Något gick fel. Försök igen." };
  if (!data) return { error: "Annonsen hittades inte — den kan redan vara borttagen." };
  return { ok: true, ad: data };
}

export async function updateBoardAd(
  manageToken: string,
  data: { category: string; title: string; body: string; contact_phone: string | null }
): Promise<{ ok?: true; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { error: "Tjänsten är inte tillgänglig just nu." };
  if (!manageToken) return { error: "Ogiltig länk." };

  const title = data.title.trim().slice(0, 80);
  const body = data.body.trim().slice(0, 400);
  if (title.length < 3 || body.length < 3) return { error: "Rubrik och text behövs." };
  if (!BOARD_CATEGORIES.some((c) => c.id === data.category)) return { error: "Ogiltig kategori." };

  const { error, count } = await admin
    .from("board_ads")
    .update(
      { category: data.category, title, body, contact_phone: data.contact_phone?.trim() || null },
      { count: "exact" }
    )
    .eq("manage_token", manageToken);

  if (error) return { error: "Något gick fel. Försök igen." };
  if (!count) return { error: "Annonsen hittades inte — den kan redan vara borttagen." };
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
