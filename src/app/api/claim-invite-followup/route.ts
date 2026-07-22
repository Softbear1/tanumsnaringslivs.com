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
//
// Till skillnad från originalutskicket grupperas mottagarna per inkorg: en
// person som förvaltar flera bolag (t.ex. redovisningsbyrå eller koncern) får
// ETT mejl med alla sina claim-länkar i stället för fem separata. Snällare mot
// mottagaren och bättre för leveransförmågan.

const BATCH_SIZE = 40; // Antal inkorgar (mejl) per körning

type Biz = { id: string; name: string };

function claimUrl(businessId: string, campaign: string): string {
  return `https://tanumsnaringsliv.com/api/claim-invite-click?b=${businessId}&c=${encodeURIComponent(campaign)}`;
}

function emailText(businesses: Biz[], campaignFor: (id: string) => string): string {
  const single = businesses.length === 1;
  const intro = single
    ? `För ett tag sedan klickade du på länken för att ta över ${businesses[0].name} på Tanums Näringsliv, men vi ser att det inte blev klart. Det kan bero på att något strulade tekniskt från vår sida förra gången — om så är fallet ber jag om ursäkt för det. Det tar fortfarande bara någon minut, och det är gratis. När du tagit över kan du:`
    : `För ett tag sedan klickade du på länken för att ta över dina företag på Tanums Näringsliv, men vi ser att det inte blev klart för alla. Det kan bero på att något strulade tekniskt från vår sida förra gången — om så är fallet ber jag om ursäkt för det. Det tar bara någon minut per företag, och det är gratis. När du tagit över kan du:`;

  const claimLines = single
    ? [`Ta över ${businesses[0].name} gratis: ${claimUrl(businesses[0].id, campaignFor(businesses[0].id))}`]
    : [
        `Här är dina företag som fortfarande väntar — ta över vart och ett gratis:`,
        ``,
        ...businesses.map((b) => `- ${b.name}: ${claimUrl(b.id, campaignFor(b.id))}`),
      ];

  const footerReason = single
    ? `Du får det här mejlet som en påminnelse eftersom ${businesses[0].name} fortfarande är oclaimad hos Tanums Näringsliv.`
    : `Du får det här mejlet som en påminnelse eftersom dessa företag fortfarande är oclaimade hos Tanums Näringsliv.`;

  return [
    `Hej!`,
    ``,
    intro,
    ``,
    `- Fylla på med rätt kontaktuppgifter, logga och en beskrivning`,
    `- Skapa blixterbjudanden och annonser som syns för lokala kunder`,
    `- Lägga upp sommarjobb`,
    `- Lägga en gratis annons på Anslagstavlan (köpes, säljes, uthyres, arbete utföres)`,
    `- Se hur många som besöker din profil`,
    ``,
    ...claimLines,
    ``,
    `Hör gärna av dig om något krånglade förra gången eller om du har frågor — svara bara på det här mejlet.`,
    ``,
    `Vänliga hälsningar,`,
    `Elias Bengtsson`,
    `Tanums Näringsliv · Grebbestad`,
    ``,
    `—`,
    `${footerReason} Vill du inte ha fler mejl av det här slaget? Svara med "Nej tack".`,
  ].join("\n");
}

