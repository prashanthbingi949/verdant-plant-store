-- Verdant catalog starter structure
-- Run this after supabase/cms.sql.

insert into public.catalog_categories (product_type, name, slug, description, sort_order)
values
('Plants', 'Indoor & Decorative Greens', 'indoor-decorative-greens', 'Houseplants and decorative foliage for rooms, desks and living spaces.', 10),
('Plants', 'Outdoor & Landscape Plants', 'outdoor-landscape-plants', 'Flowering shrubs, hedges and larger plants for gardens and landscapes.', 20),
('Plants', 'Succulents & Cacti', 'succulents-cacti', 'Low-maintenance succulents and cacti for sunny corners and tabletops.', 30),
('Plants', 'Fruit & Vegetable Saplings', 'fruit-vegetable-saplings', 'Young edible plants, fruit trees and seasonal culinary herbs.', 40),
('Plants', 'Seasonal & Flowering Plants', 'seasonal-flowering-plants', 'Annuals, perennials and seasonal bloomers.', 50),
('Gardening Supplies', 'Pots & Planters', 'pots-planters', 'Plastic, terracotta, ceramic and fabric planters in useful sizes.', 10),
('Gardening Supplies', 'Soil & Growing Media', 'soil-growing-media', 'Potting mixes, cocopeat, red soil and compost.', 20),
('Gardening Supplies', 'Fertilizers & Nutrients', 'fertilizers-nutrients', 'Organic manure, vermicompost, liquid feed and slow-release nutrients.', 30),
('Gardening Supplies', 'Pest Control', 'pest-control', 'Neem oil, pesticides and fungicides for plant health.', 40),
('Gardening Supplies', 'Tools & Equipment', 'tools-equipment', 'Watering cans, trowels, pruners, sprayers, stakes and trellises.', 50)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  product_type = excluded.product_type,
  sort_order = excluded.sort_order,
  updated_at = now();

with mapping(category_slug, sub_name, sub_slug, sort_order) as (
  values
    ('indoor-decorative-greens','Money Plants','money-plants',10),
    ('indoor-decorative-greens','Snake Plants','snake-plants',20),
    ('indoor-decorative-greens','Peace Lilies','peace-lilies',30),
    ('indoor-decorative-greens','ZZ Plants','zz-plants',40),
    ('indoor-decorative-greens','Monsteras','monsteras',50),
    ('outdoor-landscape-plants','Flowering Shrubs','flowering-shrubs',10),
    ('outdoor-landscape-plants','Ornamental Hedges','ornamental-hedges',20),
    ('outdoor-landscape-plants','Large Trees','large-trees',30),
    ('succulents-cacti','Aloe Vera','aloe-vera',10),
    ('succulents-cacti','Tabletop Succulents','tabletop-succulents',20),
    ('succulents-cacti','Cacti','cacti',30),
    ('fruit-vegetable-saplings','Fruit Trees','fruit-trees',10),
    ('fruit-vegetable-saplings','Vegetable Saplings','vegetable-saplings',20),
    ('fruit-vegetable-saplings','Culinary Herbs','culinary-herbs',30),
    ('seasonal-flowering-plants','Annuals','annuals',10),
    ('seasonal-flowering-plants','Perennials','perennials',20),
    ('seasonal-flowering-plants','Seasonal Bloomers','seasonal-bloomers',30),
    ('pots-planters','Plastic Pots','plastic-pots',10),
    ('pots-planters','Terracotta','terracotta',20),
    ('pots-planters','Ceramic','ceramic',30),
    ('pots-planters','Fabric Grow Bags','fabric-grow-bags',40),
    ('soil-growing-media','Potting Mix','potting-mix',10),
    ('soil-growing-media','Cocopeat','cocopeat',20),
    ('soil-growing-media','Red Soil','red-soil',30),
    ('soil-growing-media','Compost','compost',40),
    ('fertilizers-nutrients','Organic Manure','organic-manure',10),
    ('fertilizers-nutrients','Vermicompost','vermicompost',20),
    ('fertilizers-nutrients','Liquid Plant Food','liquid-plant-food',30),
    ('fertilizers-nutrients','Slow-release Pellets','slow-release-pellets',40),
    ('pest-control','Neem Oil','neem-oil',10),
    ('pest-control','Pesticides','pesticides',20),
    ('pest-control','Fungicides','fungicides',30),
    ('tools-equipment','Watering Cans','watering-cans',10),
    ('tools-equipment','Hand Trowels','hand-trowels',20),
    ('tools-equipment','Pruners','pruners',30),
    ('tools-equipment','Spray Bottles','spray-bottles',40),
    ('tools-equipment','Plant Stakes','plant-stakes',50),
    ('tools-equipment','Trellises','trellises',60)
)
insert into public.catalog_subcategories (category_id, name, slug, sort_order)
select c.id, m.sub_name, m.sub_slug, m.sort_order
from mapping m
join public.catalog_categories c on c.slug = m.category_slug
on conflict (category_id, slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  updated_at = now();
