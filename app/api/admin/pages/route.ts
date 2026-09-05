import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseInsert, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

async function authorized() { const store = await cookies(); return isValidAdminToken(store.get(adminCookieName())?.value); }
function slugify(v: string) { return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
const defaults = [
  { slug: "our-story", title: "Our story", excerpt: "Why Verdant exists.", content: [{ type: "paragraph", text: "We believe plants change a room, then slowly change the way the room feels." }], status: "published", sort_order: 10 },
  { slug: "plant-care", title: "Plant care", excerpt: "Simple guides for healthier plants.", content: [{ type: "heading", text: "Plant care, made simple" }, { type: "paragraph", text: "Water, light, soil and repotting without the guesswork." }], status: "published", sort_order: 20 },
];
export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await supabaseSelect("cms_pages", "select=*&order=sort_order.asc,created_at.desc");
  if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to load pages." }, { status: 502 });
  const pages = Array.isArray(result.data) ? result.data : [];
  return NextResponse.json({ pages: pages.length ? pages : defaults });
}
export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json(); const title = String(body?.title || "").trim();
    if (!title) return NextResponse.json({ error: "Page title is required." }, { status: 400 });
    const slug = slugify(String(body?.slug || title)); if (!slug) return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
    const payload = { slug, title, excerpt: String(body?.excerpt || "").trim(), content: Array.isArray(body?.content) ? body.content : [], hero_image_url: typeof body?.hero_image_url === "string" ? body.hero_image_url.trim() || null : null, status: body?.status === "published" ? "published" : "draft", published_at: body?.status === "published" ? new Date().toISOString() : null, sort_order: Math.max(0, Math.round(Number(body?.sort_order) || 0)) };
    const result = await supabaseInsert("cms_pages", payload); if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to create page." }, { status: 400 });
    return NextResponse.json({ page: Array.isArray(result.data) ? result.data[0] ?? null : null }, { status: 201 });
  } catch { return NextResponse.json({ error: "Invalid page data." }, { status: 400 }); }
}
export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json(); const id = String(body?.id || "").trim(); if (!id) return NextResponse.json({ error: "Page id is required." }, { status: 400 });
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.slug === "string") update.slug = slugify(body.slug);
    if (typeof body.excerpt === "string") update.excerpt = body.excerpt.trim();
    if (Array.isArray(body.content)) update.content = body.content;
    if (typeof body.hero_image_url === "string" || body.hero_image_url === null) update.hero_image_url = body.hero_image_url || null;
    if (body.status === "draft" || body.status === "published") { update.status = body.status; update.published_at = body.status === "published" ? new Date().toISOString() : null; }
    if (typeof body.sort_order === "number") update.sort_order = Math.max(0, Math.round(body.sort_order));
    const result = await supabaseUpdate("cms_pages", `id=eq.${encodeURIComponent(id)}`, update); if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to update page." }, { status: 400 });
    return NextResponse.json({ page: Array.isArray(result.data) ? result.data[0] ?? null : null });
  } catch { return NextResponse.json({ error: "Invalid page data." }, { status: 400 }); }
}
