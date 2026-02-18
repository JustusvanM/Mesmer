-- Add anonymous mode: when true, league display shows MRR but hides company name/logo
alter table public.startups
add column if not exists is_anonymous boolean not null default false;

comment on column public.startups.is_anonymous is 'When true, league leaderboard shows MRR but displays "Anonymous" instead of company name and logo';
