-- ============================================================
-- VERDANT PHASE 0 — CATALOG CLEANUP
-- ============================================================
-- Safe storefront cleanup before Product Detail 2.0.
--
-- 1. Hides obvious development/test products from the storefront.
-- 2. Clears any legacy product badges so the CMS controls them.
-- 3. Re-applies the intended classification for the original demo
--    products where matching subcategories exist.
--
-- This migration is intentionally reversible: development products
-- are hidden (active=false), not deleted.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Hide obvious development/test products
-- ------------------------------------------------------------

UPDATE public.products
SET
  active = false,
  updated_at = now()
WHERE
  lower(trim(name)) IN ('test', 'test product', 'demo product')
  OR lower(trim(slug)) IN ('test', 'test-product', 'demo-product');


-- ------------------------------------------------------------
-- 2) Start merchandising badges blank
--    Admin can add Best Seller / New / Limited / etc.
-- ------------------------------------------------------------

UPDATE public.products
SET
  badge_text = '',
  updated_at = now()
WHERE COALESCE(TRIM(badge_text), '') <> '';


-- ------------------------------------------------------------
-- 3) Normalize original demo products
-- ------------------------------------------------------------

UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Indoor & Decorative Greens',
  subcategory = 'monsteras',
  updated_at = now()
WHERE slug = 'monstera-deliciosa';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Indoor & Decorative Greens',
  subcategory = 'snake-plants',
  updated_at = now()
WHERE slug = 'snake-plant';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Succulents & Cacti',
  subcategory = 'aloe-vera',
  updated_at = now()
WHERE slug = 'aloe-vera';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Succulents & Cacti',
  subcategory = 'tabletop-succulents',
  updated_at = now()
WHERE slug = 'jade-plant';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Indoor & Decorative Greens',
  subcategory = 'monsteras',
  updated_at = now()
WHERE slug = 'fiddle-leaf-fig';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Seasonal & Flowering Plants',
  subcategory = 'seasonal-bloomers',
  updated_at = now()
WHERE slug = 'lavender';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Indoor & Decorative Greens',
  subcategory = 'monsteras',
  updated_at = now()
WHERE slug = 'bird-of-paradise';


UPDATE public.products
SET
  product_type = 'Plants',
  category = 'Succulents & Cacti',
  subcategory = 'tabletop-succulents',
  updated_at = now()
WHERE slug = 'string-of-pearls';


-- ------------------------------------------------------------
-- 4) Verification
-- ------------------------------------------------------------

SELECT
  COUNT(*) FILTER (WHERE active = true) AS active_products,
  COUNT(*) FILTER (WHERE active = false) AS hidden_products,
  COUNT(*) FILTER (WHERE COALESCE(TRIM(badge_text), '') <> '') AS products_with_badges
FROM public.products;
