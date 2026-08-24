create extension if not exists pgcrypto;

create table if not exists public.software_auction_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  name text not null,
  priority integer not null default 99,
  software text not null default '',
  thesis text not null default '',
  benchmark text not null default '',
  migration_ease integer not null default 5 check (migration_ease between 1 and 10),
  build_ease integer not null default 5 check (build_ease between 1 and 10),
  status text not null default 'testing' check (status in ('testing','winner','paused','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.software_auction_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  segment_id uuid not null references public.software_auction_segments(id) on delete cascade,
  name text not null,
  website text not null default '',
  city text not null default '',
  tier text not null default 'B' check (tier in ('A','B','C')),
  stage text not null default 'research' check (stage in ('research','lpr_found','contacted','discovery','tco_confirmed','demo','migration_test','offer','deposit','pilot','won','lost')),
  current_software text not null default '',
  evidence_url text not null default '',
  evidence_note text not null default '',
  evidence_confidence text not null default 'low' check (evidence_confidence in ('high','medium','low')),
  estimated_users integer,
  estimated_tco_kzt bigint,
  actual_tco_kzt bigint,
  renewal_date date,
  decision_maker_name text not null default '',
  decision_maker_role text not null default '',
  decision_maker_contact text not null default '',
  pain text not null default '',
  must_keep text not null default '',
  why_now text not null default '',
  next_action text not null default '',
  next_action_date date,
  proposed_price_kzt bigint,
  deposit_kzt bigint,
  won_value_kzt bigint,
  lost_reason text not null default '',
  competitor_confirmed boolean not null default false,
  dm_conversation boolean not null default false,
  invoice_seen boolean not null default false,
  demo_committed boolean not null default false,
  migration_data_committed boolean not null default false,
  deposit_committed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.software_auction_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.software_auction_companies(id) on delete cascade,
  activity_type text not null default 'note',
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists software_auction_companies_user_stage_idx
  on public.software_auction_companies(user_id, stage);
create index if not exists software_auction_companies_user_next_action_idx
  on public.software_auction_companies(user_id, next_action_date);
create index if not exists software_auction_companies_user_renewal_idx
  on public.software_auction_companies(user_id, renewal_date);
create index if not exists software_auction_companies_segment_idx
  on public.software_auction_companies(segment_id);
create index if not exists software_auction_activities_company_idx
  on public.software_auction_activities(company_id, created_at desc);

alter table public.software_auction_segments enable row level security;
alter table public.software_auction_companies enable row level security;
alter table public.software_auction_activities enable row level security;

-- Idempotent policies: remove old versions before recreating.
drop policy if exists "auction_segments_select_own" on public.software_auction_segments;
drop policy if exists "auction_segments_insert_own" on public.software_auction_segments;
drop policy if exists "auction_segments_update_own" on public.software_auction_segments;
drop policy if exists "auction_segments_delete_own" on public.software_auction_segments;
create policy "auction_segments_select_own" on public.software_auction_segments for select using (auth.uid() = user_id);
create policy "auction_segments_insert_own" on public.software_auction_segments for insert with check (auth.uid() = user_id);
create policy "auction_segments_update_own" on public.software_auction_segments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "auction_segments_delete_own" on public.software_auction_segments for delete using (auth.uid() = user_id);

drop policy if exists "auction_companies_select_own" on public.software_auction_companies;
drop policy if exists "auction_companies_insert_own" on public.software_auction_companies;
drop policy if exists "auction_companies_update_own" on public.software_auction_companies;
drop policy if exists "auction_companies_delete_own" on public.software_auction_companies;
create policy "auction_companies_select_own" on public.software_auction_companies for select using (auth.uid() = user_id);
create policy "auction_companies_insert_own" on public.software_auction_companies for insert with check (auth.uid() = user_id);
create policy "auction_companies_update_own" on public.software_auction_companies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "auction_companies_delete_own" on public.software_auction_companies for delete using (auth.uid() = user_id);

drop policy if exists "auction_activities_select_own" on public.software_auction_activities;
drop policy if exists "auction_activities_insert_own" on public.software_auction_activities;
drop policy if exists "auction_activities_update_own" on public.software_auction_activities;
drop policy if exists "auction_activities_delete_own" on public.software_auction_activities;
create policy "auction_activities_select_own" on public.software_auction_activities for select using (auth.uid() = user_id);
create policy "auction_activities_insert_own" on public.software_auction_activities for insert with check (auth.uid() = user_id);
create policy "auction_activities_update_own" on public.software_auction_activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "auction_activities_delete_own" on public.software_auction_activities for delete using (auth.uid() = user_id);

create or replace function public.set_software_auction_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists software_auction_segments_updated_at on public.software_auction_segments;
create trigger software_auction_segments_updated_at
before update on public.software_auction_segments
for each row execute function public.set_software_auction_updated_at();

drop trigger if exists software_auction_companies_updated_at on public.software_auction_companies;
create trigger software_auction_companies_updated_at
before update on public.software_auction_companies
for each row execute function public.set_software_auction_updated_at();
