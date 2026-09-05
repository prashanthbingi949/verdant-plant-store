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
  "/shop": "Shop",
  "/#collections": "Collections",
  "/#care": "Plant Care",
  "/#story": "Our Story",
  "/pages/plant-care": "Journal",
};

export async function GET() {
  const [settingsResult, navResult] = await Promise.all([
    supabaseSelect("site_settings", "select=*&order=site_key.asc"),
    supabaseSelect("site_navigation", "select=*&order=location.asc,sort_order.asc,updated_at.asc"),
  ]);

  const settings = { ...defaultSettings } as Record<string, Record<string, unknown>>;
  if (settingsResult.configured && settingsResult.response?.ok && Array.isArray(settingsResult.data)) {
    for (const row of settingsResult.data as { site_key: string; value: Record<string, unknown> }[]) {
      settings[row.site_key] = row.value || {};
    }
  }

  const rawNavigation = navResult.configured && navResult.response?.ok && Array.isArray(navResult.data) && navResult.data.length
    ? navResult.data
    : defaultNavigation;

  const navigation = (rawNavigation as Array<Record<string, unknown>>).map((item) => ({
    ...item,
    label: typeof item.label === "string" && item.label.trim()
      ? item.label.trim()
      : labelFallbacks[String(item.href || "")] || "Link",
  }));

  return NextResponse.json({ settings, navigation });
}
