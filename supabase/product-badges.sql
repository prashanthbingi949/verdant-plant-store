-- Run once in Supabase SQL Editor.
-- Adds an optional badge/label per product.

alter table public.products
  add column if not exists badge_text text not null default '';
