-- Add interested_in_accelerator: when true, founder indicated interest in the Dublin accelerator
alter table public.startups
add column if not exists interested_in_accelerator boolean not null default false;

comment on column public.startups.interested_in_accelerator is 'When true, founder opted in to express interest in the Dublin accelerator programme';
