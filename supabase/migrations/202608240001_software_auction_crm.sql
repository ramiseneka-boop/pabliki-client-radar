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
  unique (user_id, code),
  unique (id, user_id)
);

create table if not exists public.software_auction_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  segment_id uuid not null,
  name text not null,
  website text not null default '',
  city text not null default '',
  tier text not null default 'B' check (tier in ('A','B','C')),
  stage text not null default 'research' check (stage in ('research','lpr_found','contacted','discovery','tco_confirmed','demo','migration_test','offer','deposit','pilot','won','lost')),
  current_software text not null default '',
  evidence_url text not null default '',
  evidence_note text not null default '',
  evidence_confidence text not null default 'low' check (evidence_confidence in ('high','medium','low')),
  estimated_users integer check (estimated_users is null or estimated_users >= 0),
  estimated_tco_kzt bigint check (estimated_tco_kzt is null or estimated_tco_kzt >= 0),
  actual_tco_kzt bigint check (actual_tco_kzt is null or actual_tco_kzt >= 0),
  renewal_date date,
  decision_maker_name text not null default '',
  decision_maker_role text not null default '',
  decision_maker_contact text not null default '',
  pain text not null default '',
  must_keep text not null default '',
  why_now text not null default '',
  next_action text not null default '',
  next_action_date date,
  proposed_price_kzt bigint check (proposed_price_kzt is null or proposed_price_kzt >= 0),
  deposit_kzt bigint check (deposit_kzt is null or deposit_kzt >= 0),
  won_value_kzt bigint check (won_value_kzt is null or won_value_kzt >= 0),
  lost_reason text not null default '',
  competitor_confirmed boolean not null default false,
  dm_conversation boolean not null default false,
  invoice_seen boolean not null default false,
  demo_committed boolean not null default false,
  migration_data_committed boolean not null default false,
  deposit_committed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint software_auction_companies_segment_owner_fk
    foreign key (segment_id, user_id)
    references public.software_auction_segments(id, user_id)
    on delete cascade
);

create table if not exists public.software_auction_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null,
  activity_type text not null default 'note',
  note text not null,
  created_at timestamptz not null default now(),
  constraint software_auction_activities_company_owner_fk
    foreign key (company_id, user_id)
    references public.software_auction_companies(id, user_id)
    on delete cascade
);

create index if not exists software_auction_segments_user_idx
  on public.software_auction_segments(user_id);
create index if not exists software_auction_companies_user_stage_idx
  on public.software_auction_companies(user_id, stage);
create index if not exists software_auction_companies_user_next_action_idx
  on public.software_auction_companies(user_id, next_action_date);
create index if not exists software_auction_companies_user_renewal_idx
  on public.software_auction_companies(user_id, renewal_date);
create index if not exists software_auction_companies_segment_idx
  on public.software_auction_companies(segment_id, user_id);
create index if not exists software_auction_activities_user_company_idx
  on public.software_auction_activities(user_id, company_id, created_at desc);

-- The browser must never have table access as anon. Signed-in users receive only
-- the minimum CRUD grants needed by the CRM; RLS below still controls every row.
revoke all on table public.software_auction_segments from anon;
revoke all on table public.software_auction_companies from anon;
revoke all on table public.software_auction_activities from anon;
grant select, insert, update, delete on table public.software_auction_segments to authenticated;
grant select, insert, update, delete on table public.software_auction_companies to authenticated;
grant select, insert, update, delete on table public.software_auction_activities to authenticated;

alter table public.software_auction_segments enable row level security;
alter table public.software_auction_companies enable row level security;
alter table public.software_auction_activities enable row level security;

-- Idempotent policies. TO authenticated avoids evaluating ownership policies for anon.
drop policy if exists "auction_segments_select_own" on public.software_auction_segments;
drop policy if exists "auction_segments_insert_own" on public.software_auction_segments;
drop policy if exists "auction_segments_update_own" on public.software_auction_segments;
drop policy if exists "auction_segments_delete_own" on public.software_auction_segments;
create policy "auction_segments_select_own" on public.software_auction_segments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "auction_segments_insert_own" on public.software_auction_segments
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "auction_segments_update_own" on public.software_auction_segments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "auction_segments_delete_own" on public.software_auction_segments
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "auction_companies_select_own" on public.software_auction_companies;
drop policy if exists "auction_companies_insert_own" on public.software_auction_companies;
drop policy if exists "auction_companies_update_own" on public.software_auction_companies;
drop policy if exists "auction_companies_delete_own" on public.software_auction_companies;
create policy "auction_companies_select_own" on public.software_auction_companies
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "auction_companies_insert_own" on public.software_auction_companies
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "auction_companies_update_own" on public.software_auction_companies
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "auction_companies_delete_own" on public.software_auction_companies
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "auction_activities_select_own" on public.software_auction_activities;
drop policy if exists "auction_activities_insert_own" on public.software_auction_activities;
drop policy if exists "auction_activities_update_own" on public.software_auction_activities;
drop policy if exists "auction_activities_delete_own" on public.software_auction_activities;
create policy "auction_activities_select_own" on public.software_auction_activities
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "auction_activities_insert_own" on public.software_auction_activities
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "auction_activities_update_own" on public.software_auction_activities
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "auction_activities_delete_own" on public.software_auction_activities
  for delete to authenticated using ((select auth.uid()) = user_id);

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

-- Trigger-only helper: do not expose it as a callable Data API function.
revoke execute on function public.set_software_auction_updated_at() from public, anon, authenticated;

drop trigger if exists software_auction_segments_updated_at on public.software_auction_segments;
create trigger software_auction_segments_updated_at
before update on public.software_auction_segments
for each row execute function public.set_software_auction_updated_at();

drop trigger if exists software_auction_companies_updated_at on public.software_auction_companies;
create trigger software_auction_companies_updated_at
before update on public.software_auction_companies
for each row execute function public.set_software_auction_updated_at();
