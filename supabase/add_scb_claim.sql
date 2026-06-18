-- SCB Seed & Claim — gör katalogen seedbar från SCB:s företagsregister och
-- låter rättmätiga ägare ta över (claima) sin listning.
--
-- Ägarmodell: SCB-registrerad e-post blir default ägar-adress (claim_email).
-- Att claima = logga in via magisk länk till den adressen → owner_id sätts.
-- Den som inte kan ta emot SCB-mejlet kan begära övertagande (claim_requests)
-- som du granskar manuellt i super-admin.

-- 1. Nya kolumner på businesses ------------------------------------------------
alter table public.businesses
  add column if not exists scb_org_nr   text,
  add column if not exists claimed      boolean not null default true,
  add column if not exists claim_email  text,
  add column if not exists reklamsparr  boolean not null default false,
  add column if not exists source       text not null default 'manual',
  add column if not exists postort      text,
  add column if not exists scb_synced_at timestamptz;

-- Org-nr ska vara unikt när det finns (en juridisk enhet = en listning).
create unique index if not exists businesses_scb_org_nr_key
  on public.businesses (scb_org_nr) where scb_org_nr is not null;

-- 2. Övertagande-begäran (fallback när claim sker med avvikande e-post) --------
create table if not exists public.claim_requests (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  claimant_email  text not null,
  claimant_user_id uuid,
  message         text,
  method          text not null default 'manual',  -- 'manual' | 'domain' | 'email'
  status          text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

create index if not exists claim_requests_business_idx on public.claim_requests (business_id);
create index if not exists claim_requests_status_idx on public.claim_requests (status);

alter table public.claim_requests enable row level security;

-- Vem som helst (även utloggad) får skapa en begäran om övertagande.
drop policy if exists "anyone can request claim" on public.claim_requests;
create policy "anyone can request claim" on public.claim_requests
  for insert with check (true);

-- Den som begärt får se sin egen begäran (matchar inloggad användares e-post).
drop policy if exists "claimant reads own request" on public.claim_requests;
create policy "claimant reads own request" on public.claim_requests
  for select using (
    claimant_user_id = auth.uid()
    or claimant_email = (auth.jwt() ->> 'email')
  );

-- Super-admin (service-role) hanterar allt via admin-klienten (kringgår RLS).
