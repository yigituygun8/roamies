-- remove existing app permissions to add only what is needed
revoke all on public.trips from anon, authenticated;

-- allow signed-in users to request trip rows
grant select on public.trips to authenticated;

-- limit the returned rows to trips they created or joined
create policy "Creators and members read trips"
on public.trips
for select
to authenticated
using (
  created_by = (select auth.uid())
  or id in (select private.my_trip_ids())
);