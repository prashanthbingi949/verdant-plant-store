import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseInsert, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

async function authorized() { const store = await cookies(); return isValidAdminToken(store.get(adminCookieName())?.value); }

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await supabaseSelect("catalog_categories", "select=*&order=product_type.asc,sort_order.asc,created_at.asc");
  if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to load categories." }, { status: 502 });
  return NextResponse.json({ categories: Array.isArray(result.data) ? result.data : [] });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    const productType = body?.product_type === "Gardening Supplies" ? "Gardening Supplies" : "Plants";
    const payload = { product_type: productType, name, slug: slugify(String(body?.slug || name)), description: String(body?.description || "").trim(), image_url: typeof body?.image_url === "string" ? body.image_url.trim() || null : null, active: body?.active !== false, sort_order: Math.max(0, Math.round(Number(body?.sort_order) || 0)) };
    const result = await supabaseInsert("catalog_categories", payload);
    if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to create category." }, { status: 400 });
    return NextResponse.json({ category: Array.isArray(result.data) ? result.data[0] ?? null : null }, { status: 201 });
  } catch { return NextResponse.json({ error: "Invalid category data." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json(); const id = String(body?.id || ""); if (!id) return NextResponse.json({ error: "Category id is required." }, { status: 400 });
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.name === "string") update.name = body.name.trim();
    if (body.product_type === "Plants" || body.product_type === "Gardening Supplies") update.product_type = body.product_type;
    if (typeof body.description === "string") update.description = body.description.trim();
    if (typeof body.image_url === "string" || body.image_url === null) update.image_url = body.image_url || null;
    if (typeof body.active === "boolean") update.active = body.active;
    if (typeof body.sort_order === "number") update.sort_order = Math.max(0, Math.round(body.sort_order));
    const result = await supabaseUpdate("catalog_categories", `id=eq.${encodeURIComponent(id)}`, update);
    if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to update category." }, { status: 400 });
    return NextResponse.json({ category: Array.isArray(result.data) ? result.data[0] ?? null : null });
  } catch { return NextResponse.json({ error: "Invalid category data." }, { status: 400 }); }
}

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
