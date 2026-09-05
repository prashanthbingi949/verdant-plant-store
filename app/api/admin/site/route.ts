import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseInsert, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

async function authorized() {
  const store = await cookies();
  return isValidAdminToken(store.get(adminCookieName())?.value);
}

const defaultSettings: Record<string, Record<string, unknown>> = {
  brand: { name: "VERDANT", tagline: "Thoughtful plants and beautiful objects for a greener everyday." },
  contact: { email: "hello@verdant.example", phone: "", address: "" },
  social: { instagram: "", facebook: "", whatsapp: "" },
  store: { currency: "INR", support_note: "Made for slow growers." },
};

const defaultNavigation = [
  { id: "default-shop", label: "Shop", href: "/shop", location: "header", active: true, sort_order: 10 },
  { id: "default-collections", label: "Collections", href: "#collections", location: "header", active: true, sort_order: 20 },
  { id: "default-plant-care", label: "Plant Care", href: "#care", location: "header", active: true, sort_order: 30 },
  { id: "default-our-story", label: "Our Story", href: "#story", location: "header", active: true, sort_order: 40 },
];

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [settingsResult, navResult] = await Promise.all([
    supabaseSelect("site_settings", "select=*&order=site_key.asc"),
    supabaseSelect("site_navigation", "select=*&order=location.asc,sort_order.asc,updated_at.asc"),
  ]);
  if (!settingsResult.configured || !settingsResult.response?.ok || !navResult.configured || !navResult.response?.ok) {
    return NextResponse.json({ error: "Unable to load site settings." }, { status: 502 });
  }
  const settingRows = Array.isArray(settingsResult.data) ? settingsResult.data as { site_key: string; value: Record<string, unknown> }[] : [];
  const settings = { ...defaultSettings } as Record<string, Record<string, unknown>>;
  for (const row of settingRows) settings[row.site_key] = row.value || {};
  const navigation = Array.isArray(navResult.data) && navResult.data.length ? navResult.data : defaultNavigation;
  return NextResponse.json({ settings, navigation });
}

export async function PUT(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const siteKey = String(body?.site_key || "").trim();
    if (!siteKey) return NextResponse.json({ error: "site_key is required." }, { status: 400 });
    const value = body?.value && typeof body.value === "object" ? body.value : {};
    const existing = await supabaseSelect("site_settings", `select=id&site_key=eq.${encodeURIComponent(siteKey)}&limit=1`);
    if (!existing.configured || !existing.response?.ok) return NextResponse.json({ error: "Unable to check site setting." }, { status: 502 });
    const rows = Array.isArray(existing.data) ? existing.data as { id: string }[] : [];
    if (rows[0]?.id) {
      const result = await supabaseUpdate("site_settings", `id=eq.${encodeURIComponent(rows[0].id)}`, { value, updated_at: new Date().toISOString() });
      if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to save site setting." }, { status: 400 });
      return NextResponse.json({ setting: Array.isArray(result.data) ? result.data[0] ?? null : null });
    }
    const result = await supabaseInsert("site_settings", { site_key: siteKey, value, updated_at: new Date().toISOString() });
    if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to create site setting." }, { status: 400 });
    return NextResponse.json({ setting: Array.isArray(result.data) ? result.data[0] ?? null : null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid site setting data." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const label = String(body?.label || "").trim();
    const href = String(body?.href || "").trim();
    if (!label || !href) return NextResponse.json({ error: "Navigation label and link are required." }, { status: 400 });
    const payload = { label, href, location: body?.location === "footer" ? "footer" : "header", active: body?.active !== false, sort_order: Math.max(0, Math.round(Number(body?.sort_order) || 0)) };
    const result = await supabaseInsert("site_navigation", payload);
    if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to create navigation item." }, { status: 400 });
    return NextResponse.json({ item: Array.isArray(result.data) ? result.data[0] ?? null : null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid navigation data." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body?.id || "").trim();
    if (!id) return NextResponse.json({ error: "Navigation id is required." }, { status: 400 });
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.label === "string") update.label = body.label.trim();
    if (typeof body.href === "string") update.href = body.href.trim();
    if (body.location === "header" || body.location === "footer") update.location = body.location;
    if (typeof body.active === "boolean") update.active = body.active;
    if (typeof body.sort_order === "number") update.sort_order = Math.max(0, Math.round(body.sort_order));
    const result = await supabaseUpdate("site_navigation", `id=eq.${encodeURIComponent(id)}`, update);
    if (!result.configured || !result.response?.ok) return NextResponse.json({ error: "Unable to update navigation item." }, { status: 400 });
    return NextResponse.json({ item: Array.isArray(result.data) ? result.data[0] ?? null : null });
  } catch {
    return NextResponse.json({ error: "Invalid navigation data." }, { status: 400 });
  }
}
