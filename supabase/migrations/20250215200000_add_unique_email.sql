-- Add unique constraint on email to prevent duplicate signups
-- Run this only if startups table has no duplicate emails
alter table public.startups
add constraint startups_email_unique unique (email);
