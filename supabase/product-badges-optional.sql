-- Verdant optional product badges
-- Run once in Supabase SQL Editor if you want to remove any badges
-- previously applied globally by product-badges.sql.

update public.products
set badge_text = '',
    updated_at = now()
where coalesce(trim(badge_text), '') <> '';

-- From this point onward, the admin Products screen can set badge_text
-- per product. Leave it blank to hide the badge completely.
