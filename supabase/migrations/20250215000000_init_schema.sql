-- 1️⃣ Enable required extensions
create extension if not exists "pgcrypto";

-- 2️⃣ Create startups table
create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),

  -- Onboarding fields
  name text not null,
  email text not null,
  logo_url text,

  -- Stripe
  stripe_api_key_encrypted text,
  stripe_connected boolean default false,

  -- Revenue tracking
  current_mrr integer default 0,
  mrr_last_updated_at timestamp with time zone,

  -- League system (future-proofing)
  current_league_id uuid,
  league_band text, -- e.g. "0-10k", "10k-20k"
  last_league_allocation_at timestamp with time zone,

  -- System
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3️⃣ Create leagues table (future use)
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mrr_min integer not null,
  mrr_max integer not null,
  season_start timestamp with time zone,
  season_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 4️⃣ Foreign Key (run after leagues exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_league'
  ) then
    alter table public.startups
    add constraint fk_league
    foreign key (current_league_id)
    references public.leagues(id)
    on delete set null;
  end if;
end $$;

-- 5️⃣ Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.startups;

create trigger set_updated_at
before update on public.startups
for each row
execute procedure public.handle_updated_at();

-- 6️⃣ Enable Row Level Security
alter table public.startups enable row level security;
alter table public.leagues enable row level security;

-- 7️⃣ Policies
drop policy if exists "Allow public insert" on public.startups;
drop policy if exists "Block public select" on public.startups;

create policy "Allow public insert"
on public.startups
for insert
to anon
with check (true);

create policy "Block public select"
on public.startups
for select
to anon
using (false);

-- 8️⃣ Indexes
create index if not exists startups_email_idx
on public.startups (email);

create index if not exists startups_mrr_idx
on public.startups (current_mrr);
