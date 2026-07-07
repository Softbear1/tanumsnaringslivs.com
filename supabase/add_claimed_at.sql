-- När claimades företaget? Sätts automatiskt via trigger när claimed flippas
-- till true, så inget kodflöde (slutfor, manuell approve, admin) kan glömma den.
alter table public.businesses add column if not exists claimed_at timestamptz;

create or replace function public.set_claimed_at()
returns trigger language plpgsql as $$
begin
  if new.claimed = true and (old.claimed is distinct from true) then
    new.claimed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists businesses_set_claimed_at on public.businesses;
create trigger businesses_set_claimed_at
  before update on public.businesses
  for each row execute function public.set_claimed_at();

-- Backfill: redan claimade företag får dagens datum (exakt tid okänd).
update public.businesses set claimed_at = now() where claimed = true and claimed_at is null;
