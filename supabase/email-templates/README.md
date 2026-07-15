# E-postmallar för Supabase

Inloggningsmejlen (magic link) skickas av Supabase Auth, inte av appen — därför
måste mallen klistras in i Supabase-dashboarden. Den styr utseendet på mejlet som
både **företag** och **beställare** får när de loggar in.

## Så här gör du

1. Gå till **Supabase Dashboard → Authentication → Emails → Templates**
2. Välj fliken **Magic Link**
3. Sätt **Subject** till: `Din inloggningslänk till Tanums Näringsliv`
4. Klistra in hela innehållet från `magic-link.html` i body-fältet
5. Spara

> Variabeln `{{ .ConfirmationURL }}` fylls i automatiskt av Supabase med rätt
> inloggningslänk (inkl. vår `?next=`-redirect till `/offert/...` eller `/admin`).

Mallen följer DESIGN.md: header i hav-900 (`#072B36`), knapp i hav-500
(`#16657A`), text i skiffer/grå enligt paletten. Ändra INTE till gröna eller
andra ofärgpalett-toner — håll dig till CSS-variablerna i DESIGN.md.

## Om mejlet hamnar i skräpposten

Autentiseringen (SPF/DKIM/DMARC via Resend) kan vara helt korrekt och mejlet
ändå hamna i skräppost hos vissa mottagare (särskilt Outlook/Live) — det beror
då på mottagarens innehålls-/ryktesfilter, inte på DNS eller Custom SMTP.
Kontrollera `Authentication-Results`-headern i ett mottaget mejl: står det
`dkim=pass header.d=tanumsnaringsliv.com` och `dmarc=pass` är avsändningen
korrekt, och kvarvarande skräppost-problem löses av mottagarens ryktesuppbyggnad
över tid (be mottagare markera "Inte skräppost"), inte av mall- eller
DNS-ändringar.
