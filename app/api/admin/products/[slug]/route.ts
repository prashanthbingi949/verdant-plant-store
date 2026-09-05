import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

const tones = ["moss", "sage", "lime"] as const;
const productTypes = ["Plants", "Gardening Supplies"] as const;

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await context.params;
  if (!slug) return NextResponse.json({ error: "Product slug is required." }, { status: 400 });

  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body?.name === "string") update.name = body.name.trim();
    if (typeof body?.product_type === "string" && productTypes.includes(body.product_type as (typeof productTypes)[number])) update.product_type = body.product_type;
    if (typeof body?.category === "string") update.category = body.category.trim();
    if (typeof body?.subcategory === "string") update.subcategory = body.subcategory.trim();
    if (typeof body?.level === "string") update.level = body.level.trim();
    if (typeof body?.size === "string") update.size = body.size.trim();
    if (typeof body?.description === "string") update.description = body.description.trim();
    if (Array.isArray(body?.details)) update.details = body.details;
    if (typeof body?.price === "number" && Number.isFinite(body.price)) update.price = Math.max(0, Math.round(body.price));
    if (typeof body?.stock === "number" && Number.isFinite(body.stock)) update.stock = Math.max(0, Math.round(body.stock));
    if (typeof body?.active === "boolean") update.active = body.active;
    if (typeof body?.featured === "boolean") update.featured = body.featured;
    if (typeof body?.sort_order === "number" && Number.isFinite(body.sort_order)) update.sort_order = Math.max(0, Math.round(body.sort_order));
    if (typeof body?.tone === "string" && tones.includes(body.tone as (typeof tones)[number])) update.tone = body.tone;
    if (typeof body?.badge_text === "string") update.badge_text = body.badge_text.trim();
    if (typeof body?.image_url === "string" || body?.image_url === null) update.image_url = typeof body.image_url === "string" ? body.image_url.trim() || null : null;
    if (Array.isArray(body?.image_urls)) update.image_urls = body.image_urls.filter((value: unknown) => typeof value === "string").slice(0, 8);
    update.updated_at = new Date().toISOString();

    if (Object.keys(update).length === 1) return NextResponse.json({ error: "No changes supplied." }, { status: 400 });
    const result = await supabaseUpdate("products", `slug=eq.${encodeURIComponent(slug)}`, update);
    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) {
      const detail = typeof result.data === "object" && result.data && "message" in result.data ? String((result.data as { message?: string }).message || "") : "";
      const hint = detail.toLowerCase().includes("badge_text") && detail.toLowerCase().includes("column")
        ? "The products.badge_text column is missing. Run supabase/product-badges.sql in your Supabase SQL Editor, then try again."
        : detail;
      return NextResponse.json({ error: hint || "Unable to update product." }, { status: 400 });
    }

    const verified = await supabaseSelect("products", `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (!verified.configured || !verified.response?.ok || !Array.isArray(verified.data) || !verified.data[0]) {
      return NextResponse.json({ error: "Product updated, but the saved record could not be verified. Please refresh and try again." }, { status: 502 });
    }

    return NextResponse.json({ product: verified.data[0] });
  } catch {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }
}
