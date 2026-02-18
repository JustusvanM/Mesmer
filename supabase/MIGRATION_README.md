# Supabase Migration Instructions

## Unique Email Migration (20250215200000)

Run `supabase/migrations/20250215200000_add_unique_email.sql` in the SQL Editor to prevent duplicate signups.

If you have existing duplicate emails, clean them first:

```sql
-- Check for duplicates
select email, count(*) from public.startups group by email having count(*) > 1;
```

---

## General Instructions

The Supabase JS client cannot run DDL (CREATE TABLE, etc.). Run the migration in one of these ways:

## Option 1: Supabase Dashboard (recommended)

1. Open your project: **https://supabase.com/dashboard/project/yyrizvszrllpnkktaabr**
2. Go to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `supabase/migrations/20250215000000_init_schema.sql`
5. Paste into the editor and click **Run**

## Option 2: Supabase CLI

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Link to your project (uses project ref from .env)
npx supabase link --project-ref yyrizvszrllpnkktaabr

# Push migration
npx supabase db push
```

When linking, you'll be prompted for your database password (from Project Settings → Database).

---

## Verify After Migration

In the SQL Editor, run:

```sql
-- Tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- RLS status
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('startups', 'leagues') AND relnamespace = 'public'::regnamespace;

-- Policies on startups
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'startups';

-- Indexes on startups
SELECT indexname FROM pg_indexes WHERE tablename = 'startups';
```
