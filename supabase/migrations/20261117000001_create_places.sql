create table public.places (
  id text primary key,
  city text not null,
  name text not null,
  category text not null check (
    category in ('museum', 'landmark', 'food', 'park', 'viewpoint', 'activity')
  ),
  lat double precision not null,
  lng double precision not null,
  opening_hours text,
  description text,
  image_url text,
  image_credit text
);

alter table public.places enable row level security;

revoke all on public.places from anon, authenticated;
grant select on public.places to authenticated;

create policy "Signed-in users can read places"
on public.places
for select
to authenticated
using (true);