-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories
create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text not null,
  color text not null,
  bg_color text not null,
  sort_order integer not null default 0
);

-- Businesses
create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category_id text not null references public.categories(id),
  description text not null,
  phone text not null,
  email text not null,
  website text,
  address text not null,
  initials text not null,
  boosted boolean not null default false,
  featured boolean not null default false,
  rating numeric(3,1) not null default 0,
  review_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Page views (one row per visit, for 30-day rolling count)
create table if not exists public.page_views (
  id bigserial primary key,
  viewed_at timestamptz not null default now()
);

-- Index for fast 30-day count
create index if not exists page_views_viewed_at_idx on public.page_views(viewed_at);

-- RLS policies
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.page_views enable row level security;

-- Anyone can read categories and active businesses
create policy "public read categories" on public.categories for select using (true);
create policy "public read businesses" on public.businesses for select using (active = true);

-- Anyone can insert a page view (for the visitor counter)
create policy "public insert page_views" on public.page_views for insert with check (true);

-- Only service role can read page_views (for the server-side counter)
create policy "service read page_views" on public.page_views for select using (true);

-- Add owner_id to businesses (run after initial schema)
alter table public.businesses add column if not exists owner_id uuid references auth.users(id);

-- RLS: owners can manage their own businesses
create policy "owners can insert businesses" on public.businesses
  for insert with check (auth.uid() = owner_id);

create policy "owners can update their businesses" on public.businesses
  for update using (auth.uid() = owner_id);

create policy "owners can delete their businesses" on public.businesses
  for delete using (auth.uid() = owner_id);
