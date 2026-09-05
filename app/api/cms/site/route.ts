import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

const defaultSettings = {
  brand: { name: "VERDANT", tagline: "Thoughtful plants and beautiful objects for a greener everyday." },
  contact: { email: "hello@verdant.example", phone: "", address: "" },
  social: { instagram: "", facebook: "", whatsapp: "" },
  store: { currency: "INR", support_note: "Made for slow growers." },
};

const defaultNavigation = [
  { id: "default-shop", label: "Shop", href: "/shop", location: "header", active: true, sort_order: 10 },
  { id: "default-collections", label: "Collections", href: "/#collections", location: "header", active: true, sort_order: 20 },
  { id: "default-care", label: "Plant Care", href: "/#care", location: "header", active: true, sort_order: 30 },
  { id: "default-story", label: "Our Story", href: "/#story", location: "header", active: true, sort_order: 40 },
  { id: "default-journal", label: "Journal", href: "/pages/plant-care", location: "header", active: true, sort_order: 50 },
];

const labelFallbacks: Record<string, string> = {
  shop: "Shop",
  collections: "Collections",
  care: "Plant Care",
  story: "Our Story",
  journal: "Journal",
  "/shop": "Shop",
  "/#collections": "Collections",
  "/#care": "Plant Care",
  "#care": "Plant Care",
  "/#story": "Our Story",
  "#story": "Our Story",
  "/pages/plant-care": "Journal",
};

function normalizeHeaderNavigation(raw: Array<Record<string, unknown>>) {
  const result: Array<Record<string, unknown>> = [];
  const used = new Set<string>();

  const classify = (item: Record<string, unknown>) => {
    const id = String(item.id || "").toLowerCase();
    const href = String(item.href || "").trim().toLowerCase();
    if (id.includes("journal") || id.includes("blog")) return "journal";
    if (id.includes("collection")) return "collections";
    if (id.includes("care")) return "care";
    if (id.includes("story")) return "story";
    if (href === "/shop" || href.startsWith("/shop?")) return "shop";
    if (href.includes("collections")) return "collections";
    if (href === "#care" || href.endsWith("/#care") || href.endsWith("/\#care")) return "care";
    if (href === "#story" || href.endsWith("/#story") || href.endsWith("/\#story")) return "story";
    if (href.includes("/pages/") || href.includes("journal") || href.includes("blog")) return "journal";
    return null;
  };

  for (const item of raw) {
    const key = classify(item);
    if (!key || used.has(key)) continue;
    used.add(key);
    const fallback = labelFallbacks[key] || labelFallbacks[String(item.href || "")] || "Link";
    result.push({
      ...item,
      label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : fallback,
    });
  }

  for (const item of defaultNavigation) {
    if (!used.has(classify(item) || "")) result.push(item);
  }

  return result
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .slice(0, 5);
}

export async function GET() {
  const [settingsResult, navResult] = await Promise.all([
    supabaseSelect("site_settings", "select=*&order=site_key.asc"),
    supabaseSelect("site_navigation", "select=*&order=location.asc,sort_order.asc,updated_at.asc"),
  ]);

  const settings = { ...defaultSettings } as Record<string, Record<string, unknown>>;
  if (settingsResult.configured && settingsResult.response?.ok && Array.isArray(settingsResult.data)) {
    for (const row of settingsResult.data as { site_key: string; value: Record<string, unknown> }[]) {
      settings[row.site_key] = { ...settings[row.site_key], ...(row.value || {}) };
    }
  }

  const rawNavigation = navResult.configured && navResult.response?.ok && Array.isArray(navResult.data) && navResult.data.length
    ? navResult.data as Array<Record<string, unknown>>
    : defaultNavigation;

  const headerRaw = rawNavigation.filter((item) => item.location === "header" && item.active !== false);
  const headerNavigation = normalizeHeaderNavigation(headerRaw);
  const footerNavigation = rawNavigation
    .filter((item) => item.location === "footer" && item.active !== false)
    .map((item) => ({
      ...item,
      label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : "Link",
    }));

  return NextResponse.json({ settings, navigation: [...headerNavigation, ...footerNavigation] });
}
