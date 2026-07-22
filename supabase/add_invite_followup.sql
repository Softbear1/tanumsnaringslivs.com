-- Spårar uppföljningsmejlet till de som klickat på originalinbjudan men
-- inte claimat än. Egen kolumn i stället för ny rad, eftersom
-- claim_invite_log.business_id är primärnyckel (en rad per företag).
alter table public.claim_invite_log add column if not exists followup_sent_at timestamptz;
