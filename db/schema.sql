-- ============================================================================
-- Pabliki Client Radar — DRAFT PostgreSQL schema
-- ============================================================================
-- STATUS: DRAFT. This file is NOT applied to any real database, NOT connected
-- to any live Supabase project, and is not executed by the application at
-- runtime. It exists purely as a forward-looking design artifact: a sketch of
-- what the eventual production schema (targeting Supabase/Postgres) might
-- look like once the prototype's in-memory mock data (lib/mock.ts,
-- lib/types.ts, lib/sources.ts) gets a real persistence layer.
--
-- Conventions:
--   - All primary keys are `uuid` generated with gen_random_uuid()
--     (requires the pgcrypto extension, enabled below).
--   - Every table has created_at / updated_at timestamptz default now().
--   - Enum types mirror the TypeScript union types in lib/types.ts /
--     lib/mock.ts as closely as practical.
--   - Foreign keys use ON DELETE behavior chosen defensively (mostly
--     ON DELETE SET NULL / RESTRICT) — revisit once real write patterns
--     are known.
--   - Money fields use bigint (tenge, no fractional currency in this domain).
--   - This schema is intentionally NOT wired into any ORM/migration tool yet.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- SECTION 1: ENUM TYPES (mirroring lib/types.ts unions)
-- ============================================================================

create type lead_temperature as enum ('hot', 'warming', 'cooling', 'cold', 'expired');
create type sla_status as enum ('on_time', 'warning', 'overdue');
create type source_connector_status as enum ('active', 'mock', 'pending_access', 'error', 'disabled');
create type source_connector_mode as enum ('auto', 'semi', 'manual');
create type offer_status as enum ('testing', 'winner', 'retired');
create type reply_classification_label as enum (
  'interested', 'objection_price', 'objection_timing', 'not_interested',
  'wrong_contact', 'already_client', 'needs_followup'
);
create type lost_reason as enum (
  'price', 'timing', 'competitor', 'no_budget', 'no_response', 'not_decision_maker', 'other'
);
create type contact_confidence as enum ('high', 'medium', 'low', 'none');
create type budget_signal as enum ('high', 'medium', 'low', 'none');
create type lead_status as enum (
  'new', 'need_check', 'need_write', 'written', 'replied', 'need_proposal',
  'proposal_sent', 'negotiation', 'payment', 'rejected', 'return_later'
);
create type deal_stage as enum (
  'new', 'qualified', 'proposal_sent', 'negotiation', 'payment_pending',
  'won', 'lost'
);
create type user_role as enum ('founder', 'manager', 'admin', 'viewer');
create type import_batch_status as enum ('queued', 'processing', 'completed', 'failed');
create type notification_channel as enum ('in_app', 'email', 'push', 'telegram');
create type task_priority as enum ('hot', 'warm', 'watch', 'base');
create type task_status as enum ('open', 'in_progress', 'done', 'cancelled');

