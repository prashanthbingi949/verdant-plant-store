-- Verdant customer password reset tokens.
-- Run once after customer-auth.sql.
-- Safe to run more than once.

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_customer_idx
  on public.password_reset_tokens(customer_id, created_at desc);

create index if not exists password_reset_tokens_expiry_idx
  on public.password_reset_tokens(expires_at);

alter table public.password_reset_tokens enable row level security;
revoke all on public.password_reset_tokens from anon, authenticated, public;
