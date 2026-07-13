-- Super-admin-åtkomst via RLS. Admin-portalens moderering (pausa/ta bort/
-- reklamspärra företag, deals, annonser, jobb) körs från webbläsarklienten —
-- server actions svarar 404 på Cloudflare Pages-deployen och service-rollen
-- ska inte exponeras i klienten. E-postadressen speglar SUPER_ADMIN_EMAIL i
-- src/lib/auth.ts; byts adressen måste båda uppdateras.

drop policy if exists "super admin all businesses" on public.businesses;
create policy "super admin all businesses" on public.businesses
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com')
  with check ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com');

drop policy if exists "super admin all flash_deals" on public.flash_deals;
create policy "super admin all flash_deals" on public.flash_deals
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com')
  with check ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com');

drop policy if exists "super admin all ads" on public.ads;
create policy "super admin all ads" on public.ads
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com')
  with check ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com');

drop policy if exists "super admin all jobs" on public.jobs;
create policy "super admin all jobs" on public.jobs
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com')
  with check ((auth.jwt() ->> 'email') = 'elias.bengtsson@live.com');
