-- Lägg till business_id på page_views för per-företag-statistik
alter table public.page_views
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;

-- Index för snabb räkning per företag de senaste 30 dagarna
create index if not exists page_views_business_viewed_at_idx
  on public.page_views(business_id, viewed_at);
