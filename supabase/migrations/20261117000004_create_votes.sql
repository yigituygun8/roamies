create table public.votes (
  trip_id uuid not null,
  user_id uuid not null,
  place_id text not null references public.places(id),
  liked boolean not null,
  created_at timestamptz not null default now(),

  primary key (trip_id, user_id, place_id),

  foreign key (trip_id, user_id)
    references public.trip_members(trip_id, user_id)
    on delete cascade
);

alter table public.votes enable row level security;