-- ============================================================================
-- SECTION 2: CORE GEO / TAXONOMY REFERENCE TABLES
-- ============================================================================

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text,
  geo_weight numeric(3,2) not null default 0.5, -- 0..1, used by lib/scoring.ts geoWeight
  has_publics_base boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table districts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, name)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- e.g. "Недвижимость / ЖК"
  parent_category_id uuid references categories(id) on delete set null,
  money_weight numeric(3,2) not null default 0.5, -- nicheMoneyWeight, 0..1
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table niches (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table trigger_types (
  key text primary key, -- e.g. 'real_estate_launch', 'payment_abandoned'
  label_ru text not null,
  sla_deadline_hours integer not null default 48,
  decay_hot_hours integer not null default 72,
  decay_warming_hours integer not null default 240,
  decay_cooling_hours integer not null default 480,
  decay_cold_hours integer not null default 960,
  money_weight numeric(3,2) not null default 0.4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- SECTION 3: USERS / AUTH (minimal shape — real auth likely via Supabase Auth)
-- ============================================================================

create table users (
  id uuid primary key default gen_random_uuid(),
  auth_provider_id text unique, -- maps to Supabase auth.users.id once wired up
  email text unique not null,
  full_name text,
  role user_role not null default 'manager',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table managers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  display_name text not null, -- e.g. "Айгерим", "Дамир" — matches lib/mock.ts Lead.manager
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table manager_coaching_stats (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references managers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  avg_response_time_minutes numeric(10,2) not null default 0,
  conversion_rate numeric(5,4) not null default 0,
  leads_handled integer not null default 0,
  score_vs_team_avg numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- SECTION 4: COMPANIES / CONTACTS / LEADS
-- ============================================================================

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bin text, -- БИН (business identification number, Kazakhstan)
  category_id uuid references categories(id) on delete set null,
  niche_id uuid references niches(id) on delete set null,
  city_id uuid references cities(id) on delete set null,
  district_id uuid references districts(id) on delete set null,
  address text,
  website text,
  is_decision_maker_known boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bin)
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  phone text,
  whatsapp text,
  instagram text,
  telegram text,
  email text,
  website text,
  contact_confidence contact_confidence not null default 'none',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  display_id text unique, -- human-readable id, e.g. "L-1042" (matches lib/mock.ts Lead.id)
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  city_id uuid references cities(id) on delete set null,
  district_id uuid references districts(id) on delete set null,
  trigger_type text references trigger_types(key) on delete set null,
  trigger_text text,
  source_key text, -- references sources.key, see SECTION 5 (not enforced FK: sources can be soft-deleted)
  source_url text,
  signal_date timestamptz not null,
  last_activity_at timestamptz,
  score integer not null default 0,
  score_explanation text,
  budget_min bigint,
  budget_max bigint,
  package_description text,
  recommended_geo text,
  recommended_format text,
  action text,
  status lead_status not null default 'new',
  manager_id uuid references managers(id) on delete set null,
  contact_confidence contact_confidence not null default 'none',
  temperature lead_temperature,
  sla_status sla_status,
  sla_deadline_at timestamptz,
  deal_probability numeric(5,4),
  potential_deal_size bigint,
  expected_margin numeric(5,4),
  money_priority_score bigint,
  is_decision_maker boolean not null default false,
  source_confidence numeric(5,4),
  lost_reason lost_reason,
  is_founder_boosted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_status on leads(status);
create index idx_leads_manager on leads(manager_id);
create index idx_leads_temperature on leads(temperature);
create index idx_leads_sla_status on leads(sla_status);
create index idx_leads_signal_date on leads(signal_date desc);

-- ============================================================================
-- SECTION 5: SOURCES / CONNECTORS / SIGNALS
-- ============================================================================

create table sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- e.g. 'google_places', '2gis', matches lib/sources.ts SourceConnector.key
  name text not null,
  category text not null,
  status source_connector_status not null default 'mock',
  mode source_connector_mode not null default 'auto',
  reliability numeric(3,2) not null default 0.5,
  last_run_at timestamptz,
  next_run_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table source_required_env_vars (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  env_var_name text not null,
  created_at timestamptz not null default now(),
  unique (source_id, env_var_name)
);

create table source_health_log (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  run_at timestamptz not null default now(),
  status text not null, -- 'success' | 'error' | 'timeout' | 'skipped'
  signals_collected integer not null default 0,
  error_message text,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index idx_source_health_log_source on source_health_log(source_id, run_at desc);

create table integration_status (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade unique,
  status source_connector_status not null default 'pending_access',
  last_checked_at timestamptz,
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table api_keys_config (
  id uuid primary key default gen_random_uuid(),
  env_var_name text not null unique, -- e.g. 'GOOGLE_PLACES_API_KEY' — registry only, NEVER stores the actual secret value
  description text,
  is_configured boolean not null default false, -- whether the corresponding env var is currently set in the deployment
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table signals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  trigger_type text references trigger_types(key) on delete set null,
  raw_payload jsonb,
  signal_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_signals_lead on signals(lead_id);
create index idx_signals_source on signals(source_id);

create table webhooks_inbound (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  payload jsonb not null,
  headers jsonb,
  processed boolean not null default false,
  processed_at timestamptz,
  error_message text,
  received_at timestamptz not null default now()
);

-- ============================================================================
-- SECTION 6: SCORING / TEMPERATURE / SLA / MONEY SCORE HISTORY
-- ============================================================================

create table scoring_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  score integer not null,
  breakdown jsonb not null, -- { trigger, niche, contact, geo, budget, freshness, reliability, penalty }
  computed_at timestamptz not null default now()
);

create index idx_scoring_history_lead on scoring_history(lead_id, computed_at desc);

create table temperature_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  temperature lead_temperature not null,
  computed_at timestamptz not null default now()
);

create index idx_temperature_history_lead on temperature_history(lead_id, computed_at desc);

create table sla_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  sla_status sla_status not null,
  deadline_at timestamptz,
  contacted_at timestamptz,
  event_type text not null default 'status_change', -- 'status_change' | 'first_contact' | 'breach'
  created_at timestamptz not null default now()
);

create index idx_sla_events_lead on sla_events(lead_id, created_at desc);

create table money_score_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  score bigint not null,
  breakdown jsonb not null, -- MoneyScoreBreakdown shape
  computed_at timestamptz not null default now()
);

create index idx_money_score_history_lead on money_score_history(lead_id, computed_at desc);

create table founder_boosts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  boosted_by uuid references users(id) on delete set null,
  is_boosted boolean not null default true,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id)
);

-- ============================================================================
-- SECTION 7: OFFERS / OFFER TESTING LAB
-- ============================================================================

