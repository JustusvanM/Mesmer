-- Security Advisor fixes: Function Search Path + RLS policy

-- 1️⃣ Function Search Path Mutable: set search_path on handle_updated_at
-- Prevents search_path injection; function will resolve to public schema only.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2️⃣ RLS Policy Always True: make insert policy explicit instead of with check (true)
-- Still allows anon signups but restricts to non-empty required fields (no blank signups).
drop policy if exists "Allow public insert" on public.startups;

create policy "Allow public insert"
on public.startups
for insert
to anon
with check (
  trim(name) <> '' and trim(email) <> ''
);

-- 3️⃣ RLS Enabled No Policy (public.leagues): add policies so access is explicit
-- Leagues are reference data: anon can read (for leaderboard/league display); writes via service role only.
create policy "Allow public read leagues"
on public.leagues
for select
to anon
using (true);
