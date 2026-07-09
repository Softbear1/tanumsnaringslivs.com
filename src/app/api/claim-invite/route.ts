export const runtime = "edge";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

// Engångsutskick: bjuder in oclaimade SCB-listade företag att ta över sin
// gratis profil. Skyddat med samma hemlighet-i-URL-mönster som scb-seed-
// workern. Kör manuellt: GET /api/claim-invite?secret=...&campaign=...&dry=1
// dry=1 kör allt UTOM att skicka mejl och skriva loggen — för att verifiera
// urvalet innan skarp körning.
//
// claim_invite_log garanterar att samma företag aldrig får mejlet två gånger
// för samma kampanj, även om jobbet avbryts och körs om.

const BATCH_SIZE = 40; // Resend-vänlig batchstorlek per körning

function claimUrl(businessId: string, campaign: string): string {
  // Via spårlänken så klicket loggas innan mottagaren landar på claim-sidan.
  return `https://tanumsnaringsliv.com/api/claim-invite-click?b=${businessId}&c=${encodeURIComponent(campaign)}`;
}

// Ren textversion — mejl med både HTML och text får bättre spam-poäng och
// visas rätt i klienter som blockerar HTML.
function emailText(businessName: string, businessId: string, campaign: string): string {
  return [
    `Hej!`,
    ``,
    `Jag heter Elias och bor i Grebbestad. Jag har byggt tanumsnaringsliv.com — en samlad plats där folk i hela kommunen hittar lokala företag, ser blixterbjudanden och letar sommarjobb. Det är gratis att vara med, och jag har redan lagt in ${businessName} så att ni finns där från start.`,
    ``,
    `Nu vill jag att du tar över administrationen av ditt företag. Det tar ett par minuter, kostar ingenting, och då blir profilen din att fylla på och sköta. När du tagit över kan du:`,
    ``,
    `- Fylla på med rätt kontaktuppgifter, logga och en beskrivning`,
    `- Skapa blixterbjudanden och annonser som syns för lokala kunder`,
    `- Lägga upp sommarjobb`,
    `- Lägga en gratis annons på Anslagstavlan (köpes, säljes, uthyres, arbete utföres)`,
    `- Se hur många som besöker din profil`,
    ``,
    `Ta över ditt företag gratis: ${claimUrl(businessId, campaign)}`,
    ``,
    `Hör gärna av dig om du undrar något — svara bara på det här mejlet.`,
    ``,
    `Vänliga hälsningar,`,
    `Elias Bengtsson`,
    `Tanums Näringsliv · Grebbestad`,
    ``,
    `—`,
    `Du får det här mejlet för att ${businessName} finns med i Bolagsverkets/SCB:s register för Tanums kommun och listningen är oclaimad. Vill du inte ha fler mejl av det här slaget? Svara med "Nej tack".`,
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
<h1 style="margin:0 0 16px;font-size:20px;color:#072B36;">Jag har lagt till ${businessName} i Tanums företagskatalog</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
Hej!
</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
Jag heter Elias och bor i Grebbestad. Jag har byggt <strong>tanumsnaringsliv.com</strong> — en samlad plats där folk i hela kommunen hittar lokala företag, ser blixterbjudanden och letar sommarjobb. Det är gratis att vara med, och jag har redan lagt in ${businessName} så att ni finns där från start.
</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
Nu vill jag att <strong>du</strong> tar över administrationen av ditt företag. Det tar ett par minuter, kostar ingenting, och då blir profilen din att fylla på och sköta. När du tagit över kan du:
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
Hör gärna av dig om du undrar något — svara bara på det här mejlet.<br><br>
Vänliga hälsningar,<br>
<strong>Elias Bengtsson</strong><br>
<span style="color:#6B6F6C;">Tanums Näringsliv · Grebbestad</span>
</p>
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #D8D6CF;">
<p style="margin:0 0 8px;font-size:12px;color:#6B6F6C;line-height:1.5;">
Ni får det här mejlet för att ${businessName} finns med i Bolagsverkets/SCB:s register för Tanums kommun och listningen är oclaimad hos Tanums Näringsliv.
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

  const campaign = searchParams.get("campaign") ?? "invite-2026-07";
  const dryRun = searchParams.get("dry") === "1";

  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Tjänsten är inte tillgänglig." }, { status: 503 });

  // Redan mejlade i denna kampanj — exkluderas.
  const { data: alreadySent } = await admin
    .from("claim_invite_log")
    .select("business_id")
    .eq("campaign", campaign);
  const sentIds = new Set((alreadySent ?? []).map((r) => r.business_id));

  const { data: candidates, error } = await admin
    .from("businesses")
    .select("id, name, claim_email")
    .eq("claimed", false)
    .eq("active", true)
    .eq("reklamsparr", false)
    .not("claim_email", "is", null)
    .limit(BATCH_SIZE + sentIds.size + 50); // marginal för att kompensera exkludering

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const batch = (candidates ?? [])
    .filter((b) => !sentIds.has(b.id) && b.claim_email && b.claim_email.trim() !== "")
    .slice(0, BATCH_SIZE);

  if (dryRun) {
    return Response.json({
      dryRun: true,
      campaign,
      totalRemainingCandidates: (candidates ?? []).filter((b) => !sentIds.has(b.id)).length,
      thisBatch: batch.length,
      sample: batch.slice(0, 5).map((b) => ({ name: b.name, email: b.claim_email })),
    });
  }

  let sent = 0;
  const failures: string[] = [];
  for (const biz of batch) {
    const ok = await sendEmail({
      to: biz.claim_email as string,
      subject: `Jag har lagt till ${biz.name} på Tanums Näringsliv – ta över gratis`,
      html: emailHtml(biz.name, biz.id, campaign),
      text: emailText(biz.name, biz.id, campaign),
      replyTo: "elias.bengtsson@live.com",
    });
    if (ok) {
      await admin.from("claim_invite_log").insert({ business_id: biz.id, campaign });
      sent++;
    } else {
      failures.push(biz.name);
    }
  }

  return Response.json({ campaign, sent, failed: failures.length, failures });
}
