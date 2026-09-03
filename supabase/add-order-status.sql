-- Run this once in the Supabase SQL Editor.
-- Keeps payment_status separate from the fulfilment lifecycle.

alter table public.orders add column if not exists order_status text;

update public.orders
set order_status = case
  when payment_status = 'paid' then 'paid'
  else 'awaiting_payment'
end
where order_status is null;

alter table public.orders
  alter column order_status set default 'awaiting_payment';

alter table public.orders
  alter column order_status set not null;

alter table public.orders
  drop constraint if exists orders_order_status_check;

alter table public.orders
  add constraint orders_order_status_check
  check (order_status in ('awaiting_payment', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'));
