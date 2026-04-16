-- ─────────────────────────────────────────────────────────────────────────────
-- GlobalBiz AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── daily_usage ─────────────────────────────────────────────────────────────
create table if not exists daily_usage (
  id          uuid primary key default uuid_generate_v4(),
  usage_date  date not null unique default current_date,
  count       integer not null default 0,
  limit_val   integer not null default 10,
  created_at  timestamptz default now()
);

-- ─── reports ─────────────────────────────────────────────────────────────────
create table if not exists reports (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz default now(),

  -- Location
  country             text not null,
  state_province      text,
  city                text not null,
  suburb              text,
  postcode            text,
  address             text,
  radius_km           integer default 3,

  -- Business
  business_type       text not null,
  products_services   text not null,
  avg_price_range     text,
  startup_budget      text,
  staff_count         integer,
  operating_hours     text,
  target_customers    text,

  -- Community
  community_type      text,
  income_level        text,
  preferred_language  text,
  target_age_group    text,
  audience_type       text,
  delivery_needed     boolean default false,

  -- Goals
  expected_revenue    text,
  launch_timeline     text,
  growth_goal         text,
  risk_tolerance      text,

  -- AI Results (stored as JSONB)
  analysis            jsonb,

  -- Meta
  ip_hash             text,
  usage_date          date default current_date
);

-- ─── waitlist ────────────────────────────────────────────────────────────────
create table if not exists waitlist (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null,
  country         text,
  business_type   text,
  launch_month    text,
  created_at      timestamptz default now()
);

-- ─── feedback ────────────────────────────────────────────────────────────────
create table if not exists feedback (
  id              uuid primary key default uuid_generate_v4(),
  report_id       uuid references reports(id),
  useful          boolean,
  helpful_section text,
  country         text,
  business_type   text,
  would_pay       boolean,
  comment         text,
  created_at      timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table reports     enable row level security;
alter table waitlist    enable row level security;
alter table feedback    enable row level security;
alter table daily_usage enable row level security;

-- Public can read reports (needed for /report/[id] page)
create policy "reports_public_read" on reports
  for select using (true);

-- Service role can do everything (used by API routes)
create policy "reports_service_insert" on reports
  for insert with check (true);

create policy "waitlist_insert" on waitlist
  for insert with check (true);

create policy "feedback_insert" on feedback
  for insert with check (true);

create policy "daily_usage_read" on daily_usage
  for select using (true);

create policy "daily_usage_service" on daily_usage
  for all using (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists reports_usage_date_idx on reports(usage_date);
create index if not exists daily_usage_date_idx on daily_usage(usage_date);
create index if not exists waitlist_email_idx on waitlist(email);

-- ─── Phase 2 additions ────────────────────────────────────────────────────────
-- Run these ALTER statements if upgrading from Phase 1:

alter table reports add column if not exists business_model_type text default 'physical';
alter table reports add column if not exists lat double precision;
alter table reports add column if not exists lng double precision;
alter table reports add column if not exists target_market text;
alter table reports add column if not exists ad_budget_monthly text;
alter table reports add column if not exists delivery_coverage text;
alter table reports add column if not exists target_age_group text;
