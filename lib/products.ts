import { supabaseSelect } from "@/lib/supabase-admin";
import { productImage, productImages } from "@/lib/product-images";

export type Product = {
  id: string;
  created_at?: string;
  updated_at?: string;
  slug: string;
  canonical_slug?: string;
  sku?: string;
  name: string;
  product_type: "Plants" | "Gardening Supplies";
  category: string;
  subcategory: string;
  level: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  tax_rate?: number;
  tax_code?: string;
  size: string;
  short_description?: string;
  description: string;
  personality_line?: string;
  details: string[][];
  tone: "moss" | "sage" | "lime";
  stock: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  badge_text: string;
  image_url?: string | null;
  image_urls?: string[];
  image_alt_text?: string;
  image_alt_texts?: string[];
  related_product_slugs?: string[];
  complete_corner_slugs?: string[];
  seo_title?: string;
  seo_description?: string;
  publish_status?: "published" | "draft" | "archived";
  preview_enabled?: boolean;
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-monstera", slug: "monstera-deliciosa", name: "Monstera Deliciosa", product_type: "Plants",
    category: "Indoor & Decorative Greens", subcategory: "monsteras", level: "Easy care", price: 1899, size: "12\" pot",
    description: "A lush statement plant with generous split leaves. Monstera brings a calm tropical character to bright living spaces and grows beautifully with a little patience.",
    short_description: "A lush statement plant with generous split leaves.", details: [["Light", "Bright, indirect light"], ["Water", "When the top 2–3 cm of soil dries"], ["Humidity", "Medium to high"], ["Pet note", "Keep away from curious pets"]],
    tone: "moss", stock: 20, active: true, featured: true, sort_order: 10, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-snake", slug: "snake-plant", name: "Snake Plant", product_type: "Plants",
    category: "Indoor & Decorative Greens", subcategory: "snake-plants", level: "Easy care", price: 899, size: "10\" pot",
    description: "Architectural, resilient and comfortable in lower light. A dependable first plant with a clean silhouette that works almost anywhere.",
    short_description: "Architectural, resilient and comfortable in lower light.", details: [["Light", "Low to bright indirect light"], ["Water", "Let soil dry between waterings"], ["Humidity", "Low to medium"], ["Pet note", "Keep away from pets"]],
    tone: "sage", stock: 20, active: true, featured: true, sort_order: 20, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-jade", slug: "jade-plant", name: "Jade Plant", product_type: "Plants",
    category: "Succulents & Cacti", subcategory: "tabletop-succulents", level: "Easy care", price: 649, size: "6\" pot",
    description: "A compact succulent with glossy leaves and a naturally sculptural form. Made for sunny desks, shelves and windowsills.",
    short_description: "A compact succulent with glossy leaves and a naturally sculptural form.", details: [["Light", "Bright light with gentle sun"], ["Water", "Allow soil to dry fully"], ["Humidity", "Low"], ["Pet note", "Keep away from pets"]],
    tone: "lime", stock: 20, active: true, featured: false, sort_order: 30, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-bird", slug: "bird-of-paradise", name: "Bird of Paradise", product_type: "Plants",
    category: "Indoor & Decorative Greens", subcategory: "tropical-plants", level: "Medium care", price: 2499, size: "14\" pot",
    description: "Bold tropical foliage for a room that needs presence. Give it bright filtered light and space to stretch.",
    short_description: "Bold tropical foliage for a room that needs presence.", details: [["Light", "Bright, filtered light"], ["Water", "Water when top 3–4 cm dries"], ["Humidity", "Medium to high"], ["Pet note", "Keep away from pets"]],
    tone: "moss", stock: 20, active: true, featured: true, sort_order: 40, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-string", slug: "string-of-pearls", name: "String of Pearls", product_type: "Plants",
    category: "Succulents & Cacti", subcategory: "hanging-succulents", level: "Medium care", price: 1199, size: "6\" hanging pot",
    description: "Trailing bead-like foliage that softens shelves and hanging spaces while staying beautifully sculptural.",
    short_description: "Trailing bead-like foliage for shelves and hanging spaces.", details: [["Light", "Bright indirect light"], ["Water", "Allow soil to dry between waterings"], ["Humidity", "Low"], ["Pet note", "Keep away from pets"]],
    tone: "sage", stock: 20, active: true, featured: false, sort_order: 50, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-lavender", slug: "lavender", name: "Lavender", product_type: "Plants",
    category: "Seasonal & Flowering Plants", subcategory: "seasonal-bloomers", level: "Medium care", price: 799, size: "8\" pot",
    description: "Fragrant flowering stems made for bright balconies, terraces and sunny garden corners.",
    short_description: "Fragrant flowering stems for bright outdoor spaces.", details: [["Light", "Full sun to bright light"], ["Water", "Water when the soil surface dries"], ["Humidity", "Low"], ["Pet note", "Use ordinary pet-safe placement"]],
    tone: "lime", stock: 20, active: true, featured: false, sort_order: 60, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-fiddle", slug: "fiddle-leaf-fig", name: "Fiddle Leaf Fig", product_type: "Plants",
    category: "Indoor & Decorative Greens", subcategory: "monsteras", level: "Medium care", price: 2199, size: "12\" pot",
    description: "Large fiddle-shaped leaves and a polished silhouette for spaces that call for one confident green statement.",
    short_description: "Large fiddle-shaped leaves and a polished silhouette.", details: [["Light", "Bright indirect light"], ["Water", "Let the top layer dry before watering"], ["Humidity", "Medium"], ["Pet note", "Keep away from pets"]],
    tone: "moss", stock: 20, active: true, featured: false, sort_order: 70, badge_text: "", publish_status: "published",
  },
  {
    id: "fallback-aloe", slug: "aloe-vera", name: "Aloe Vera", product_type: "Plants",
    category: "Succulents & Cacti", subcategory: "aloe-vera", level: "Easy care", price: 699, size: "6\" pot",
    description: "A sunny, low-maintenance classic with fleshy leaves and a clean shape for desks, shelves and windowsills.",
    short_description: "A sunny, low-maintenance classic for desks and windowsills.", details: [["Light", "Bright light, some gentle sun"], ["Water", "Allow soil to dry fully"], ["Humidity", "Low"], ["Pet note", "Keep away from pets"]],
    tone: "sage", stock: 20, active: true, featured: true, sort_order: 80, badge_text: "", publish_status: "published",
  },
];

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image_url: productImage(product) || product.image_url || null,
    image_urls: productImages(product),
  };
}

function fallbackProducts(includeInactive = false) {
  return FALLBACK_PRODUCTS.filter((product) => includeInactive || (product.active && product.publish_status === "published"));
}

export async function getProducts(includeInactive = false) {
  const query = includeInactive
    ? "select=*&order=sort_order.asc,created_at.asc"
    : "select=*&active=eq.true&publish_status=eq.published&order=sort_order.asc,created_at.asc";
  try {
    const result = await supabaseSelect("products", query);
    if (!result.configured || !result.response?.ok || !Array.isArray(result.data)) return fallbackProducts(includeInactive).map(normalizeProduct);
    return (result.data as Product[]).map(normalizeProduct);
  } catch {
    return fallbackProducts(includeInactive).map(normalizeProduct);
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const result = await supabaseSelect("products", `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (result.configured && result.response?.ok && Array.isArray(result.data)) {
      const product = (result.data[0] as Product | undefined) ?? null;
      if (product) return normalizeProduct(product);
    }
  } catch {
    // Fall back to the bundled catalog for resilient storefront rendering.
  }

  const fallback = FALLBACK_PRODUCTS.find((product) => product.slug === slug && product.active && product.publish_status === "published");
  return fallback ? normalizeProduct(fallback) : null;
}
