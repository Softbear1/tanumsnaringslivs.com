-- Migration: schemalagda dagliga Facebook-inlägg (agent för "Dagens företagspresentation").
--
-- Mekanik:
--   * En daglig slot per datum. Varje morgon (svensk tid) postar
--     /api/social/post-daily dagens inlägg till Facebook-sidan med en brandad bild.
--   * Tabellen är typ-agnostisk (post_type) så fler format kan läggas till senare
--     utan schemaändring: 'presentation' (företagspresentation) implementeras nu,
--     framtida t.ex. 'nytt-foretag', 'omrostning', 'blixterbjudande'.
--   * fb_post_id lagrar Facebooks inläggs-id → körningen blir idempotent (samma
--     dag postas aldrig två gånger). image_url/caption cachas för superadmin.
--   * Urval sker automatiskt (round-robin över verifierade aktiva företag) men kan
--     styras manuellt från superadmin genom att lägga in en rad i förväg.

create extension if not exists "uuid-ossp";

create table if not exists public.scheduled_posts (
  id             uuid primary key default uuid_generate_v4(),
  post_type      text not null default 'presentation',
  business_id    uuid references public.businesses(id) on delete cascade,
  scheduled_date date not null unique,
  status         text not null default 'queued',   -- queued | posted | failed | skipped
  source         text not null default 'auto',     -- auto | manual
  payload        jsonb,
  fb_post_id     text,
  image_url      text,
  caption        text,
  error          text,
  posted_at      timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists scheduled_posts_date_idx on public.scheduled_posts (scheduled_date desc);
create index if not exists scheduled_posts_business_idx on public.scheduled_posts (business_id);

-- Bara betrodda server-routes (service role) rör tabellen. RLS på utan policy
-- betyder att anon/authenticated inte kommer åt något.
alter table public.scheduled_posts enable row level security;

-- Tillägg som krävs för schemaläggning + utgående HTTP från databasen.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Schemalägg den dagliga körningen.
--
-- OBS: körs INTE som en del av denna migration eftersom <SOCIAL_POST_SECRET>
-- är en hemlighet och endpointen måste vara deployad först. Sätts upp separat
-- (via Management API) när Facebook-token och secret finns på plats. Körs 05:30
-- UTC ~ 07:30 svensk sommartid, före blixterbjudandena (06:00 UTC).
--
--   select cron.schedule(
--     'post-daily-social',
--     '30 5 * * *',
--     $$
--       select net.http_post(
--         url     := 'https://tanumsnaringsliv.com/api/social/post-daily',
--         headers := jsonb_build_object(
--                      'Content-Type',  'application/json',
--                      'Authorization', 'Bearer <SOCIAL_POST_SECRET>'
--                    ),
--         body    := '{}'::jsonb
--       );
--     $$
--   );
-- ---------------------------------------------------------------------------
