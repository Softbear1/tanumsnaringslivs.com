-- Migration: flash_deals — dagliga blixterbjudanden (Amazon Lightning Deal-stil)
--
-- Mekanik:
--   * Ett erbjudande är knutet till ETT datum (deal_date) och är live HELA den
--     dagen i svensk tid (Europe/Stockholm).
--   * Idag → erbjudandet visas i sin helhet med nedräkning till midnatt.
--   * Framtida dagar → besökaren ska kunna se VILKA företag som har ett
--     erbjudande, men INTE själva erbjudandet (teaser → FOMO → återkommer).
--
-- För att teaser-läckaget ska vara omöjligt (inte bara dolt i UI:t) styrs det
-- på databasnivå:
--   * RLS på bastabellen släpper bara igenom dagens (eller passerade) rader för
--     allmänheten — framtida erbjudanden är helt oläsbara.
--   * En separat vy (flash_deal_upcoming) exponerar ENDAST business_id + datum
--     för kommande erbjudanden. Vyn kör med ägarrättigheter och förbigår RLS,
--     men eftersom headline aldrig ingår i vyn kan den aldrig läcka.

create table if not exists public.flash_deals (
  id uuid default gen_random_uuid() primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  headline text not null,                              -- erbjudandet, ex. "20% på all pizza"
  description text,                                    -- valfri längre text
  category_id text references public.categories(id),   -- valfri, för relevans
  deal_date date not null,                             -- dagen erbjudandet är live (svensk tid)
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists flash_deals_date_idx on public.flash_deals(deal_date) where active = true;

alter table public.flash_deals enable row level security;

-- Allmänheten ser bara dagens (eller redan passerade) aktiva erbjudanden i sin helhet.
-- Framtida erbjudanden går INTE att läsa ur bastabellen.
create policy "public read live flash deals" on public.flash_deals
  for select using (
    active = true
    and deal_date <= (now() at time zone 'Europe/Stockholm')::date
  );

-- Företagsägare hanterar sina egna erbjudanden (alla datum).
create policy "owner manage flash deals" on public.flash_deals
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Teaser-vy: säker att läsa för alla. Innehåller ALDRIG headline/description,
-- så kommande erbjudanden kan visas som "X har ett blixterbjudande imorgon"
-- utan att avslöja vad det är. Vyn förbigår RLS (definer-rättigheter) men kan
-- bara avslöja kolumnerna nedan.
create or replace view public.flash_deal_upcoming as
  select id, business_id, deal_date
  from public.flash_deals
  where active = true
    and deal_date > (now() at time zone 'Europe/Stockholm')::date;

grant select on public.flash_deal_upcoming to anon, authenticated;
