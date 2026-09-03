import { supabaseSelect } from "@/lib/supabase-admin";

export type Product = {
  id: string;
  created_at?: string;
  updated_at?: string;
  slug: string;
  name: string;
  category: string;
  level: string;
  price: number;
  size: string;
  description: string;
  details: string[][];
  tone: "moss" | "sage" | "lime";
  stock: number;
  active: boolean;
};

export async function getProducts(includeInactive = false) {
  const query = includeInactive
    ? "select=*&order=created_at.asc"
    : "select=*&active=eq.true&order=created_at.asc";
  const result = await supabaseSelect("products", query);
  if (!result.configured || !result.response?.ok || !Array.isArray(result.data)) return [] as Product[];
  return result.data as Product[];
}

export async function getProductBySlug(slug: string) {
  const result = await supabaseSelect("products", `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if (!result.configured || !result.response?.ok || !Array.isArray(result.data)) return null;
  return (result.data[0] as Product | undefined) ?? null;
}
