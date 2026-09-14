export type ProductImageRecord = {
  slug: string;
  name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  product_type?: "Plants" | "Gardening Supplies" | null;
  image_url?: string | null;
  image_urls?: string[];
};

const REAL_BY_SLUG: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=90",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1400&q=90",
  "jade-plant": "https://images.unsplash.com/photo-1676089650339-333baa5a7e0b?auto=format&fit=crop&w=1400&q=90",
  "bird-of-paradise": "https://images.unsplash.com/photo-1677787320811-14c81b24e828?auto=format&fit=crop&w=1400&q=90",
  "string-of-pearls": "https://images.unsplash.com/photo-1765041425888-39e09e148a80?auto=format&fit=crop&w=1400&q=90",
  "lavender": "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=1400&q=90",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=1400&q=90",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=1400&q=90",
};

const CATEGORY_IMAGES: Record<string, string> = {
  "indoor-decorative-greens": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88",
  "outdoor-landscape-plants": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=88",
  "succulents-cacti": "https://images.unsplash.com/photo-1676089650339-333baa5a7e0b?auto=format&fit=crop&w=1200&q=88",
  "fruit-vegetable-saplings": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=88",
  "seasonal-flowering-plants": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=88",
  "pots-planters": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=88",
  "soil-growing-media": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=88",
  "fertilizers-nutrients": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=88",
  "pest-control": "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=1200&q=88",
  "tools-equipment": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=88",
};

const CATEGORY_BY_TERM: Array<[RegExp, string]> = [
  [/monstera|peace-lily|peace-lily|zz-plant|money-plant|pothos|philodendron|fiddle/i, "indoor-decorative-greens"],
  [/snake/i, "indoor-decorative-greens"],
  [/jade|aloe|haworthia|echeveria|cactus|cacti|succulent/i, "succulents-cacti"],
  [/bougainvillea|ixora|areca|duranta|frangipani|polyalthia|hedge|tree/i, "outdoor-landscape-plants"],
  [/lemon tree|guava|tomato|chilli|basil|mint|sapling|vegetable|fruit tree/i, "fruit-vegetable-saplings"],
  [/petunia|marigold|geranium|chrysanthemum|dahlia|calendula|flowering|seasonal/i, "seasonal-flowering-plants"],
  [/pot|planter|grow bag|terracotta|ceramic|plastic pot/i, "pots-planters"],
  [/soil|potting mix|cocopeat|compost/i, "soil-growing-media"],
  [/fertilizer|vermicompost|manure|seaweed|pellet|plant food|neem cake/i, "fertilizers-nutrients"],
  [/neem oil|pesticide|insect|fungicide|pest/i, "pest-control"],
  [/watering|trowel|pruner|sprayer|spray bottle|stake|trellis|tool/i, "tools-equipment"],
];

function isGenericAsset(value: string | null | undefined) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes("/product-assets/") || /placeholder|default-image|image-not-found|no-image/.test(normalized);
}

export function productImage(product: ProductImageRecord) {
  const exact = REAL_BY_SLUG[product.slug];
  if (exact) return exact;

  const uploaded = [product.image_url, ...(product.image_urls || [])].find((value) => !isGenericAsset(value));
  if (uploaded) return uploaded;

  const haystack = `${product.slug} ${product.name || ""} ${product.subcategory || ""} ${product.category || ""}`;
  const categorySlug = Object.entries(CATEGORY_IMAGES).find(([slug]) => product.category?.toLowerCase().includes(slug.replaceAll("-", " ")) || product.category?.toLowerCase().includes(slug.split("-")[0]))?.[0];
  if (categorySlug && CATEGORY_IMAGES[categorySlug]) return CATEGORY_IMAGES[categorySlug];

  const matched = CATEGORY_BY_TERM.find(([pattern]) => pattern.test(haystack))?.[1];
  if (matched) return CATEGORY_IMAGES[matched];

  const productType = product.product_type === "Gardening Supplies" ? "tools-equipment" : "indoor-decorative-greens";
  return CATEGORY_IMAGES[productType];
}

export function productImages(product: ProductImageRecord) {
  const uploaded = [product.image_url, ...(product.image_urls || [])].filter((value): value is string => Boolean(value) && !isGenericAsset(value));
  const primary = productImage(product);
  return Array.from(new Set([primary, ...uploaded].filter(Boolean)));
}

export const productImageAssets = {
  realBySlug: REAL_BY_SLUG,
  categoryImages: CATEGORY_IMAGES,
};
