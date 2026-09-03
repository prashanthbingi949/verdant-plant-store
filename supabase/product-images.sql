alter table public.products
  add column if not exists image_url text;

alter table public.products
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
