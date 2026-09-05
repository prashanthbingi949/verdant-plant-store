import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseInsert, supabaseSelect } from "@/lib/supabase-admin";

async function authorized() {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(adminCookieName())?.value);
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await supabaseSelect("products", "select=*&order=sort_order.asc,created_at.asc");
  if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  if (!result.response?.ok) return NextResponse.json({ error: "Unable to load products." }, { status: 502 });
  return NextResponse.json({ products: Array.isArray(result.data) ? result.data : [] });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const slug = slugify(String(body?.slug || body?.name || "product"));
    if (!slug) return NextResponse.json({ error: "A product name is required." }, { status: 400 });
    const product = normalizeProduct(body, slug);
    const result = await supabaseInsert("products", product);
    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) return NextResponse.json({ error: "Unable to create product." }, { status: 400 });
    return NextResponse.json({ product: Array.isArray(result.data) ? result.data[0] ?? null : null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }
}

function normalizeProduct(body: Record<string, unknown>, slug: string) {
  const details = Array.isArray(body.details) ? body.details : [];
  const imageUrls = Array.isArray(body.image_urls) ? body.image_urls.filter((value: unknown) => typeof value === "string").slice(0, 8) : [];
  const imageUrl = typeof body.image_url === "string" ? body.image_url.trim() || null : imageUrls[0] || null;
  const productType = String(body.product_type || "Plants").trim();
  return {
    slug,
    name: String(body.name || "New Product").trim(),
    product_type: productType === "Gardening Supplies" ? "Gardening Supplies" : "Plants",
    category: String(body.category || "Indoor & Decorative Greens").trim(),
    subcategory: String(body.subcategory || "").trim(),
    level: String(body.level || "Easy care").trim(),
    price: Math.max(0, Math.round(Number(body.price) || 0)),
    size: String(body.size || '6" pot').trim(),
    description: String(body.description || "").trim(),
    details,
    tone: ["moss", "sage", "lime"].includes(String(body.tone)) ? String(body.tone) : "moss",
    stock: Math.max(0, Math.round(Number(body.stock) || 0)),
    active: body.active !== false,
    featured: body.featured === true,
    sort_order: Math.max(0, Math.round(Number(body.sort_order) || 0)),
    image_url: imageUrl,
    image_urls: imageUrls,
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
