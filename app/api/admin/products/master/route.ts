import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

const publishStatuses = ["published", "draft", "archived"] as const;

function cleanString(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

function cleanSlugs(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))).slice(0, 24);
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await supabaseSelect("products", "select=*&order=sort_order.asc,name.asc");
  if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  if (!result.response?.ok) return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
  return NextResponse.json({ products: Array.isArray(result.data) ? result.data : [] });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const slug = cleanString(body?.slug, 200);
    if (!slug) return NextResponse.json({ error: "Product slug is required." }, { status: 400 });

    const update: Record<string, unknown> = {};
    const stringFields: Record<string, number> = {
      name: 200, product_type: 80, category: 160, subcategory: 160, level: 100, size: 120,
      description: 6000, short_description: 1000, personality_line: 500, badge_text: 100,
      sku: 120, tax_code: 80, image_alt_text: 300, seo_title: 160, seo_description: 320,
      canonical_slug: 200,
    };
    for (const [key, max] of Object.entries(stringFields)) {
      const value = cleanString(body?.[key], max);
      if (value !== undefined) update[key] = value;
    }

    for (const key of ["price", "compare_at_price", "cost_price", "tax_rate"]) {
      if (body?.[key] === null && key !== "price") update[key] = null;
      else if (typeof body?.[key] === "number" && Number.isFinite(body[key])) update[key] = Math.max(0, body[key]);
    }

    if (typeof body?.active === "boolean") update.active = body.active;
    if (typeof body?.featured === "boolean") update.featured = body.featured;
    if (typeof body?.preview_enabled === "boolean") update.preview_enabled = body.preview_enabled;
    if (typeof body?.sort_order === "number" && Number.isFinite(body.sort_order)) update.sort_order = Math.max(0, Math.round(body.sort_order));
    if (typeof body?.publish_status === "string" && publishStatuses.includes(body.publish_status as (typeof publishStatuses)[number])) update.publish_status = body.publish_status;
    if (Array.isArray(body?.details)) update.details = body.details.slice(0, 24);
    if (Array.isArray(body?.image_urls)) update.image_urls = body.image_urls.filter((value: unknown) => typeof value === "string").slice(0, 8);
    if (typeof body?.image_url === "string" || body?.image_url === null) update.image_url = body.image_url;
    const related = cleanSlugs(body?.related_product_slugs);
    const corner = cleanSlugs(body?.complete_corner_slugs);
    const altTexts = cleanSlugs(body?.image_alt_texts);
    if (related !== undefined) update.related_product_slugs = related;
    if (corner !== undefined) update.complete_corner_slugs = corner;
    if (altTexts !== undefined) update.image_alt_texts = altTexts;

    update.updated_at = new Date().toISOString();

    if (Object.keys(update).length === 1) return NextResponse.json({ error: "No changes supplied." }, { status: 400 });

    const result = await supabaseUpdate("products", `slug=eq.${encodeURIComponent(slug)}`, update);
    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) {
      const detail = typeof result.data === "object" && result.data && "message" in result.data ? String((result.data as { message?: string }).message || "") : "";
      return NextResponse.json({ error: detail || "Unable to update product. Run supabase/product-master.sql if the new columns are missing." }, { status: 400 });
    }

    const verified = await supabaseSelect("products", `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (!verified.configured || !verified.response?.ok || !Array.isArray(verified.data) || !verified.data[0]) return NextResponse.json({ error: "Saved, but the updated product could not be verified." }, { status: 502 });

    return NextResponse.json({ product: verified.data[0] });
  } catch {
    return NextResponse.json({ error: "Invalid product master data." }, { status: 400 });
  }
}
