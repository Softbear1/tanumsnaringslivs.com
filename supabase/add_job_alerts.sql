-- Job alert subscriptions — email signups for new job notifications.
-- Run this in Supabase SQL editor or via `supabase db push`.

create table if not exists public.job_alerts (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  location text,
  created_at timestamptz default now()
);

-- Prevent duplicate subscriptions for the same email
create unique index if not exists job_alerts_email_idx on public.job_alerts(lower(email));

alter table public.job_alerts enable row level security;

-- Anyone can subscribe; only service-role can read
create policy "anyone subscribe" on public.job_alerts
  for insert with check (true);
