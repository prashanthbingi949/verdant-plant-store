create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  category text not null,
  level text not null default 'Easy',
  price integer not null check (price >= 0),
  size text not null default '6" pot',
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  tone text not null default 'moss',
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  constraint products_tone_check check (tone in ('moss','sage','lime'))
);

alter table public.products enable row level security;

insert into public.products (slug, name, category, level, price, size, description, details, tone, stock, active)
values
('monstera-deliciosa', 'Monstera Deliciosa', 'Indoor plants', 'Easy care', 1899, '12" pot', 'A lush statement plant with generous split leaves. Monstera brings a calm tropical character to bright living spaces and grows beautifully with a little patience.', '[["Light","Bright, indirect light"],["Water","When the top 2–3 cm of soil dries"],["Humidity","Medium to high"],["Pet note","Keep away from curious pets"]]'::jsonb, 'moss', 20, true),
('snake-plant', 'Snake Plant', 'Indoor plants', 'Easy care', 899, '10" pot', 'Architectural, resilient and comfortable in lower light. A dependable first plant with a clean silhouette that works almost anywhere.', '[["Light","Low to bright indirect light"],["Water","Let soil dry between waterings"],["Humidity","Low to medium"],["Pet note","Keep away from pets"]]'::jsonb, 'sage', 20, true),
('jade-plant', 'Jade Plant', 'Succulents', 'Easy care', 649, '6" pot', 'A compact succulent with glossy leaves and a naturally sculptural form. Made for sunny desks, shelves and windowsills.', '[["Light","Bright light with gentle sun"],["Water","Allow soil to dry fully"],["Humidity","Low"],["Pet note","Keep away from pets"]]'::jsonb, 'lime', 20, true),
('bird-of-paradise', 'Bird of Paradise', 'Indoor plants', 'Medium care', 2499, '14" pot', 'Bold tropical foliage for a room that needs presence. Give it bright filtered light and space to stretch.', '[["Light","Bright, filtered light"],["Water","Water when top 3–4 cm dries"],["Humidity","Medium to high"],["Pet note","Keep away from pets"]]'::jsonb, 'moss', 20, true),
('string-of-pearls', 'String of Pearls', 'Succulents', 'Medium care', 1199, '6" hanging pot', 'Trailing bead-like foliage that softens shelves and hanging spaces while staying beautifully sculptural.', '[["Light","Bright indirect light"],["Water","Allow soil to dry between waterings"],["Humidity","Low"],["Pet note","Keep away from pets"]]'::jsonb, 'sage', 20, true),
('lavender', 'Lavender', 'Outdoor plants', 'Medium care', 799, '8" pot', 'Fragrant flowering stems made for bright balconies, terraces and sunny garden corners.', '[["Light","Full sun to bright light"],["Water","Water when the soil surface dries"],["Humidity","Low"],["Pet note","Use ordinary pet-safe placement"]]'::jsonb, 'lime', 20, true),
('fiddle-leaf-fig', 'Fiddle Leaf Fig', 'Indoor plants', 'Medium care', 2199, '12" pot', 'Large fiddle-shaped leaves and a polished silhouette for spaces that call for one confident green statement.', '[["Light","Bright indirect light"],["Water","Let the top layer dry before watering"],["Humidity","Medium"],["Pet note","Keep away from pets"]]'::jsonb, 'moss', 20, true),
('aloe-vera', 'Aloe Vera', 'Succulents', 'Easy care', 699, '6" pot', 'A sunny, low-maintenance classic with fleshy leaves and a clean shape for desks, shelves and windowsills.', '[["Light","Bright light, some gentle sun"],["Water","Allow soil to dry fully"],["Humidity","Low"],["Pet note","Keep away from pets"]]'::jsonb, 'sage', 20, true)
on conflict (slug) do nothing;
