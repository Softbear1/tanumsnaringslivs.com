-- Add owner to businesses
alter table public.businesses add column if not exists owner_id uuid references auth.users(id);

-- Update RLS: owners can manage their own businesses
create policy "owners can insert businesses" on public.businesses
  for insert with check (auth.uid() = owner_id);

create policy "owners can update their businesses" on public.businesses
  for update using (auth.uid() = owner_id);

create policy "owners can delete their businesses" on public.businesses
  for delete using (auth.uid() = owner_id);
