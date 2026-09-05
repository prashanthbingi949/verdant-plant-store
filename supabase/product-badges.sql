-- Run once in Supabase SQL Editor.
-- Adds an optional badge/label per product.

alter table public.products
  add column if not exists badge_text text not null default '';

-- Preserve the current storefront appearance for existing products.
-- New products start with no badge until the client adds one.
update public.products
set badge_text = 'Best Seller'
where coalesce(trim(badge_text), '') = '';
