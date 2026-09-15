import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

type Category = {
  id: string;
  name: string;
  slug: string;
  product_type: "Plants" | "Gardening Supplies";
  description: string;
  sort_order: number;
  active: boolean;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
};

const FALLBACK_CATEGORIES: Category[] = [
  { id: "fallback-indoor", name: "Indoor & Decorative Greens", slug: "indoor-decorative-greens", product_type: "Plants", description: "Houseplants and decorative foliage for rooms, desks and living spaces.", sort_order: 10, active: true },
  { id: "fallback-outdoor", name: "Outdoor & Landscape Plants", slug: "outdoor-landscape-plants", product_type: "Plants", description: "Flowering shrubs, hedges and larger plants for gardens and landscapes.", sort_order: 20, active: true },
  { id: "fallback-succulents", name: "Succulents & Cacti", slug: "succulents-cacti", product_type: "Plants", description: "Low-maintenance succulents and cacti for sunny corners and tabletops.", sort_order: 30, active: true },
  { id: "fallback-fruit", name: "Fruit & Vegetable Saplings", slug: "fruit-vegetable-saplings", product_type: "Plants", description: "Young edible plants, fruit trees and seasonal culinary herbs.", sort_order: 40, active: true },
  { id: "fallback-flowering", name: "Seasonal & Flowering Plants", slug: "seasonal-flowering-plants", product_type: "Plants", description: "Annuals, perennials and seasonal bloomers.", sort_order: 50, active: true },
  { id: "fallback-pots", name: "Pots & Planters", slug: "pots-planters", product_type: "Gardening Supplies", description: "Plastic, terracotta, ceramic and fabric planters in useful sizes.", sort_order: 10, active: true },
  { id: "fallback-soil", name: "Soil & Growing Media", slug: "soil-growing-media", product_type: "Gardening Supplies", description: "Potting mixes, cocopeat, red soil and compost.", sort_order: 20, active: true },
  { id: "fallback-fertilizers", name: "Fertilizers & Nutrients", slug: "fertilizers-nutrients", product_type: "Gardening Supplies", description: "Organic manure, vermicompost, liquid feed and slow-release nutrients.", sort_order: 30, active: true },
  { id: "fallback-pest", name: "Pest Control", slug: "pest-control", product_type: "Gardening Supplies", description: "Neem oil, pesticides and fungicides for plant health.", sort_order: 40, active: true },
  { id: "fallback-tools", name: "Tools & Equipment", slug: "tools-equipment", product_type: "Gardening Supplies", description: "Watering cans, trowels, pruners, sprayers, stakes and trellises.", sort_order: 50, active: true },
];

const SUBCATEGORY_SEEDS: Array<[string, string, string, number]> = [
  ["indoor-decorative-greens", "Money Plants", "money-plants", 10], ["indoor-decorative-greens", "Snake Plants", "snake-plants", 20], ["indoor-decorative-greens", "Peace Lilies", "peace-lilies", 30], ["indoor-decorative-greens", "ZZ Plants", "zz-plants", 40], ["indoor-decorative-greens", "Monsteras", "monsteras", 50],
  ["outdoor-landscape-plants", "Flowering Shrubs", "flowering-shrubs", 10], ["outdoor-landscape-plants", "Ornamental Hedges", "ornamental-hedges", 20], ["outdoor-landscape-plants", "Large Trees", "large-trees", 30],
  ["succulents-cacti", "Aloe Vera", "aloe-vera", 10], ["succulents-cacti", "Tabletop Succulents", "tabletop-succulents", 20], ["succulents-cacti", "Cacti", "cacti", 30],
  ["fruit-vegetable-saplings", "Fruit Trees", "fruit-trees", 10], ["fruit-vegetable-saplings", "Vegetable Saplings", "vegetable-saplings", 20], ["fruit-vegetable-saplings", "Culinary Herbs", "culinary-herbs", 30],
  ["seasonal-flowering-plants", "Annuals", "annuals", 10], ["seasonal-flowering-plants", "Perennials", "perennials", 20], ["seasonal-flowering-plants", "Seasonal Bloomers", "seasonal-bloomers", 30],
  ["pots-planters", "Plastic Pots", "plastic-pots", 10], ["pots-planters", "Terracotta", "terracotta", 20], ["pots-planters", "Ceramic", "ceramic", 30], ["pots-planters", "Fabric Grow Bags", "fabric-grow-bags", 40],
  ["soil-growing-media", "Potting Mix", "potting-mix", 10], ["soil-growing-media", "Cocopeat", "cocopeat", 20], ["soil-growing-media", "Red Soil", "red-soil", 30], ["soil-growing-media", "Compost", "compost", 40],
  ["fertilizers-nutrients", "Organic Manure", "organic-manure", 10], ["fertilizers-nutrients", "Vermicompost", "vermicompost", 20], ["fertilizers-nutrients", "Liquid Plant Food", "liquid-plant-food", 30], ["fertilizers-nutrients", "Slow-release Pellets", "slow-release-pellets", 40],
  ["pest-control", "Neem Oil", "neem-oil", 10], ["pest-control", "Pesticides", "pesticides", 20], ["pest-control", "Fungicides", "fungicides", 30],
  ["tools-equipment", "Watering Cans", "watering-cans", 10], ["tools-equipment", "Hand Trowels", "hand-trowels", 20], ["tools-equipment", "Pruners", "pruners", 30], ["tools-equipment", "Spray Bottles", "spray-bottles", 40], ["tools-equipment", "Plant Stakes", "plant-stakes", 50], ["tools-equipment", "Trellises", "trellises", 60],
];

const FALLBACK_SUBCATEGORIES: Subcategory[] = SUBCATEGORY_SEEDS.map(([categorySlug, name, slug, sort_order]) => ({
  id: `fallback-${slug}`,
  category_id: FALLBACK_CATEGORIES.find((item) => item.slug === categorySlug)?.id || "fallback-indoor",
  name,
  slug,
  sort_order,
  active: true,
}));

export async function GET() {
  try {
    const categoriesResult = await supabaseSelect("catalog_categories", "select=*&active=eq.true&order=product_type.asc,sort_order.asc,name.asc");
    const categories = categoriesResult.configured && categoriesResult.response?.ok && Array.isArray(categoriesResult.data) && categoriesResult.data.length
      ? categoriesResult.data as Category[]
      : FALLBACK_CATEGORIES;

    const subcategoriesResult = await supabaseSelect("catalog_subcategories", "select=*&active=eq.true&order=sort_order.asc,name.asc");
    const subcategories = subcategoriesResult.configured && subcategoriesResult.response?.ok && Array.isArray(subcategoriesResult.data) && subcategoriesResult.data.length
      ? subcategoriesResult.data as Subcategory[]
      : FALLBACK_SUBCATEGORIES;

    return NextResponse.json({ categories, subcategories });
  } catch {
    return NextResponse.json({ categories: FALLBACK_CATEGORIES, subcategories: FALLBACK_SUBCATEGORIES });
  }
}
