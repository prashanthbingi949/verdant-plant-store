-- Atomic stock decrement for paid orders.
-- Run this once in Supabase SQL Editor.

create or replace function public.decrement_order_stock(p_items jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  affected integer;
  slug text;
  quantity integer;
begin
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid order items';
  end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    slug := item->>'id';
    quantity := (item->>'quantity')::integer;

    if slug is null or slug = '' or quantity is null or quantity < 1 or quantity > 20 then
      raise exception 'Invalid order item';
    end if;

    update products
    set stock = stock - quantity,
        updated_at = now()
    where products.slug = slug
      and active = true
      and stock >= quantity;

    get diagnostics affected = row_count;
    if affected <> 1 then
      raise exception 'Insufficient stock for %', slug;
    end if;
  end loop;

  return true;
end;
$$;

revoke all on function public.decrement_order_stock(jsonb) from public;
grant execute on function public.decrement_order_stock(jsonb) to service_role;
