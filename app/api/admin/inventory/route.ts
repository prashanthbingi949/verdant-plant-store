import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseRest, supabaseSelect } from "@/lib/supabase-admin";

async function authorized() {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(adminCookieName())?.value);
}

async function callRpc(fn: string, args: Record<string, unknown>) {
  const response = await supabaseRest(`/rest/v1/rpc/${fn}`, {
    method: "POST",
    body: JSON.stringify(args),
  });
  if (!response) return { configured: false, response: null, data: null };
  const data = await response.json().catch(() => null);
  return { configured: true, response, data };
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [products, settings, movements] = await Promise.all([
    supabaseSelect("products", "select=*&order=sort_order.asc,created_at.asc"),
    supabaseSelect("inventory_settings", "select=product_slug,reorder_level,reorder_quantity,updated_at"),
    supabaseSelect("inventory_movements", "select=id,created_at,product_slug,quantity_delta,stock_after,reason,note,actor&order=created_at.desc&limit=80"),
  ]);

  if (!products.configured || !settings.configured || !movements.configured) {
    return NextResponse.json({ error: "Supabase is not configured. Run supabase/cms-product-operations.sql first." }, { status: 500 });
  }

  const bad = [products, settings, movements].find((result) => !result.response?.ok);
  if (bad) {
    const detail = typeof bad.data === "object" && bad.data && "message" in bad.data ? String((bad.data as { message?: string }).message || "") : "";
    return NextResponse.json({ error: detail || "Unable to load inventory." }, { status: 502 });
  }

  return NextResponse.json({
    products: Array.isArray(products.data) ? products.data : [],
    settings: Array.isArray(settings.data) ? settings.data : [],
    movements: Array.isArray(movements.data) ? movements.data : [],
  });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const slug = String(body?.slug || "").trim();
    const action = String(body?.action || "adjust-stock");
    if (!slug) return NextResponse.json({ error: "Product slug is required." }, { status: 400 });

    if (action === "settings") {
      const result = await callRpc("set_inventory_settings", {
        p_slug: slug,
        p_reorder_level: Math.max(0, Math.round(Number(body?.reorder_level) || 0)),
        p_reorder_quantity: Math.max(1, Math.round(Number(body?.reorder_quantity) || 1)),
      });
      if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
      if (!result.response?.ok) {
        const detail = typeof result.data === "object" && result.data && "message" in result.data ? String((result.data as { message?: string }).message || "") : "";
        return NextResponse.json({ error: detail || "Unable to save inventory settings." }, { status: 400 });
      }
      return NextResponse.json({ settings: result.data });
    }

    const delta = Math.round(Number(body?.delta) || 0);
    if (!delta) return NextResponse.json({ error: "Stock adjustment cannot be zero." }, { status: 400 });

    const result = await callRpc("adjust_product_stock", {
      p_slug: slug,
      p_delta: delta,
      p_reason: String(body?.reason || "manual_adjustment"),
      p_note: String(body?.note || ""),
      p_actor: "admin",
    });

    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) {
      const detail = typeof result.data === "object" && result.data && "message" in result.data ? String((result.data as { message?: string }).message || "") : "";
      return NextResponse.json({ error: detail || "Unable to adjust stock." }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: "Invalid inventory request." }, { status: 400 });
  }
}
