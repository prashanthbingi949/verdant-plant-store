-- Atomic stock decrement for paid orders.
-- Run this once in the Supabase SQL Editor.

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
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Invalid order items';
  end if;

  -- Lock/update products in a deterministic order to reduce deadlock risk.
  for item in
    select value
    from jsonb_array_elements(p_items)
    order by value->>'id'
  loop
    slug := item->>'id';
    quantity := (item->>'quantity')::integer;

    if slug is null or slug = '' or quantity is null or quantity < 1 or quantity > 20 then
      raise exception 'Invalid order item';
    end if;

    update products
    set stock = stock - quantity,
        updated_at = now()
    where products.slug = decrement_order_stock.slug
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

-- Atomically finalize a verified Razorpay payment.
-- The order row is locked so duplicate payment callbacks cannot decrement stock twice.
create or replace function public.finalize_paid_order(
  p_order_id text,
  p_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order public.orders%rowtype;
begin
  select *
  into existing_order
  from public.orders
  where order_id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if existing_order.payment_status = 'paid' then
    if existing_order.payment_id = p_payment_id then
      return jsonb_build_object('status', 'already_processed');
    end if;
    return jsonb_build_object('status', 'payment_mismatch');
  end if;

  if existing_order.payment_status <> 'created' then
    return jsonb_build_object('status', 'invalid_state');
  end if;

  begin
    perform public.decrement_order_stock(existing_order.items);
  exception when others then
    return jsonb_build_object('status', 'inventory_issue');
  end;

  update public.orders
  set payment_id = p_payment_id,
      payment_status = 'paid',
      order_status = 'paid'
  where id = existing_order.id;

  return jsonb_build_object('status', 'processed');
end;
$$;

revoke all on function public.finalize_paid_order(text, text) from public;
grant execute on function public.finalize_paid_order(text, text) to service_role;
