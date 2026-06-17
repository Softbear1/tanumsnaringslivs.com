-- Add logo_url column to businesses
alter table public.businesses
  add column if not exists logo_url text;

-- Storage bucket for logos (public read, owner write)
insert into storage.buckets (id, name, public)
  values ('logos', 'logos', true)
  on conflict (id) do nothing;

-- Public can read logos
create policy "public read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Business owners can upload/replace/delete their own logo
-- File path convention: logos/{business_id}/{filename}
create policy "owner manage logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );

create policy "owner delete logo"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );
