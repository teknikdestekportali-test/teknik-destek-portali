-- =========================================================
-- Tamirat Talep Portali - Supabase Schema
-- Supabase Dashboard > SQL Editor'e kopyalayip calistirin
-- =========================================================

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  ref_number text unique not null,
  customer_company text not null,
  customer_name text not null,
  customer_email text not null,
  service_type text not null,
  description text not null,
  priority text not null default 'routine' check (priority in ('routine', 'aog')),
  status text not null default 'pending' check (status in (
    'pending', 'reviewing', 'info_requested', 'rejected',
    'quoted', 'accepted', 'rejected_by_customer', 'work_order'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique references requests(id) on delete cascade,
  action text not null check (action in ('rejected', 'info_requested', 'quoted')),
  rejection_reason text,
  info_request_text text,
  man_hours numeric,
  tat_days integer,
  price numeric,
  created_at timestamptz default now()
);

create table if not exists customer_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  response_text text not null,
  created_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_requests_created_at on requests(created_at desc);
create index if not exists idx_evaluations_request_id on evaluations(request_id);
create index if not exists idx_responses_request_id on customer_responses(request_id);

-- Row Level Security: servis key bypass eder, demo icin RLS kapali
alter table requests disable row level security;
alter table evaluations disable row level security;
alter table customer_responses disable row level security;
