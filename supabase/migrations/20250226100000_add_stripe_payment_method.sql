-- Store Mesmer's Stripe customer and payment method for admission fee (charged when league starts)
alter table public.startups
add column if not exists stripe_customer_id text,
add column if not exists stripe_payment_method_id text;

comment on column public.startups.stripe_customer_id is 'Stripe Customer ID (Mesmer account) for admission billing';
comment on column public.startups.stripe_payment_method_id is 'Stripe PaymentMethod ID (card verified at signup, charged when league starts)';
