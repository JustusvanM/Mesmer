-- Drop interested_in_accelerator: accelerator interest toggle removed from product
alter table public.startups
drop column if exists interested_in_accelerator;

