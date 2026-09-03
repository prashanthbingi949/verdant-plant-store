import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseUpdate } from "@/lib/supabase-admin";

const tones = ["moss", "sage", "lime"] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(adminCookieName())?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  if (!slug) return NextResponse.json({ error: "Product slug is required." }, { status: 400 });

  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body?.name === "string") update.name = body.name.trim();
    if (typeof body?.category === "string") update.category = body.category.trim();
    if (typeof body?.level === "string") update.level = body.level.trim();
    if (typeof body?.size === "string") update.size = body.size.trim();
    if (typeof body?.description === "string") update.description = body.description.trim();
    if (Array.isArray(body?.details)) update.details = body.details;
    if (typeof body?.price === "number" && Number.isFinite(body.price)) update.price = Math.max(0, Math.round(body.price));
    if (typeof body?.stock === "number" && Number.isFinite(body.stock)) update.stock = Math.max(0, Math.round(body.stock));
    if (typeof body?.active === "boolean") update.active = body.active;
    if (typeof body?.tone === "string" && tones.includes(body.tone as (typeof tones)[number])) update.tone = body.tone;
    update.updated_at = new Date().toISOString();

    if (Object.keys(update).length === 1) return NextResponse.json({ error: "No changes supplied." }, { status: 400 });

    const result = await supabaseUpdate("products", `slug=eq.${encodeURIComponent(slug)}`, update);
    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) return NextResponse.json({ error: "Unable to update product." }, { status: 400 });

    return NextResponse.json({ product: Array.isArray(result.data) ? result.data[0] ?? null : null });
  } catch {
    return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  }
}
