-- Buggfix: ägare kunde inte pausa sitt företag.
--
-- Orsak: enda SELECT-policyn var "public read businesses" (active = true).
-- När UPDATE satte active = false föll den nya raden ur läsbarheten och
-- Postgres avvisade uppdateringen ("new row violates row-level security").
-- Dessutom: även om pausningen gått igenom hade det pausade företaget
-- försvunnit ur ägarens egen admin-lista.
--
-- Fix: ägare får alltid läsa sina egna rader (oavsett active), och
-- UPDATE-policyn får explicit WITH CHECK.

create policy "owners read their businesses" on public.businesses
  for select using (auth.uid() = owner_id);

alter policy "owners can update their businesses" on public.businesses
  with check (auth.uid() = owner_id);
