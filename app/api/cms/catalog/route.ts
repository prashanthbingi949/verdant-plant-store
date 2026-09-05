import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

export async function GET() {
  const categoriesResult = await supabaseSelect("catalog_categories", "select=*&active=eq.true&order=product_type.asc,sort_order.asc,name.asc");
  const categories = categoriesResult.configured && categoriesResult.response?.ok && Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
  const subcategoriesResult = await supabaseSelect("catalog_subcategories", "select=*&active=eq.true&order=sort_order.asc,name.asc");
  const subcategories = subcategoriesResult.configured && subcategoriesResult.response?.ok && Array.isArray(subcategoriesResult.data) ? subcategoriesResult.data : [];
  return NextResponse.json({ categories, subcategories });
}
