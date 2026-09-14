import { supabaseSelect } from "@/lib/supabase-admin";
import { productImage, productImages } from "@/lib/product-images";

export type Product = {
  id: string;
  created_at?: string;
  updated_at?: string;
  slug: string;
  name: string;
  product_type: "Plants" | "Gardening Supplies";
  category: string;
  subcategory: string;
  level: string;
  price: number;
  size: string;
  description: string;
  details: string[][];
  tone: "moss" | "sage" | "lime";
  stock: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  badge_text: string;
  image_url?: string | null;
  image_urls?: string[];
};

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image_url: productImage(product) || product.image_url || null,
    image_urls: productImages(product),
  };
}

export async function getProducts(includeInactive = false) {
  const query = includeInactive ? "select=*&order=sort_order.asc,created_at.asc" : "select=*&active=eq.true&order=sort_order.asc,created_at.asc";
  const result = await supabaseSelect("products", query);
  if (!result.configured || !result.response?.ok || !Array.isArray(result.data)) return [] as Product[];
  return (result.data as Product[]).map(normalizeProduct);
}

export async function getProductBySlug(slug: string) {
  const result = await supabaseSelect("products", `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if (!result.configured || !result.response?.ok || !Array.isArray(result.data)) return null;
  const product = (result.data[0] as Product | undefined) ?? null;
  return product ? normalizeProduct(product) : null;
}
