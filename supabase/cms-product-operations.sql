-- Verdant CMS product operations + inventory audit layer
-- Run once in the Supabase SQL Editor after products.sql / cms.sql.
-- Safe to run more than once.

create table if not exists public.inventory_settings (
  product_slug text primary key references public.products(slug) on delete cascade,
  reorder_level integer not null default 5 check (reorder_level >= 0),
  reorder_quantity integer not null default 10 check (reorder_quantity >= 1),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_slug text not null references public.products(slug) on delete cascade,
  quantity_delta integer not null,
  stock_after integer not null check (stock_after >= 0),
  reason text not null default 'manual_adjustment',
  note text not null default '',
  actor text not null default 'admin'
);

create index if not exists inventory_movements_product_idx
  on public.inventory_movements(product_slug, created_at desc);

create index if not exists inventory_movements_created_idx
  on public.inventory_movements(created_at desc);

alter table public.inventory_settings enable row level security;
alter table public.inventory_movements enable row level security;
revoke all on public.inventory_settings from anon, authenticated, public;
revoke all on public.inventory_movements from anon, authenticated, public;

create or replace function public.set_inventory_settings(
  p_slug text,
  p_reorder_level integer,
  p_reorder_quantity integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.inventory_settings%rowtype;
begin
  if p_slug is null or p_slug = '' then
    raise exception 'Product slug is required';
  end if;
  if p_reorder_level is null or p_reorder_level < 0 then
    raise exception 'Reorder level must be zero or greater';
  end if;
  if p_reorder_quantity is null or p_reorder_quantity < 1 then
    raise exception 'Reorder quantity must be at least 1';
  end if;

  if not exists (select 1 from public.products where slug = p_slug) then
    raise exception 'Product not found';
  end if;

  insert into public.inventory_settings(product_slug, reorder_level, reorder_quantity, updated_at)
  values (p_slug, p_reorder_level, p_reorder_quantity, now())
  on conflict (product_slug) do update
    set reorder_level = excluded.reorder_level,
        reorder_quantity = excluded.reorder_quantity,
        updated_at = now()
  returning * into result;

  return to_jsonb(result);
end;
$$;

create or replace function public.adjust_product_stock(
  p_slug text,
  p_delta integer,
  p_reason text default 'manual_adjustment',
  p_note text default '',
  p_actor text default 'admin'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
  next_stock integer;
  product_row public.products%rowtype;
  movement public.inventory_movements%rowtype;
begin
  if p_slug is null or p_slug = '' then
    raise exception 'Product slug is required';
  end if;
  if p_delta is null or p_delta = 0 then
    raise exception 'Stock adjustment cannot be zero';
  end if;

  select * into product_row
  from public.products
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  current_stock := product_row.stock;
  next_stock := current_stock + p_delta;
  if next_stock < 0 then
    raise exception 'Stock cannot go below zero';
  end if;

  update public.products
  set stock = next_stock,
      updated_at = now()
  where slug = p_slug;

  insert into public.inventory_movements(product_slug, quantity_delta, stock_after, reason, note, actor)
  values (
    p_slug,
    p_delta,
    next_stock,
    coalesce(nullif(trim(p_reason), ''), 'manual_adjustment'),
    coalesce(trim(p_note), ''),
    coalesce(nullif(trim(p_actor), ''), 'admin')
  )
  returning * into movement;

  return jsonb_build_object(
    'product', (select to_jsonb(p) from public.products p where p.slug = p_slug),
    'movement', to_jsonb(movement)
  );
end;
$$;

revoke all on function public.set_inventory_settings(text, integer, integer) from public;
revoke all on function public.adjust_product_stock(text, integer, text, text, text) from public;
grant execute on function public.set_inventory_settings(text, integer, integer) to service_role;
grant execute on function public.adjust_product_stock(text, integer, text, text, text) to service_role;

-- Seed sensible defaults for existing products without overwriting editor choices.
insert into public.inventory_settings(product_slug)
select slug from public.products
on conflict (product_slug) do nothing;
