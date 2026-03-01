-- When we successfully charge admission (PaymentIntent), set this so we don't double-charge.
-- Null = not yet charged. Set by /api/charge-admission after a successful charge.
-- For monthly plan you can later run charge again after 1 month (e.g. set null for monthly after 30 days, or use next_billing_date).
alter table public.startups
add column if not exists admission_charged_at timestamp with time zone;

comment on column public.startups.admission_charged_at is 'When admission was last charged (Stripe PaymentIntent). Null = never charged. Used to avoid double-charge.';

create index if not exists startups_admission_charged_at_idx
on public.startups (admission_charged_at)
where admission_charged_at is null;
