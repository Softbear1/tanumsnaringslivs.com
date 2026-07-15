-- Super-admin-åtkomst till claim_requests via RLS, så att manuella
-- övertagandebegäranden kan godkännas/nekas från webbläsarklienten i
-- super-admin (server actions svarar 404 på Cloudflare Pages-deployen,
-- se supabase/add_superadmin_rls.sql). Additiv till de befintliga
-- policyerna — vem som helst kan fortfarande skapa en begäran, och
-- begäraren kan fortfarande läsa sin egen.

drop policy if exists "super admin all claim_requests" on public.claim_requests;
create policy "super admin all claim_requests" on public.claim_requests
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com')
  with check ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com');
