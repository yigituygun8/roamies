-- allow creating trips and editing their name/city
grant insert (name, city, created_by)
  on public.trips to authenticated;
grant update (name, city)
  on public.trips to authenticated;
grant delete on public.trips to authenticated;

-- users can create trips only with themselves as creator
create policy "Users create their own trips"
on public.trips for insert to authenticated
with check (created_by = (select auth.uid()));

-- only the creator can update a trip
create policy "Creators update trips"
on public.trips for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

-- only the creator can delete a trip
create policy "Creators delete trips"
on public.trips for delete to authenticated
using (created_by = (select auth.uid()));