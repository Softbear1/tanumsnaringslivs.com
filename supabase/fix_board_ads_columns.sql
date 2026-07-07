-- Säkerhet: RLS filtrerar rader, inte kolumner. Utan detta kunde anon-nyckeln
-- läsa contact_email, manage_token och moderation_token på aktiva annonser.
-- Kolumnrättigheter begränsar publika läsningar till just de publika fälten.
revoke select on public.board_ads from anon, authenticated;
grant select (id, category, title, body, contact_phone, status, expires_at, created_at)
  on public.board_ads to anon, authenticated;