function emailHtml(businesses: Biz[], campaignFor: (id: string) => string): string {
  const single = businesses.length === 1;

  const heading = single
    ? "Din profil på Tanums Näringsliv väntar på dig"
    : "Dina profiler på Tanums Näringsliv väntar på dig";

  const intro = single
    ? `För ett tag sedan klickade du på länken för att ta över <strong>${businesses[0].name}</strong> på Tanums Näringsliv, men vi ser att det inte blev klart. Det kan bero på att något strulade tekniskt från vår sida förra gången — om så är fallet ber jag om ursäkt för det.`
    : `För ett tag sedan klickade du på länken för att ta över dina företag på Tanums Näringsliv, men vi ser att det inte blev klart för alla. Det kan bero på att något strulade tekniskt från vår sida förra gången — om så är fallet ber jag om ursäkt för det.`;

  const leadOut = single
    ? `Det tar fortfarande bara någon minut, och det är gratis. När du tagit över kan du:`
    : `Det tar bara någon minut per företag, och det är gratis. När du tagit över kan du:`;

  // Ett företag: en tydlig primärknapp. Flera företag: en rad per företag med
  // namn + egen "Ta över"-länk, eftersom varje listning claimas separat.
  const claimBlock = single
    ? `<table role="presentation" style="border-collapse:collapse;">
<tr><td style="padding:4px 0 16px;">
<a href="${claimUrl(businesses[0].id, campaignFor(businesses[0].id))}" style="display:inline-block;background:#16657A;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:12px;">Ta över ditt företag — gratis</a>
</td></tr>
</table>`
    : `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#1C2B2A;">Här är dina företag som fortfarande väntar — ta över vart och ett gratis:</p>
<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;">
${businesses
  .map(
    (b) => `<tr><td style="padding:10px 0;border-bottom:1px solid #EDE9E0;">
<span style="font-size:15px;font-weight:600;color:#072B36;">${b.name}</span><br>
<a href="${claimUrl(b.id, campaignFor(b.id))}" style="display:inline-block;margin-top:6px;color:#16657A;text-decoration:none;font-weight:600;font-size:14px;">Ta över ${b.name} — gratis →</a>
</td></tr>`
  )
  .join("\n")}
</table>`;

  const footerReason = single
    ? `Ni får det här mejlet som en påminnelse eftersom ${businesses[0].name} fortfarande är oclaimad hos Tanums Näringsliv.`
    : `Ni får det här mejlet som en påminnelse eftersom dessa företag fortfarande är oclaimade hos Tanums Näringsliv.`;

  return `<!doctype html><html lang="sv"><body style="margin:0;padding:0;background:#FAF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" style="width:100%;border-collapse:collapse;background:#FAF8F4;padding:24px 0;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" style="width:100%;max-width:520px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
<tr><td style="background:#16657A;padding:20px 28px;">
<span style="color:#ffffff;font-size:16px;font-weight:700;">Tanums Näringsliv</span>
<br><span style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:2px;">HELA TANUM. ETT NÄRINGSLIV.</span>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:20px;color:#072B36;">${heading}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
Hej!
</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
${intro}
</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1C2B2A;">
${leadOut}
</p>
<ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.7;color:#1C2B2A;">
<li>Fylla på med rätt kontaktuppgifter, logga och en beskrivning</li>
<li>Skapa blixterbjudanden och annonser som syns för lokala kunder</li>
<li>Lägga upp sommarjobb</li>
<li>Lägga en gratis annons på <strong>Anslagstavlan</strong> — köpes, säljes, uthyres eller "arbete utföres", precis som i lokaltidningen fast utan kostnad</li>
<li>Se hur många som besöker din profil</li>
</ul>
${claimBlock}
<p style="margin:0;font-size:15px;line-height:1.6;color:#1C2B2A;">
Hör gärna av dig om något krånglade förra gången eller om du har frågor — svara bara på det här mejlet.<br><br>
Vänliga hälsningar,<br>
<strong>Elias Bengtsson</strong><br>
<span style="color:#6B6F6C;">Tanums Näringsliv · Grebbestad</span>
</p>
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #D8D6CF;">
<p style="margin:0 0 8px;font-size:12px;color:#6B6F6C;line-height:1.5;">
${footerReason}
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
    return Response.json({ dryRun, inboxesRemaining: 0, businessesRemaining: 0, thisBatch: 0, sample: [] });
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

  // Gruppera per normaliserad inkorg (gemener + trim) så samma person aldrig
  // får flera mejl. Behåll den första oförändrade adressen som mottagare.
  const groups = new Map<string, { email: string; businesses: Biz[] }>();
  for (const b of remaining) {
    const email = (b.claim_email as string).trim();
    const key = email.toLowerCase();
    const g = groups.get(key);
    if (g) g.businesses.push({ id: b.id, name: b.name });
    else groups.set(key, { email, businesses: [{ id: b.id, name: b.name }] });
  }
  const groupList = Array.from(groups.values());
  const batch = groupList.slice(0, BATCH_SIZE);

  const campaignFor = (id: string) => campaignById.get(id) ?? "invite-2026-07";

  if (dryRun) {
    return Response.json({
      dryRun: true,
      inboxesRemaining: groupList.length,
      businessesRemaining: remaining.length,
      thisBatch: batch.length,
      sample: batch.slice(0, 5).map((g) => ({
        email: g.email,
        businesses: g.businesses.map((b) => b.name),
      })),
    });
  }

  let sent = 0;
  const failures: string[] = [];
  for (const group of batch) {
    const ok = await sendEmail({
      to: group.email,
      subject:
        group.businesses.length === 1
          ? `Du var nära att ta över ${group.businesses[0].name} — klart på en minut`
          : `Dina företag på Tanums Näringsliv väntar — klart på en minut`,
      html: emailHtml(group.businesses, campaignFor),
      text: emailText(group.businesses, campaignFor),
      replyTo: "elias.bengtsson@live.com",
    });
    if (ok) {
      // Stämpla alla listningar i gruppen som påminda i samma svep.
      await admin
        .from("claim_invite_log")
        .update({ followup_sent_at: new Date().toISOString() })
        .in("business_id", group.businesses.map((b) => b.id));
      sent++;
    } else {
      failures.push(group.email);
    }
  }

  return Response.json({ sent, failed: failures.length, failures });
}
