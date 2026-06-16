-- Offertförfrågningar från AI-chatten
create table if not exists public.quote_requests (
  id uuid default gen_random_uuid() primary key,
  summary text not null,
  category_id text references public.categories(id),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  details jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Kopplingstabell: vilka företag fick vilken offert
create table if not exists public.quote_request_businesses (
  quote_request_id uuid references public.quote_requests(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  notified_at timestamptz not null default now(),
  primary key (quote_request_id, business_id)
);

-- Index för snabb sökning per företag
create index if not exists qrb_business_idx on public.quote_request_businesses(business_id);

-- RLS
alter table public.quote_requests enable row level security;
alter table public.quote_request_businesses enable row level security;

-- Vem som helst kan skapa en offertförfrågan
create policy "anon can insert quote_requests" on public.quote_requests
  for insert with check (true);

-- Ägaren av ett företag kan se offerter kopplade till deras företag
create policy "owners can read their quote_requests" on public.quote_requests
  for select using (
    exists (
      select 1 from public.quote_request_businesses qrb
      join public.businesses b on b.id = qrb.business_id
      where qrb.quote_request_id = quote_requests.id
        and b.owner_id = auth.uid()
    )
  );

-- Kund kan läsa sin egen offert via e-post (matchas via Supabase session)
create policy "customer can read own quote" on public.quote_requests
  for select using (contact_email = (select email from auth.users where id = auth.uid()));

create policy "anon can insert quote_request_businesses" on public.quote_request_businesses
  for insert with check (true);

create policy "owners can read their quote_request_businesses" on public.quote_request_businesses
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = quote_request_businesses.business_id
        and b.owner_id = auth.uid()
    )
  );
