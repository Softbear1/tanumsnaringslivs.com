-- Loggar varje claim-försök (lyckat och misslyckat) i alla tre flöden:
-- gamla /ta-over-sidan, Elias-modalens org-nr-flöde, manuell begäran, och
-- slutfor-sidan/auth-callbacken. Utan detta syns ett misslyckat försök bara
-- som en tystnad — ingen auth.users-rad, ingen ägare, inget spår av varför.
create table if not exists public.claim_attempt_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source text not null,       -- 'ta_over' | 'elias' | 'manual' | 'slutfor' | 'callback'
  outcome text not null,      -- 'sent' | 'already' | 'no_email' | 'org_mismatch' | 'requested'
                               -- | 'completed' | 'email_mismatch' | 'link_invalid' | 'error'
  target_email text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists claim_attempt_log_business_idx on public.claim_attempt_log (business_id);
create index if not exists claim_attempt_log_created_idx on public.claim_attempt_log (created_at desc);
create index if not exists claim_attempt_log_outcome_idx on public.claim_attempt_log (outcome);

alter table public.claim_attempt_log enable row level security;
-- Inga policies — bara admin-klienten (service-role) skriver och läser,
-- vilket kringgår RLS. Innehåller mejladresser, så ingen publik åtkomst.
