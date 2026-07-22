export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

// Uppföljningsmejl till de som klickade på originalinbjudan
// (claim-invite/route.ts) men aldrig slutförde claim-flödet. Skyddat med
// samma hemlighet-i-URL-mönster. Kör manuellt: GET /api/claim-invite-followup?secret=...&dry=1
//
// followup_sent_at på claim_invite_log garanterar att samma företag aldrig
// får uppföljningsmejlet två gånger, även om jobbet avbryts och körs om.
// Kampanjnamnet återanvänds från originalraden (ingen ny kampanj) eftersom
// det här är en påminnelse om samma inbjudan.

const BATCH_SIZE = 40; // Resend-vänlig batchstorlek per körning

function claimUrl(businessId: string, campaign: string): string {
  return `https://tanumsnaringsliv.com/api/claim-invite-click?b=${businessId}&c=${encodeURIComponent(campaign)}`;
}

function emailText(businessName: string, businessId: string, campaign: string): string {
  return [
    `Hej!`,
    ``,
    `För ett tag sedan klickade du på länken för att ta över ${businessName} på Tanums Näringsliv, men vi ser att det inte blev klart. Det kan bero på att något strulade tekniskt från vår sida förra gången — om så är fallet ber jag om ursäkt för det. Det tar fortfarande bara någon minut, och det är gratis. När du tagit över kan du:`,
    ``,
    `- Fylla på med rätt kontaktuppgifter, logga och en beskrivning`,
    `- Skapa blixterbjudanden och annonser som syns för lokala kunder`,
    `- Lägga upp sommarjobb`,
    `- Lägga en gratis annons på Anslagstavlan (köpes, säljes, uthyres, arbete utföres)`,
    `- Se hur många som besöker din profil`,
    ``,
    `Ta över ditt företag gratis: ${claimUrl(businessId, campaign)}`,
    ``,
    `Hör gärna av dig om något krånglade förra gången eller om du har frågor — svara bara på det här mejlet.`,
    ``,
    `Vänliga hälsningar,`,
    `Elias Bengtsson`,
    `Tanums Näringsliv · Grebbestad`,
    ``,
    `—`,
    `Du får det här mejlet som en påminnelse eftersom ${businessName} fortfarande är oclaimad hos Tanums Näringsliv. Vill du inte ha fler mejl av det här slaget? Svara med "Nej tack".`,
  ].join("\n");
}

function emailHtml(businessName: string, businessId: string, campaign: string): string {
  const url = claimUrl(businessId, campaign);
  return `<!doctype html><html lang="sv"><body style="margin:0;padding:0;background:#FAF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" style="width:100%;border-collapse:collapse;background:#FAF8F4;padding:24px 0;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" style="width:100%;max-width:520px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
<tr><td style="background:#16657A;padding:20px 28px;">
<span style="color:#ffffff;font-size:16px;font-weight:700;">Tanums Näringsliv</span>
<br><span style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:2px;">HELA TANUM. ETT NÄRINGSLIV.</span>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:20px;color:#072B36;">Din profil på Tanums Näringsliv väntar på dig</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
Hej!
</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
För ett tag sedan klickade du på länken för att ta över <strong>${businessName}</strong> på Tanums Näringsliv, men vi ser att det inte blev klart. Det kan bero på att något strulade tekniskt från vår sida förra gången — om så är fallet ber jag om ursäkt för det.
</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
Det tar fortfarande bara någon minut, och det är gratis. När du tagit över kan du:
</p>
<ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7;color:#1C2B2A;">
<li>Fylla på med rätt kontaktuppgifter, logga och en beskrivning</li>
<li>Skapa blixterbjudanden och annonser som syns för lokala kunder</li>
<li>Lägga upp sommarjobb</li>
<li>Lägga en gratis annons på <strong>Anslagstavlan</strong> — köpes, säljes, uthyres eller "arbete utföres", precis som i lokaltidningen fast utan kostnad</li>
<li>Se hur många som besöker din profil</li>
</ul>
<table role="presentation" style="border-collapse:collapse;">
<tr><td style="padding:4px 0 16px;">
<a href="${url}" style="display:inline-block;background:#16657A;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:12px;">Ta över ditt företag — gratis</a>
</td></tr>
</table>
<p style="margin:0;font-size:15px;line-height:1.6;color:#1C2B2A;">
Hör gärna av dig om något krånglade förra gången eller om du har frågor — svara bara på det här mejlet.<br><br>
Vänliga hälsningar,<br>
<strong>Elias Bengtsson</strong><br>
<span style="color:#6B6F6C;">Tanums Näringsliv · Grebbestad</span>
</p>
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #D8D6CF;">
<p style="margin:0 0 8px;font-size:12px;color:#6B6F6C;line-height:1.5;">
Ni får det här mejlet som en påminnelse eftersom ${businessName} fortfarande är oclaimad hos Tanums Näringsliv.
</p>
<p style="margin:0;font-size:12px;color:#6B6F6C;line-height:1.5;">
Vill ni inte ha fler mejl av det här slaget? Svara med "Nej tack" så tar vi bort er från listan.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.SEED_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  const dryRun = searchParams.get("dry") === "1";

  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Tjänsten är inte tillgänglig." }, { status: 503 });

  // Klickat men ännu inte fått uppföljningsmejlet.
  const { data: inviteRows, error: inviteError } = await admin
    .from("claim_invite_log")
    .select("business_id, campaign, clicked_at, followup_sent_at")
    .not("clicked_at", "is", null)
    .is("followup_sent_at", null);

  if (inviteError) return Response.json({ error: inviteError.message }, { status: 500 });

  const campaignById = new Map((inviteRows ?? []).map((r) => [r.business_id, r.campaign]));
  const clickedIds = Array.from(campaignById.keys());
  if (clickedIds.length === 0) {
    return Response.json({ dryRun, totalRemainingCandidates: 0, thisBatch: 0, sample: [] });
  }

  // Fortfarande oclaimade, aktiva, ingen reklamspärr — samma exkludering som
  // originalutskicket.
  const { data: allCandidates, error } = await admin
    .from("businesses")
    .select("id, name, claim_email")
    .in("id", clickedIds)
    .eq("claimed", false)
    .eq("active", true)
    .eq("reklamsparr", false)
    .not("claim_email", "is", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const remaining = (allCandidates ?? []).filter(
    (b) => b.claim_email && b.claim_email.trim() !== ""
  );
  const batch = remaining.slice(0, BATCH_SIZE);

  if (dryRun) {
    return Response.json({
      dryRun: true,
      totalRemainingCandidates: remaining.length,
      thisBatch: batch.length,
      sample: batch.slice(0, 5).map((b) => ({ name: b.name, email: b.claim_email })),
    });
  }

  let sent = 0;
  const failures: string[] = [];
  for (const biz of batch) {
    const campaign = campaignById.get(biz.id) ?? "invite-2026-07";
    const ok = await sendEmail({
      to: biz.claim_email as string,
      subject: `Du var nära att ta över ${biz.name} — klart på en minut`,
      html: emailHtml(biz.name, biz.id, campaign),
      text: emailText(biz.name, biz.id, campaign),
      replyTo: "elias.bengtsson@live.com",
    });
    if (ok) {
      await admin
        .from("claim_invite_log")
        .update({ followup_sent_at: new Date().toISOString() })
        .eq("business_id", biz.id);
      sent++;
    } else {
      failures.push(biz.name);
    }
  }

  return Response.json({ sent, failed: failures.length, failures });
}
