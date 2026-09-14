import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseRest, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

const publishStatuses = ["published", "draft", "archived"] as const;

function cleanString(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

function cleanSlugs(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))).slice(0, 24);
}

async function callRpc(fn: string, args: Record<string, unknown>) {
  const response = await supabaseRest(`/rest/v1/rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
  if (!response) return { configured: false, response: null, data: null };
  const data = await response.json().catch(() => null);
  return { configured: true, response, data };
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [products, settings] = await Promise.all([
    supabaseSelect("products", "select=*&order=sort_order.asc,name.asc"),
    supabaseSelect("inventory_settings", "select=product_slug,reorder_level,reorder_quantity,updated_at"),
  ]);
  if (!products.configured || !settings.configured) return NextResponse.json({ error: "Supabase is not configured. Run the CMS migrations first." }, { status: 500 });
  const bad = [products, settings].find((result) => !result.response?.ok);
  if (bad) return NextResponse.json({ error: "Unable to load Product Master data." }, { status: 500 });

  const settingsBySlug = new Map<string, { reorder_level: number; reorder_quantity: number; inventory_settings_updated_at?: string }>();
  for (const item of (Array.isArray(settings.data) ? settings.data : [])) {
    settingsBySlug.set(String(item.product_slug), { reorder_level: Number(item.reorder_level || 0), reorder_quantity: Number(item.reorder_quantity || 1), inventory_settings_updated_at: item.updated_at });
  }

  const merged = (Array.isArray(products.data) ? products.data : []).map((product) => ({
    ...product,
    ...(settingsBySlug.get(String(product.slug)) || { reorder_level: 5, reorder_quantity: 10 }),
  }));
  return NextResponse.json({ products: merged });
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

    if (Object.keys(update).length > 1) {
      const result = await supabaseUpdate("products", `slug=eq.${encodeURIComponent(slug)}`, update);
      if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
      if (!result.response?.ok) {
        const detail = typeof result.data === "object" && result.data && "message" in result.data ? String((result.data as { message?: string }).message || "") : "";
        return NextResponse.json({ error: detail || "Unable to update product. Run supabase/product-master.sql if the new columns are missing." }, { status: 400 });
      }
    }

    const hasInventory = Number.isFinite(Number(body?.reorder_level)) || Number.isFinite(Number(body?.reorder_quantity));
    if (hasInventory) {
      const result = await callRpc("set_inventory_settings", {
        p_slug: slug,
        p_reorder_level: Math.max(0, Math.round(Number(body?.reorder_level ?? 5))),
        p_reorder_quantity: Math.max(1, Math.round(Number(body?.reorder_quantity ?? 10))),
      });
      if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Product saved, but inventory reorder settings could not be saved." }, { status: 400 });
    }

    const verified = await supabaseSelect("products", `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (!verified.configured || !verified.response?.ok || !Array.isArray(verified.data) || !verified.data[0]) return NextResponse.json({ error: "Saved, but the updated product could not be verified." }, { status: 502 });

    return NextResponse.json({ product: verified.data[0] });
  } catch {
    return NextResponse.json({ error: "Invalid product master data." }, { status: 400 });
  }
}
