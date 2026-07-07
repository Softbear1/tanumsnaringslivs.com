-- Säkerhet: RLS filtrerar rader, inte kolumner. Utan detta kunde anon-nyckeln
-- läsa contact_email, manage_token och moderation_token på aktiva annonser.
-- Kolumnrättigheter begränsar publika läsningar till just de publika fälten.
revoke select on public.board_ads from anon, authenticated;
grant select (id, category, title, body, contact_phone, status, expires_at, created_at)
  on public.board_ads to anon, authenticated;

-- Annonser ligger 7 dagar (kortades från 30 — tavlan ska kännas färsk).
alter table public.board_ads alter column expires_at set default now() + interval '7 days';
