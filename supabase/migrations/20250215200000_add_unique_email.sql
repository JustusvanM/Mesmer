-- Add unique constraint on email to prevent duplicate signups
-- Idempotent: safe to run multiple times
alter table public.startups
drop constraint if exists startups_email_unique;

alter table public.startups
add constraint startups_email_unique unique (email);
