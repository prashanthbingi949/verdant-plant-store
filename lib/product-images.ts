import { EXACT_PRODUCT_SVGS } from "@/lib/exact-product-assets";

export type ProductImageRecord = {
  slug: string;
  name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  product_type?: "Plants" | "Gardening Supplies" | null;
  image_url?: string | null;
  image_urls?: string[];
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
  [/monstera|peace-lily|zz-plant|money-plant|pothos|philodendron|fiddle|snake/i, "indoor-decorative-greens"],
  [/jade|aloe|haworthia|echeveria|cactus|cacti|succulent/i, "succulents-cacti"],
  [/bougainvillea|ixora|areca|duranta|frangipani|polyalthia|hedge|large tree|tree/i, "outdoor-landscape-plants"],
  [/lemon tree|guava|tomato|chilli|basil|mint|sapling|vegetable|fruit tree/i, "fruit-vegetable-saplings"],
  [/petunia|marigold|geranium|chrysanthemum|dahlia|calendula|flowering|seasonal/i, "seasonal-flowering-plants"],
  [/pot|planter|grow bag|terracotta|ceramic|plastic pot/i, "pots-planters"],
  [/soil|potting mix|cocopeat|compost/i, "soil-growing-media"],
  [/fertilizer|vermicompost|manure|seaweed|pellet|plant food|neem cake/i, "fertilizers-nutrients"],
  [/neem oil|pesticide|insect|fungicide|pest/i, "pest-control"],
  [/watering|trowel|pruner|sprayer|spray bottle|stake|trellis|tool/i, "tools-equipment"],
];

function dataSvg(key: string) {
  const svg = EXACT_PRODUCT_SVGS[key];
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;
}

function isGenericAsset(value: string | null | undefined) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes("/product-assets/") || /placeholder|default-image|image-not-found|no-image/.test(normalized);
}

export function productImage(product: ProductImageRecord) {
  const exactKey = EXACT_PRODUCT_SVGS[product.slug]
    ? product.slug
    : product.slug === "long-spout-watering-can" || product.slug === "compact-watering-can"
      ? "watering-can"
      : product.slug === "ergo-trowel" || product.slug === "ergonomic-hand-trowel"
        ? "steel-hand-trowel"
        : null;

  if (exactKey) return dataSvg(exactKey);

  const uploaded = [product.image_url, ...(product.image_urls || [])].find((value) => !isGenericAsset(value));
  if (uploaded) return uploaded;

  const haystack = `${product.slug} ${product.name || ""} ${product.subcategory || ""} ${product.category || ""}`;
  const categoryText = (product.category || "").toLowerCase();
  const matched = CATEGORY_BY_TERM.find(([pattern]) => pattern.test(haystack))?.[1];
  if (matched) return CATEGORY_IMAGES[matched];

  for (const [categorySlug, image] of Object.entries(CATEGORY_IMAGES)) {
    const readable = categorySlug.replaceAll("-", " ");
    if (categoryText.includes(readable)) return image;
  }

  return CATEGORY_IMAGES[product.product_type === "Gardening Supplies" ? "tools-equipment" : "indoor-decorative-greens"];
}

export function productImages(product: ProductImageRecord) {
  const primary = productImage(product);
  const uploaded = [product.image_url, ...(product.image_urls || [])].filter((value): value is string => Boolean(value) && !isGenericAsset(value));
  return Array.from(new Set([primary, ...uploaded].filter(Boolean)));
}

export const productImageAssets = {
  exactProductSvgs: Object.keys(EXACT_PRODUCT_SVGS),
  categoryImages: CATEGORY_IMAGES,
};
