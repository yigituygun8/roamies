grant select, delete on public.votes to authenticated;
grant insert (trip_id, user_id, place_id, liked)
  on public.votes to authenticated;
grant update (liked) on public.votes to authenticated;

create policy "Users manage their own votes"
on public.votes
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));