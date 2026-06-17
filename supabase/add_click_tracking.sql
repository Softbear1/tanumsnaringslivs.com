-- Migration: offer_clicks — klickstatistik för annonser och blixterbjudanden
--
-- Varje gång en besökare klickar på en annons (CTA) eller ett blixterbjudande
-- loggas en rad här. Företagsägare ser sina egna siffror i admin-portalen,
-- vilket blir ett konkret försäljningsargument ("dina erbjudanden fick 142 klick").
--
-- Skrivs av en betrodd server-route (service role) via /api/track-click, så
-- ingen publik insert-policy behövs.

create table if not exists public.offer_clicks (
  id bigserial primary key,
  offer_id uuid not null,
  business_id uuid references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('ad', 'flash')),
  clicked_at timestamptz not null default now()
);

-- Index för snabb räkning per företag de senaste 30 dagarna
create index if not exists offer_clicks_business_idx
  on public.offer_clicks(business_id, clicked_at);

create index if not exists offer_clicks_offer_idx
  on public.offer_clicks(offer_id);

alter table public.offer_clicks enable row level security;

-- Företagsägare kan läsa klick kopplade till sina egna företag.
create policy "owner read offer_clicks" on public.offer_clicks
  for select using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );
