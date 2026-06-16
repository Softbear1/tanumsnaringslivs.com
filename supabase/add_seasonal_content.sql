-- AI-genererad säsongscopy, cachad per ISO-vecka.
-- Den deterministiska säsongsmotorn i koden fungerar utan denna tabell; det här
-- är bara ett cache-lager så att färsk AI-text kan visas utan att anropa
-- Anthropic vid varje sidladdning.
create table if not exists public.seasonal_content (
  week_key text primary key,            -- t.ex. "2026-W24"
  season text not null,                 -- winter | spring | summer | autumn
  hero_title text not null,
  hero_subtitle text not null,
  spotlight_title text not null,
  spotlight_body text not null,
  chat_greeting text not null,
  generated_at timestamptz not null default now()
);

alter table public.seasonal_content enable row level security;

-- Vem som helst får läsa aktuell säsongscopy.
create policy "public read seasonal_content" on public.seasonal_content
  for select using (true);

-- Inga publika skrivpolicies: copy skrivs bara av /api/season/refresh via
-- service role-nyckeln, som kringgår RLS. Det hindrar att någon ändrar
-- startsidans text genom Supabase REST.
