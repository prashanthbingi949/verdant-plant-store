import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseServerConfigStatus, supabaseRest } from "@/lib/supabase-admin";

async function authorized() {
  const store = await cookies();
  return isValidAdminToken(store.get(adminCookieName())?.value);
}

const checks = [
  ["products", "/rest/v1/products?select=id&limit=1"],
  ["catalog_categories", "/rest/v1/catalog_categories?select=id&limit=1"],
  ["catalog_subcategories", "/rest/v1/catalog_subcategories?select=id&limit=1"],
  ["home_content", "/rest/v1/home_content?select=id&limit=1"],
  ["site_settings", "/rest/v1/site_settings?select=id&limit=1"],
  ["site_navigation", "/rest/v1/site_navigation?select=id&limit=1"],
  ["cms_pages", "/rest/v1/cms_pages?select=id&limit=1"],
  ["cms_media", "/rest/v1/cms_media?select=id&limit=1"],
  ["orders", "/rest/v1/orders?select=id&limit=1"],
  ["customers", "/rest/v1/customers?select=id&limit=1"],
  ["customer_sessions", "/rest/v1/customer_sessions?select=id&limit=1"],
  ["inventory_settings", "/rest/v1/inventory_settings?select=product_slug&limit=1"],
  ["inventory_movements", "/rest/v1/inventory_movements?select=id&limit=1"],
] as const;

async function inspect(name: string, path: string) {
  const response = await supabaseRest(path, { method: "GET" });
  if (!response) return { name, ok: false, status: null, error: "No response. Supabase configuration or network connection failed." };
  const body = await response.text();
  return {
    name,
    ok: response.ok,
    status: response.status,
    error: response.ok ? null : body.slice(0, 500),
  };
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await Promise.all(checks.map(([name, path]) => inspect(name, path)));
  const failed = results.filter((item) => !item.ok);

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    supabase: getSupabaseServerConfigStatus(),
    summary: {
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.length,
    },
    checks: results,
  });
}
