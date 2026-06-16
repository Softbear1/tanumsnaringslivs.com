-- Verifierade omdömen: bara den kund som faktiskt skickade en offertförfrågan,
-- och vars förfrågan företaget markerat som "handled", kan recensera.

-- 1) Företag måste kunna markera en offert som hanterad (status-uppdatering).
create policy "owners can update their quote_requests" on public.quote_requests
  for update using (
    exists (
      select 1 from public.quote_request_businesses qrb
      join public.businesses b on b.id = qrb.business_id
      where qrb.quote_request_id = quote_requests.id
        and b.owner_id = auth.uid()
    )
  );

-- 2) Omdömen
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  reviewer_email text not null,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  -- Ett omdöme per företag och offert.
  unique (quote_request_id, business_id)
);

create index if not exists reviews_business_idx on public.reviews(business_id);

alter table public.reviews enable row level security;

-- Vem som helst får läsa omdömen.
create policy "public read reviews" on public.reviews
  for select using (true);

-- Bara den inloggade kunden bakom en hanterad offert får skriva omdöme,
-- och bara för de företag offerten faktiskt gick till.
create policy "verified customer can insert review" on public.reviews
  for insert with check (
    reviewer_email = (select email from auth.users where id = auth.uid())
    and exists (
      select 1
      from public.quote_requests qr
      join public.quote_request_businesses qrb on qrb.quote_request_id = qr.id
      where qr.id = reviews.quote_request_id
        and qrb.business_id = reviews.business_id
        and qr.contact_email = (select email from auth.users where id = auth.uid())
        and qr.status = 'handled'
    )
  );

-- 3) Räkna om företagets betyg + antal recensioner automatiskt.
create or replace function public.recompute_business_rating()
returns trigger
language plpgsql
security definer
as $$
declare
  bid uuid := coalesce(new.business_id, old.business_id);
begin
  update public.businesses b
  set
    rating = coalesce(
      (select round(avg(rating)::numeric, 1) from public.reviews where business_id = bid),
      0
    ),
    review_count = (select count(*) from public.reviews where business_id = bid)
  where b.id = bid;
  return null;
end;
$$;

drop trigger if exists reviews_recompute on public.reviews;
create trigger reviews_recompute
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_business_rating();
