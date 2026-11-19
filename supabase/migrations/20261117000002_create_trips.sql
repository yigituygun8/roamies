create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;