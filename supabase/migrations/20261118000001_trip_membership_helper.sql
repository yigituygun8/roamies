create schema if not exists private;

create function private.my_trip_ids()
returns setof uuid
language sql
stable -- this function reads data without changing it and can be treated consistently within a single statement
security definer -- runs the function with the permissions of the db role that created it
set search_path = ''
as $$
  select trip_id
  from public.trip_members
  where user_id = (select auth.uid());
$$;

revoke all on function private.my_trip_ids() from public; -- removes permission for everyone to call it by default

grant usage on schema private to authenticated; -- allows signed-in users to access the namespace
grant execute on function private.my_trip_ids() to authenticated; -- allows signed-in useres to call this function