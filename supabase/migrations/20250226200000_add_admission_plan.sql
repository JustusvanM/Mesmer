-- Store whether the startup chose monthly ($24) or annual ($19/month) admission for charging when league starts
alter table public.startups
add column if not exists admission_plan text default 'monthly';

comment on column public.startups.admission_plan is 'Admission billing: monthly ($24 when league starts) or annual ($228 = 12×$19 when league starts). Used when charging via PaymentIntent.';
