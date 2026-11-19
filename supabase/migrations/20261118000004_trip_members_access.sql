-- reset permissions. then allow reading, adding, and removing members
revoke all on public.trip_members from anon, authenticated;

grant select, delete on public.trip_members to authenticated;
grant insert (trip_id, user_id)
  on public.trip_members to authenticated;

-- members and creators can see their trip's member list
create policy "Read trip membership"
on public.trip_members for select to authenticated
using (
  exists (
    select 1 from public.trips t
    where t.id = trip_members.trip_id
  )
);

-- only the trip creator can add members
create policy "Creators add members"
on public.trip_members for insert to authenticated
with check (
  exists (
    select 1 from public.trips t
    where t.id = trip_members.trip_id
      and t.created_by = (select auth.uid())
  )
);

-- members can leave. creators can remove members.
create policy "Leave trip or remove members"
on public.trip_members for delete to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.trips t
    where t.id = trip_members.trip_id
      and t.created_by = (select auth.uid())
  )
);