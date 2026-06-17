-- Migration: auto-publicering av blixterbjudanden till Facebook
--
-- Mekanik:
--   * Varje morgon (svensk tid) postas dagens aktiva blixterbjudanden som
--     inlägg på Facebook-sidan via endpointen /api/social/post-deals.
--   * fb_post_id lagrar Facebooks inläggs-id så att samma erbjudande aldrig
--     postas två gånger (körningen blir idempotent).
--
-- Schemaläggningen sker i databasen med pg_cron + pg_net (se nedan). Själva
-- posten görs av en betrodd server-route (service role + Facebook Page Token
-- som Cloudflare-secret), så inga FB-hemligheter behöver ligga i databasen.

alter table public.flash_deals
  add column if not exists fb_post_id text;

-- Tillägg som krävs för schemaläggning + utgående HTTP från databasen.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Schemalägg den dagliga körningen.
--
-- OBS: körs INTE som en del av denna migration eftersom <SOCIAL_POST_SECRET>
-- är en hemlighet och endpointen måste vara deployad först. Sätts upp separat
-- (via Management API) när Facebook-token och secret finns på plats.
--
--   select cron.schedule(
--     'post-flash-deals',
--     '0 6 * * *',                       -- 06:00 UTC ~ 08:00 svensk sommartid
--     $$
--       select net.http_post(
--         url     := 'https://tanumsnaringsliv.com/api/social/post-deals',
--         headers := jsonb_build_object(
--                      'Content-Type',  'application/json',
--                      'Authorization', 'Bearer <SOCIAL_POST_SECRET>'
--                    ),
--         body    := '{}'::jsonb
--       );
--     $$
--   );
-- ---------------------------------------------------------------------------
