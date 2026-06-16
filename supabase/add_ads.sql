-- Migration: ads table for contextual advertising
create table if not exists public.ads (
  id uuid default gen_random_uuid() primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  headline text not null,
  body text,
  cta_label text,
  cta_url text,
  category_id text references public.categories(id),
  active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists ads_category_idx on public.ads(category_id) where active = true;

alter table public.ads enable row level security;

create policy "public read active ads" on public.ads
  for select using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >  now())
  );

create policy "owner manage ads" on public.ads
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );
