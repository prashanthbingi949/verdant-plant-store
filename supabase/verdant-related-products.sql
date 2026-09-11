-- Verdant related-product catalogue expansion
-- Run this once in the Supabase SQL Editor after catalog-seed.sql and product-images.sql.
-- Creates TWO products for every existing catalog subcategory (76 products total).
-- Product images use transparent SVG cutouts stored in /public/product-assets/.

with seed(category_slug, subcategory_slug, name_a, name_b, level, tone, asset_path, description) as (
  values
    ('indoor-decorative-greens','money-plants','Golden Money Plant','Marble Queen Money Plant','Easy care','moss','/product-assets/indoor-decorative-greens.svg','Easy-going trailing greens for desks, shelves and bright corners.'),
    ('indoor-decorative-greens','snake-plants','Snake Plant Laurentii','Snake Plant Moonshine','Easy care','sage','/product-assets/indoor-decorative-greens.svg','Architectural indoor plants with a clean, upright silhouette.'),
    ('indoor-decorative-greens','peace-lilies','Peace Lily Classic','Peace Lily Sensation','Medium','moss','/product-assets/indoor-decorative-greens.svg','Calm, leafy indoor favourites for soft filtered light.'),
    ('indoor-decorative-greens','zz-plants','ZZ Plant Raven','ZZ Plant Green','Easy care','sage','/product-assets/indoor-decorative-greens.svg','Glossy, resilient foliage that stays beautiful with little fuss.'),
    ('indoor-decorative-greens','monsteras','Monstera Deliciosa','Monstera Adansonii','Medium','moss','/product-assets/indoor-decorative-greens.svg','Tropical statement foliage for rooms that need a little drama.'),
    ('outdoor-landscape-plants','flowering-shrubs','Bougainvillea Pink','Ixora Red','Medium','moss','/product-assets/outdoor-landscape-plants.svg','Colourful flowering shrubs made for sunny outdoor spaces.'),
    ('outdoor-landscape-plants','ornamental-hedges','Areca Palm Hedge','Duranta Green Hedge','Medium','sage','/product-assets/outdoor-landscape-plants.svg','Useful garden greens for borders, screens and landscape structure.'),
    ('outdoor-landscape-plants','large-trees','Frangipani Tree','Polyalthia Tree','Medium','moss','/product-assets/outdoor-landscape-plants.svg','Long-lived landscape choices for larger outdoor spaces.'),
    ('succulents-cacti','aloe-vera','Aloe Vera Premium','Aloe Vera Compact','Easy care','lime','/product-assets/succulents-cacti.svg','Sun-loving succulents with sculptural form and simple care.'),
    ('succulents-cacti','tabletop-succulents','Haworthia Zebra','Echeveria Rosette','Easy care','sage','/product-assets/succulents-cacti.svg','Compact tabletop succulents for sunny desks and shelves.'),
    ('succulents-cacti','cacti','Golden Barrel Cactus','Bunny Ears Cactus','Easy care','lime','/product-assets/succulents-cacti.svg','Distinctive cacti for bright, dry corners and collectors.'),
    ('fruit-vegetable-saplings','fruit-trees','Lemon Tree Sapling','Guava Tree Sapling','Medium','sage','/product-assets/fruit-vegetable-saplings.svg','Young edible trees ready for patios, gardens and sunny balconies.'),
    ('fruit-vegetable-saplings','vegetable-saplings','Tomato Sapling','Chilli Sapling','Easy care','sage','/product-assets/fruit-vegetable-saplings.svg','Starter vegetable plants for homegrown harvests.'),
    ('fruit-vegetable-saplings','culinary-herbs','Basil Plant','Mint Plant','Easy care','lime','/product-assets/fruit-vegetable-saplings.svg','Fresh culinary herbs for kitchen windows and sunny ledges.'),
    ('seasonal-flowering-plants','annuals','Petunia Mix','Marigold Orange','Easy care','lime','/product-assets/seasonal-flowering-plants.svg','Bright seasonal colour for containers, balconies and borders.'),
    ('seasonal-flowering-plants','perennials','Geranium Pink','Chrysanthemum White','Medium','moss','/product-assets/seasonal-flowering-plants.svg','Reliable bloomers that bring colour back season after season.'),
    ('seasonal-flowering-plants','seasonal-bloomers','Dahlia Bloom','Calendula Gold','Medium','lime','/product-assets/seasonal-flowering-plants.svg','Cheerful seasonal favourites for a garden that keeps changing.'),
    ('pots-planters','plastic-pots','Matte Plastic Pot','Self-Watering Plastic Pot','Easy','sage','/product-assets/pots-planters.svg','Lightweight everyday planters in practical sizes.'),
    ('pots-planters','terracotta','Classic Terracotta Pot','Terracotta Bowl','Easy','moss','/product-assets/pots-planters.svg','Warm, breathable terracotta for timeless plant styling.'),
    ('pots-planters','ceramic','Ivory Ceramic Pot','Speckled Ceramic Planter','Easy','sage','/product-assets/pots-planters.svg','Refined ceramic planters for polished indoor spaces.'),
    ('pots-planters','fabric-grow-bags','Fabric Grow Bag 12L','Fabric Grow Bag 20L','Easy','moss','/product-assets/pots-planters.svg','Flexible grow bags for herbs, vegetables and compact crops.'),
    ('soil-growing-media','potting-mix','Premium Potting Mix','Indoor Potting Mix','Easy','moss','/product-assets/soil-growing-media.svg','Balanced growing media for healthy roots and everyday potting.'),
    ('soil-growing-media','cocopeat','Cocopeat Block','Fine Cocopeat','Easy','sage','/product-assets/soil-growing-media.svg','Lightweight moisture-holding media for propagation and potting.'),
    ('soil-growing-media','red-soil','Red Soil 5kg','Red Soil 10kg','Easy','moss','/product-assets/soil-growing-media.svg','Dense garden soil for outdoor planting and landscape beds.'),
    ('soil-growing-media','compost','Garden Compost','Leaf Compost','Easy','sage','/product-assets/soil-growing-media.svg','Naturally rich organic matter for stronger, healthier soil.'),
    ('fertilizers-nutrients','organic-manure','Organic Cow Manure','Neem Cake Granules','Easy','moss','/product-assets/fertilizers-nutrients.svg','Organic nourishment for steady, natural plant growth.'),
    ('fertilizers-nutrients','vermicompost','Premium Vermicompost','Earthworm Castings','Easy','lime','/product-assets/fertilizers-nutrients.svg','Nutrient-rich compost to support active roots and leafy growth.'),
    ('fertilizers-nutrients','liquid-plant-food','Seaweed Liquid Feed','Balanced Liquid Plant Food','Easy','sage','/product-assets/fertilizers-nutrients.svg','Easy-to-apply liquid feed for routine plant care.'),
    ('fertilizers-nutrients','slow-release-pellets','Slow-Release Green Pellets','Flowering Plant Pellets','Easy','lime','/product-assets/fertilizers-nutrients.svg','Measured feeding support for longer-lasting plant nutrition.'),
    ('pest-control','neem-oil','Cold-Pressed Neem Oil','Neem Oil Concentrate','Easy','sage','/product-assets/pest-control.svg','Plant-care essentials for routine pest-management support.'),
    ('pest-control','pesticides','Garden Insect Shield','Plant-safe Insect Control','Medium','moss','/product-assets/pest-control.svg','Targeted garden-care options for common insect pressure.'),
    ('pest-control','fungicides','Copper Fungicide','Bio Fungicide','Medium','lime','/product-assets/pest-control.svg','Plant-health care options for common fungal concerns.'),
    ('tools-equipment','watering-cans','Long-Spout Watering Can','Compact Watering Can','Easy','moss','/product-assets/tools-equipment.svg','Thoughtful watering tools for seedlings, pots and patio plants.'),
    ('tools-equipment','hand-trowels','Steel Hand Trowel','Ergonomic Hand Trowel','Easy','sage','/product-assets/tools-equipment.svg','Everyday planting tools for potting, transplanting and soil work.'),
    ('tools-equipment','pruners','Bypass Pruner','Precision Plant Pruner','Easy','moss','/product-assets/tools-equipment.svg','Clean, comfortable cutting tools for routine plant shaping.'),
    ('tools-equipment','spray-bottles','Fine Mist Sprayer','Garden Spray Bottle','Easy','lime','/product-assets/tools-equipment.svg','Fine-mist tools for foliage care, propagation and cleaning.'),
    ('tools-equipment','plant-stakes','Bamboo Plant Stakes','Support Stake Set','Easy','sage','/product-assets/tools-equipment.svg','Simple supports to keep climbing and top-heavy plants tidy.'),
    ('tools-equipment','trellises','Climbing Plant Trellis','Fan Trellis','Easy','moss','/product-assets/tools-equipment.svg','Support structures for climbers, vines and decorative training.')
),
expanded as (
  select s.*, v.name, v.ordinal
  from seed s
  cross join lateral unnest(array[s.name_a, s.name_b]) with ordinality as v(name, ordinal)
),
resolved as (
  select e.*, c.name as category_name, c.product_type,
         sc.sort_order as sub_sort
  from expanded e
  join public.catalog_categories c on c.slug = e.category_slug
  join public.catalog_subcategories sc on sc.category_id = c.id and sc.slug = e.subcategory_slug
)
insert into public.products (
  slug, name, product_type, category, subcategory, level, price, size, description,
  details, tone, stock, active, featured, sort_order, badge_text, image_url, image_urls
)
select
  regexp_replace(lower(replace(r.name, ' ', '-')), '[^a-z0-9-]+', '', 'g') as slug,
  r.name,
  r.product_type,
  r.category_name,
  r.subcategory_slug,
  r.level,
  (399 + mod(abs(hashtext(r.name)), 2200))::integer as price,
  case when r.product_type = 'Plants' then '6" pot' else '1 pack' end as size,
  r.description,
  '[]'::jsonb,
  r.tone,
  20,
  true,
  false,
  (case when r.product_type = 'Plants' then 10000 else 20000 end) + (r.sub_sort * 10) + r.ordinal,
  '',
  r.asset_path,
  jsonb_build_array(r.asset_path)
