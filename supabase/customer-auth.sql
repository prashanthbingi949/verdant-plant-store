-- Customer account schema for Verdant.
-- Run once in Supabase SQL Editor.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists customer_sessions_token_hash_idx on public.customer_sessions(token_hash);
create index if not exists customer_sessions_customer_id_idx on public.customer_sessions(customer_id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);

alter table public.customers enable row level security;
alter table public.customer_sessions enable row level security;

revoke all on public.customers from anon, authenticated;
revoke all on public.customer_sessions from anon, authenticated;
revoke all on public.customers from public;
revoke all on public.customer_sessions from public;
