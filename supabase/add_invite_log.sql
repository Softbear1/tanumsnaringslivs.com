-- Loggar utskicket av inbjudningsmejlet till oclaimade SCB-företag, så samma
-- företag aldrig får mejlet två gånger om jobbet avbryts och körs igen, och
-- så vi kan mäta hur många som claimade efter att ha fått mejlet.
create table if not exists public.claim_invite_log (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  sent_at timestamptz not null default now(),
  campaign text not null default 'invite-2026-07'
);
