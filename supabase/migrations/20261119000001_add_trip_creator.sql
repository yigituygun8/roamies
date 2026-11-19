-- function that adds the new trip's creator as a member
create function private.add_trip_creator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.trip_members (trip_id, user_id)
  values (new.id, new.created_by);

  return new;
end;
$$;

-- this function is used by the trigger, not called by app users
revoke all on function private.add_trip_creator() from public;

-- run it automatically after each new trip is inserted (trigger)
create trigger add_trip_creator
after insert on public.trips
for each row
execute function private.add_trip_creator();