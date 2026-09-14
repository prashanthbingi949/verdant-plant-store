-- Verdant Product Master CMS
-- Run once in Supabase SQL Editor after products.sql / cms.sql / product-images.sql.
-- Safe to run more than once.

alter table public.products
  add column if not exists sku text not null default '',
  add column if not exists compare_at_price numeric(12,2),
  add column if not exists cost_price numeric(12,2),
  add column if not exists tax_rate numeric(6,2) not null default 0,
  add column if not exists tax_code text not null default '',
  add column if not exists short_description text not null default '',
  add column if not exists personality_line text not null default '',
  add column if not exists image_alt_text text not null default '',
  add column if not exists image_alt_texts jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists canonical_slug text not null default '',
  add column if not exists related_product_slugs jsonb not null default '[]'::jsonb,
  add column if not exists complete_corner_slugs jsonb not null default '[]'::jsonb,
  add column if not exists publish_status text not null default 'published',
  add column if not exists preview_enabled boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Keep a stable default SKU for existing records until the client replaces it with a real SKU.
update public.products
set sku = upper(regexp_replace(slug, '[^a-zA-Z0-9]+', '-', 'g'))
where coalesce(trim(sku), '') = '';

update public.products
set canonical_slug = slug
where coalesce(trim(canonical_slug), '') = '';

alter table public.products
  drop constraint if exists products_publish_status_check;

alter table public.products
  add constraint products_publish_status_check
  check (publish_status in ('published','draft','archived'));

create unique index if not exists products_sku_unique_idx
  on public.products(sku)
  where sku <> '';

create index if not exists products_publish_status_idx
  on public.products(publish_status);

create index if not exists products_canonical_slug_idx
  on public.products(canonical_slug);

comment on column public.products.cost_price is 'Internal cost used for margin calculation; never displayed to shoppers.';
comment on column public.products.compare_at_price is 'Optional original/reference price shown against the selling price.';
comment on column public.products.tax_rate is 'GST/tax rate percentage for this SKU.';
comment on column public.products.tax_code is 'Optional HSN/GST or internal tax classification code.';
comment on column public.products.related_product_slugs is 'Curated product detail recommendations, ordered by merchandising priority.';
comment on column public.products.complete_corner_slugs is 'Curated cart/complement recommendations, ordered by merchandising priority.';
comment on column public.products.preview_enabled is 'Allows editorial preview behavior in the admin workflow; does not make a draft publicly sellable.';
