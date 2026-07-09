interface EmailOptions {
  heading: string;
  intro: string;
  /** Raw HTML for the body block (caller is responsible for escaping). */
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

// Brandfärger enligt DESIGN.md (mejlklienter kräver inline-värden, inte tokens).
const PRIMARY = "#072B36"; // hav-900
const ACCENT = "#16657A";  // hav-500

const FROM = "Tanums Näringsliv <elias@tanumsnaringsliv.com>";

/**
 * Skickar mejl via Resend REST API (edge-säker fetch). Nyckeln ligger som
 * Cloudflare Pages-secret RESEND_API_KEY — aldrig i repot. Misslyckade utskick
 * loggas men får ALDRIG fälla anropande flöde: ett tappat mejl är alltid
 * mindre allvarligt än en förlorad ansökan eller lead.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY saknas — hoppar över mejl:", opts.subject);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("Resend-fel", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend-anrop misslyckades:", err);
    return false;
  }
}

/**
 * Renders a branded, responsive HTML email used across the app (quote
 * notifications, etc). Inline styles only — email clients ignore <style>.
 */
export function renderEmail({ heading, intro, body = "", ctaLabel, ctaUrl }: EmailOptions): string {
  const cta =
    ctaLabel && ctaUrl
      ? `<tr><td style="padding:8px 0 0;">
           <a href="${ctaUrl}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:12px;">${ctaLabel}</a>
         </td></tr>`
      : "";

  return `<!doctype html>
<html lang="sv">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#f8fafc;padding:24px 0;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" style="width:100%;max-width:520px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <tr><td style="background:${PRIMARY};padding:20px 28px;">
          <span style="color:#ffffff;font-size:16px;font-weight:700;">Tanums Näringsliv</span>
          <br><span style="color:rgba(255,255,255,0.55);font-size:10px;letter-spacing:2px;">HELA TANUM. ETT NÄRINGSLIV.</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:${PRIMARY};">${heading}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#334155;">${intro}</p>
          ${body}
          <table role="presentation" style="border-collapse:collapse;">${cta}</table>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
            Du får detta mejl från Tanums Näringsliv — den lokala företagskatalogen för Tanums kommun.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
