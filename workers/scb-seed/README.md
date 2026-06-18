# SCB Seed Worker

Hämtar Tanums företag (kommun **1435**) från SCB:s allmänna företagsregister via
mTLS och upsertar dem i Supabase som oclaimerade listningar (`source = 'scb'`,
`claimed = false`, `claim_email` = SCB-registrerad e-post).

## Varför en separat Worker?
Cloudflare presenterar klientcertet (mTLS) via en **mTLS-certifikat-binding** med
cron-trigger — funktioner som Pages inte har. Anrop till SCB måste presentera vårt
klientcert, vilket kräver `env.SCB_CERT.fetch()`.

> Obs: detta går **inte** att köra från Claude Codes molnmiljö — utgående trafik
> där går via en TLS-terminerande proxy som bryter mTLS. Kör stegen nedan lokalt
> eller låt Cloudflare köra cron:en.

## Engångs-setup

1. **Ladda upp certifikatet som mTLS-cert** (PEM finns i `.scb/`, skapat ur .pfx):
   ```sh
   npx wrangler mtls-certificate upload \
     --cert .scb/scb-cert.pem --key .scb/scb-key.pem --name scb-sokpavar
   ```
   Kopiera `certificate_id` till `wrangler.toml` → `[[mtls_certificates]]`.

2. **Sätt hemligheter:**
   ```sh
   cd workers/scb-seed
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put SEED_SECRET            # valfri lång slumpsträng
   ```

3. **Deploya:**
   ```sh
   npx wrangler deploy
   ```

## Första körningen: bekräfta variabel-id:n

SCB:s exakta variabel-/kategori-id:n och request-format framgår av hjälpsidan
(`/help`), som kräver certet. Kör därför discover först:

```
https://scb-seed.<ditt-subdomän>.workers.dev/?secret=<SEED_SECRET>&mode=discover
```

Jämför svaret mot `REQUEST_VARIABLER` och `buildQuery()` i `src/index.ts`. Justera
namn/format om SCB avviker (t.ex. om Kommun-filtret kräver layouten "Företag med
uppgifter om huvudarbetsstället"), deploya om, och kör sedan seedningen:

```
https://scb-seed.<ditt-subdomän>.workers.dev/?secret=<SEED_SECRET>
```

Därefter sköter cron (03:15 UTC) uppdateringen automatiskt.

## Källhänvisning (SCB-avtalskrav)
Datan kommer från SCB:s allmänna företagsregister, bearbetad av Tanums Näringsliv.
Reklamspärr (Reklam-kod 21/22/23) lagras i `reklamsparr` — dessa kontaktas aldrig
aktivt i marknadsföringssyfte.
