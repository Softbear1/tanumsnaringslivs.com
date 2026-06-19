create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  owner_id uuid references auth.users(id),
  title text not null,
  description text not null,
  requirements text,
  location text not null,
  job_type text not null default 'sommarjobb',
  category_id text references public.categories(id),
  salary_range text,
  start_date date,
  end_date date,
  apply_email text not null,
  apply_url text,
  status text not null default 'active',
  created_at timestamptz default now()
);

create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  cover_letter text not null,
  created_at timestamptz default now()
);

alter table public.jobs enable row level security;
create policy "public read active jobs" on public.jobs for select using (status = 'active');
create policy "owner manage jobs" on public.jobs for all using (owner_id = auth.uid());

alter table public.applications enable row level security;
create policy "anyone apply" on public.applications for insert with check (true);
create policy "owner read applications" on public.applications for select using (
  job_id in (select id from public.jobs where owner_id = auth.uid())
);
