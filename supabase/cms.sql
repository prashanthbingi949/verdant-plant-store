-- Verdant CMS foundation
-- Run once in Supabase SQL Editor.
-- This adds client-editable catalog structure and site content tables.

-- 1) Expand products so every item can be managed by type/category/sub-category.
alter table public.products
  add column if not exists product_type text not null default 'Plants',
  add column if not exists subcategory text not null default '',
  add column if not exists featured boolean not null default false,
  add column if not exists sort_order integer not null default 0;

-- Keep the product type intentionally broad so the client can sell plants and supplies.
alter table public.products
  drop constraint if exists products_product_type_check;

alter table public.products
  add constraint products_product_type_check
  check (product_type in ('Plants', 'Gardening Supplies'));

-- 2) Client-managed shop categories and sub-categories.
create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product_type text not null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  constraint catalog_categories_type_check check (product_type in ('Plants', 'Gardening Supplies'))
);

create table if not exists public.catalog_subcategories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category_id uuid not null references public.catalog_categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  unique(category_id, slug)
);

create index if not exists catalog_categories_type_idx
  on public.catalog_categories(product_type, active, sort_order);

create index if not exists catalog_subcategories_category_idx
  on public.catalog_subcategories(category_id, active, sort_order);

-- 3) Global site settings: brand copy, contact details, social links, etc.
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  site_key text not null unique,
  value jsonb not null default '{}'::jsonb
);

-- 4) Navigation managed by the client.
create table if not exists public.site_navigation (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  label text not null,
  href text not null,
  location text not null default 'header',
  active boolean not null default true,
  sort_order integer not null default 0
);

create index if not exists site_navigation_location_idx
  on public.site_navigation(location, active, sort_order);

-- 5) Home-page content blocks. Each block stores editable content as JSON.
create table if not exists public.home_content (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  section_key text not null unique,
  content jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0
);

-- 6) Editable editorial/journal pages.
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content jsonb not null default '[]'::jsonb,
  hero_image_url text,
  status text not null default 'draft',
  published_at timestamptz,
  sort_order integer not null default 0,
  constraint cms_pages_status_check check (status in ('draft', 'published'))
);

-- 7) Central media library metadata.
create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  url text not null,
  alt_text text not null default '',
  mime_type text not null default '',
  width integer,
  height integer,
  transparent_background boolean not null default false,
  kind text not null default 'image',
  active boolean not null default true
);

create index if not exists cms_media_kind_idx
  on public.cms_media(kind, active, created_at desc);

-- Secure these CMS tables from browser clients.
alter table public.catalog_categories enable row level security;
alter table public.catalog_subcategories enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_navigation enable row level security;
alter table public.home_content enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_media enable row level security;

revoke all on public.catalog_categories from anon, authenticated;
revoke all on public.catalog_subcategories from anon, authenticated;
revoke all on public.site_settings from anon, authenticated;
revoke all on public.site_navigation from anon, authenticated;
revoke all on public.home_content from anon, authenticated;
revoke all on public.cms_pages from anon, authenticated;
revoke all on public.cms_media from anon, authenticated;

revoke all on public.catalog_categories from public;
revoke all on public.catalog_subcategories from public;
revoke all on public.site_settings from public;
revoke all on public.site_navigation from public;
revoke all on public.home_content from public;
revoke all on public.cms_pages from public;
revoke all on public.cms_media from public;
