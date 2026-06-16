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

Mallen matchar appens varumärke (mörkblå header, grön knapp). Vill du ändra
färgerna finns de som `#1B3A4B` (primär) och `#2F8765` (accent) i filen.
