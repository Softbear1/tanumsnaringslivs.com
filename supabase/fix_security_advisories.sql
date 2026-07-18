-- Åtgärdar Supabase säkerhetsrådgivarens anmärkningar (juli 2026).
-- Körs en gång mot projektet. Se DESIGN/AGENTS för konventionen med manuellt
-- körda migrationsfiler.

-- ── Tier 1: KRITISKT ────────────────────────────────────────────────────────
-- claim_invite_log saknade RLS (rls_disabled_in_public) och var därmed helt
-- exponerad för anon-nyckeln. Tabellen rörs bara av service-role-klienten
-- (createAdminClient) i claim-invite-flödet och admin-statistiken. Service-role
-- kringgår RLS, så vi slår på RLS UTAN policies = full deny-all mot anon.
-- Samma mönster som claim_attempt_log redan använder.
alter table public.claim_invite_log enable row level security;

-- ── Tier 2: ERROR – security_definer_view på flash_deal_upcoming ─────────────
-- Vyn exponerar (id, business_id, deal_date) för kommande deals. Den var
-- SECURITY DEFINER för att kringgå RLS på flash_deals (som bara tillåter publik
-- läsning av deals med deal_date <= idag). Vi gör vyn security_invoker och
-- lägger en smal, uttrycklig läspolicy för kommande deals istället.
alter view public.flash_deal_upcoming set (security_invoker = true);

create policy "public read upcoming deals" on public.flash_deals
  for select using (
    active = true
    and deal_date > (now() at time zone 'Europe/Stockholm')::date
  );

-- ── Tier 3: WARN som åtgärdas ───────────────────────────────────────────────
-- 3a. Lås search_path på trigger-funktionerna (function_search_path_mutable).
alter function public.recompute_business_rating() set search_path = public;
alter function public.set_claimed_at() set search_path = public;

-- 3b. recompute_business_rating är en trigger-funktion och ska inte gå att
--     anropa via RPC. Triggern kör oavsett EXECUTE-grant.
--     OBS: Postgres beviljar EXECUTE till PUBLIC som standard på alla
--     funktioner, vilket anon/authenticated ärver — så PUBLIC måste också
--     revokas, annars kvarstår rådgivarens anon_security_definer_function-larm.
revoke execute on function public.recompute_business_rating() from anon, authenticated, public;

-- 3c. logos är en publik bucket och läses via getPublicUrl (behöver ingen
--     SELECT-policy). Den breda policyn tillät bara onödig listning av alla
--     filer (public_bucket_allows_listing). Ta bort den.
drop policy "public read logos" on storage.objects;

-- 3d. Leaked-password-protection aktiveras i dashboarden
--     (Authentication → Password), inte via SQL.

-- ── Tier 4: Granskat och medvetet KVAR (ingen åtgärd) ───────────────────────
-- Dessa anmärkningar är avsiktliga och lämnas kvar:
--   * rls_enabled_no_policy på claim_attempt_log, kobbvakt_admin och (efter
--     detta) claim_invite_log – medveten deny-all, bara service-role når dem.
--   * rls_policy_always_true (INSERT with check (true)) på applications,
--     claim_requests, kobbvakt_events, kobbvakt_highscores, page_views,
--     quote_requests, quote_request_businesses – avsiktliga publika inskick.
--   * anon_security_definer_function på kobbvakt_submit_highscore (publik
--     spel-inlämning) och kobbvakt_admin_stats (skyddad av hemlig p_key).
--   * extension_in_public (pg_net) – Supabase-hanterad, flytt kan bryta saker.