from resolved r
on conflict (slug) do update set
  product_type = excluded.product_type,
  category = excluded.category,
  subcategory = excluded.subcategory,
  level = excluded.level,
  price = excluded.price,
  size = excluded.size,
  description = excluded.description,
  tone = excluded.tone,
  active = true,
  image_url = excluded.image_url,
  image_urls = excluded.image_urls,
  updated_at = now();

update public.products set product_type='Plants', subcategory='monsteras', image_url='/product-assets/indoor-decorative-greens.svg', image_urls='["/product-assets/indoor-decorative-greens.svg"]'::jsonb where slug='monstera-deliciosa';
update public.products set product_type='Plants', subcategory='snake-plants', image_url='/product-assets/indoor-decorative-greens.svg', image_urls='["/product-assets/indoor-decorative-greens.svg"]'::jsonb where slug='snake-plant';
update public.products set product_type='Plants', subcategory='aloe-vera', image_url='/product-assets/succulents-cacti.svg', image_urls='["/product-assets/succulents-cacti.svg"]'::jsonb where slug='aloe-vera';
update public.products set product_type='Plants', subcategory='tabletop-succulents', image_url='/product-assets/succulents-cacti.svg', image_urls='["/product-assets/succulents-cacti.svg"]'::jsonb where slug='jade-plant';
update public.products set product_type='Plants', subcategory='monsteras', image_url='/product-assets/indoor-decorative-greens.svg', image_urls='["/product-assets/indoor-decorative-greens.svg"]'::jsonb where slug='fiddle-leaf-fig';
update public.products set product_type='Plants', subcategory='seasonal-bloomers', image_url='/product-assets/seasonal-flowering-plants.svg', image_urls='["/product-assets/seasonal-flowering-plants.svg"]'::jsonb where slug='lavender';
update public.products set product_type='Plants', subcategory='monsteras', image_url='/product-assets/indoor-decorative-greens.svg', image_urls='["/product-assets/indoor-decorative-greens.svg"]'::jsonb where slug='bird-of-paradise';
update public.products set product_type='Plants', subcategory='tabletop-succulents', image_url='/product-assets/succulents-cacti.svg', image_urls='["/product-assets/succulents-cacti.svg"]'::jsonb where slug='string-of-pearls';