create table offers (
  id uuid primary key default gen_random_uuid(),
  display_id text unique, -- e.g. "OF-1"
  name text not null,
  niche_id uuid references niches(id) on delete set null,
  channel text,
  package_description text,
  price_from bigint not null default 0,
  price_to bigint not null default 0,
  conversion_rate_mock numeric(5,4) not null default 0,
  sample_size integer not null default 0,
  status offer_status not null default 'testing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table offer_tests (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  outcome text not null, -- 'converted' | 'rejected' | 'no_response'
  tested_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_offer_tests_offer on offer_tests(offer_id);

-- ============================================================================
-- SECTION 8: SALES SCRIPTS / MESSAGES / TEMPLATES
-- ============================================================================

create table sales_scripts (
  id uuid primary key default gen_random_uuid(),
  display_id text unique, -- e.g. "SS-1"
  trigger_type text references trigger_types(key) on delete set null,
  niche_id uuid references niches(id) on delete set null,
  situation text not null,
  script_text text not null,
  objection_handled text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table script_usage (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references sales_scripts(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  manager_id uuid references managers(id) on delete set null,
  used_at timestamptz not null default now(),
  resulted_in_reply boolean,
  created_at timestamptz not null default now()
);

create index idx_script_usage_script on script_usage(script_id);

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  trigger_type text references trigger_types(key) on delete set null,
  channel text not null default 'whatsapp', -- 'whatsapp' | 'telegram' | 'email' | 'sms'
  template_type text not null default 'initial', -- 'initial' | 'follow_up_1d' | 'follow_up_3d'
  body_template text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages_sent (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  template_id uuid references message_templates(id) on delete set null,
  channel text not null default 'whatsapp',
  body text not null,
  status text not null default 'queued', -- 'queued' | 'sent' | 'delivered' | 'failed' | 'simulated'
  sent_by uuid references users(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_messages_sent_lead on messages_sent(lead_id, created_at desc);

-- ============================================================================
-- SECTION 9: REPLY CLASSIFICATION
-- ============================================================================

create table reply_classifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  reply_text text not null,
  classification reply_classification_label not null,
  suggested_next_action text,
  classified_by text not null default 'heuristic', -- 'heuristic' | 'ai_model' | 'manager'
  created_at timestamptz not null default now()
);

create index idx_reply_classifications_lead on reply_classifications(lead_id);

-- ============================================================================
-- SECTION 10: DO-NOT-CONTACT / BLACKLIST / LOST REASONS
-- ============================================================================

create table do_not_contact (
  id uuid primary key default gen_random_uuid(),
  bin text,
  phone text,
  reason text not null,
  added_by uuid references users(id) on delete set null,
  added_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_do_not_contact_bin on do_not_contact(bin);
create index idx_do_not_contact_phone on do_not_contact(phone);

create table blacklist (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  bin text,
  reason text not null,
  created_at timestamptz not null default now()
);

create table lost_reasons_taxonomy (
  key lost_reason primary key,
  label_ru text not null
);

-- ============================================================================
-- SECTION 11: TASKS / WORKDAY / QUICK WINS
-- ============================================================================

create table tasks (
  id uuid primary key default gen_random_uuid(),
  display_id text unique, -- e.g. "T-1"
  lead_id uuid references leads(id) on delete cascade,
  manager_id uuid references managers(id) on delete set null,
  type text not null, -- write_whatsapp | call | send_proposal | build_selection | follow_up | review
  due_at timestamptz,
  priority task_priority not null default 'base',
  status task_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_manager on tasks(manager_id);
create index idx_tasks_due_at on tasks(due_at);
create index idx_tasks_status on tasks(status);

create table workday_sessions (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references managers(id) on delete cascade,
  session_date date not null default current_date,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  leads_touched integer not null default 0,
  tasks_completed integer not null default 0,
  created_at timestamptz not null default now(),
  unique (manager_id, session_date)
);

-- ============================================================================
-- SECTION 12: DEALS / REVENUE
-- ============================================================================

create table deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  manager_id uuid references managers(id) on delete set null,
  stage deal_stage not null default 'new',
  amount bigint,
  margin numeric(5,4),
  currency text not null default 'KZT',
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_deals_lead on deals(lead_id);
create index idx_deals_stage on deals(stage);

create table deal_stage_history (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  from_stage deal_stage,
  to_stage deal_stage not null,
  changed_by uuid references users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index idx_deal_stage_history_deal on deal_stage_history(deal_id, changed_at desc);

create table revenue_attribution (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  trigger_type text references trigger_types(key) on delete set null,
  attributed_amount bigint not null default 0,
  attribution_model text not null default 'first_touch', -- 'first_touch' | 'last_touch' | 'linear'
  created_at timestamptz not null default now()
);

create index idx_revenue_attribution_deal on revenue_attribution(deal_id);

-- ============================================================================
-- SECTION 13: IMPORT / DEDUP / ENRICHMENT
-- ============================================================================

create table import_batches (
  id uuid primary key default gen_random_uuid(),
  display_id text unique, -- e.g. "IMP-demo1"
  file_name text,
  status import_batch_status not null default 'queued',
  row_count integer not null default 0,
  created_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  error_rows integer not null default 0,
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references import_batches(id) on delete cascade,
  row_number integer not null,
  raw_data jsonb not null,
  lead_id uuid references leads(id) on delete set null,
  status text not null default 'pending', -- 'pending' | 'created' | 'duplicate' | 'error'
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_import_rows_batch on import_rows(batch_id);

create table dedup_candidates (
  id uuid primary key default gen_random_uuid(),
  lead_id_a uuid not null references leads(id) on delete cascade,
  lead_id_b uuid not null references leads(id) on delete cascade,
  similarity_score numeric(5,4) not null default 0,
  resolution text not null default 'unresolved', -- 'unresolved' | 'merged' | 'distinct'
  created_at timestamptz not null default now(),
  check (lead_id_a <> lead_id_b)
);

create table enrichment_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  job_type text not null, -- 'lookup_bin_registry' | 'lookup_google_places' | 'lookup_2gis_card' | 'lookup_social_profiles'
  status text not null default 'queued', -- 'queued' | 'running' | 'completed' | 'failed'
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_enrichment_jobs_lead on enrichment_jobs(lead_id);

-- ============================================================================
-- SECTION 14: NOTIFICATIONS / SETTINGS / AUDIT
-- ============================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  channel notification_channel not null default 'in_app',
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, created_at desc);

create table settings (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'global', -- 'global' | 'user' | 'manager'
  scope_id uuid, -- nullable: refers to users.id when scope='user', etc.
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, scope_id, key)
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  entity_type text not null, -- 'lead' | 'offer' | 'task' | 'deal' | ...
  entity_id uuid not null,
  action text not null, -- 'create' | 'update' | 'delete' | 'status_change'
  diff jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_log_entity on audit_log(entity_type, entity_id);

-- ============================================================================
-- SECTION 15: LEAD LIFECYCLE / STATUS HISTORY / ASSIGNMENT
-- ============================================================================

create table lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  from_status lead_status,
  to_status lead_status not null,
  changed_by uuid references users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index idx_lead_status_history_lead on lead_status_history(lead_id, changed_at desc);

create table lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  manager_id uuid references managers(id) on delete set null,
  assigned_by uuid references users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);

create index idx_lead_assignments_lead on lead_assignments(lead_id);

create table lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_lead_notes_lead on lead_notes(lead_id, created_at desc);

create table lead_activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  activity_type text not null, -- 'call' | 'whatsapp_sent' | 'reply_received' | 'note' | 'status_change'
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_lead_activity_log_lead on lead_activity_log(lead_id, occurred_at desc);

-- ============================================================================
-- SECTION 16: GEO / PUBLICS INVENTORY (паблики — ad inventory the agency sells)
-- ============================================================================

create table public_pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city_id uuid references cities(id) on delete set null,
  district_id uuid references districts(id) on delete set null,
  category text, -- 'городской' | 'районный' | 'новостной' | 'мамский' | 'lifestyle' | ...
  platform text not null default 'instagram', -- 'instagram' | 'telegram' | 'vk' | 'whatsapp_channel'
  followers_count integer not null default 0,
  avg_reach integer not null default 0,
  price_per_post bigint,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_public_pages_city on public_pages(city_id);

create table offer_public_pages (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  public_page_id uuid not null references public_pages(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (offer_id, public_page_id)
);

create table inventory_fit_scores (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  score numeric(5,4) not null default 0, -- inventoryFitScore used in lib/moneyScore.ts
  computed_at timestamptz not null default now()
);

create index idx_inventory_fit_scores_lead on inventory_fit_scores(lead_id, computed_at desc);

-- ============================================================================
-- SECTION 17: ADMIN / PLATFORM CONFIG
-- ============================================================================

create table source_categories (
  key text primary key, -- 'owned' | 'directories' | 'news' | 'trends' | 'ads' | 'social' | 'government' | 'manual' | 'hiring' | 'events' | 'reputation'
  label_ru text not null
);

create table rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade,
  window_start timestamptz not null default now(),
  request_count integer not null default 0,
  limit_exceeded boolean not null default false,
  created_at timestamptz not null default now()
);

create table feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  ip_address text,
  user_agent text
);

create index idx_user_sessions_user on user_sessions(user_id);

create table webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_url text not null,
  event_type text not null, -- 'lead.created' | 'lead.status_changed' | 'deal.won' | ...
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- END OF DRAFT SCHEMA
-- ============================================================================
