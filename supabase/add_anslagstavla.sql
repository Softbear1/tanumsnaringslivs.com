-- Anslagstavlan: gratis radannonser (Köpes/Säljes/Uthyres/Arbete utföres/
-- Loppis/Bortskänkes/Diverse) — digital version av veckotidningens tavla.
-- Inlämning utan konto; förhandsmodereras via mejllänkar innan publicering.

create table if not exists public.board_ads (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in
    ('kopes','saljes','uthyres','arbete','loppis','bortskankes','diverse')),
  title text not null check (char_length(title) between 3 and 80),
  body text not null check (char_length(body) between 3 and 400),
  contact_phone text,
  contact_email text not null,
  status text not null default 'pending' check (status in ('pending','active','rejected')),
  -- Hemliga tokens: manage_token ger annonsören rätt att ta bort/förnya,
  -- moderation_token gör Godkänn/Neka-länkarna i mejlet till Elias säkra.
  manage_token uuid not null default gen_random_uuid(),
  moderation_token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create index if not exists board_ads_active_idx
  on public.board_ads (category, created_at desc)
  where status = 'active';

alter table public.board_ads enable row level security;

-- Publikt: läs endast aktiva, ej utgångna annonser — och aldrig kontaktmejl
-- eller tokens (kolumnskydd sköts i frontend genom att bara selecta publika
-- kolumner; tokens/e-post exponeras aldrig i publika queries).
create policy "public read active board ads" on public.board_ads
  for select using (status = 'active' and expires_at > now());

-- Ingen anon-insert: inlämning går via server action med service role,
-- så honeypot/validering inte kan kringgås med anon-nyckeln.
