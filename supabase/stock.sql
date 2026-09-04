-- Atomic stock decrement for paid orders.
-- Run this once in Supabase SQL Editor.

create or replace function public.decrement_product_stock(p_slug text, p_quantity integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update products
  set stock = stock - p_quantity,
      updated_at = now()
  where slug = p_slug
    and active = true
    and p_quantity > 0
    and stock >= p_quantity
  returning stock;
$$;

revoke all on function public.decrement_product_stock(text, integer) from public;
grant execute on function public.decrement_product_stock(text, integer) to service_role;
