-- Klickmätning för inbjudningskampanjen. claim_invite_log har redan en rad per
-- skickat mejl; här stämplar vi när mottagaren klickat på "Ta över"-knappen.
-- Ger hela tratten: skickade → klickade → claimade (claimed_at på businesses).
alter table public.claim_invite_log add column if not exists clicked_at timestamptz;
