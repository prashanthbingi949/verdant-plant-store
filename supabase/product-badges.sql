-- Verdant product merchandising fields
-- Run once in the Supabase SQL Editor. Safe to run more than once.

-- Per-product badge shown on product cards, e.g. Best Seller / New / Limited.
alter table public.products
  add column if not exists badge_text text not null default '';

-- Explicit Most Loved merchandising flag.
-- This is kept idempotent for databases that already received cms.sql.
alter table public.products
  add column if not exists featured boolean not null default false;

-- Preserve the current storefront appearance for existing products that have
-- never been given an individual badge. New products remain badge-free.
update public.products
set badge_text = 'Best Seller'
where coalesce(trim(badge_text), '') = '';

create index if not exists products_featured_sort_idx
  on public.products(featured, active, sort_order, created_at);
