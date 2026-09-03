import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!baseUrl || !key) return NextResponse.json({ error: "Supabase storage is not configured." }, { status: 500 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use JPG, PNG, WebP or AVIF." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });

    const productSlug = String(formData.get("slug") || "product").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "product";
    const filename = `${productSlug}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file.type)}`;
    const response = await fetch(`${baseUrl}/storage/v1/object/product-images/${filename}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": file.type, "x-upsert": "true" },
      body: await file.arrayBuffer(),
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return NextResponse.json({ error: detail || "Unable to upload image." }, { status: 502 });
    }

    const url = `${baseUrl}/storage/v1/object/public/product-images/${filename}`;
    const existing = await supabaseSelect("products", `select=image_url,image_urls&slug=eq.${encodeURIComponent(productSlug)}&limit=1`);
    if (existing.response?.ok && Array.isArray(existing.data) && existing.data[0]) {
      const current = existing.data[0] as { image_url?: string | null; image_urls?: unknown };
      const currentUrls = Array.isArray(current.image_urls) ? current.image_urls.filter((value) => typeof value === "string") as string[] : [];
      const nextUrls = [...new Set([...currentUrls, url])].slice(0, 8);
      await supabaseUpdate("products", `slug=eq.${encodeURIComponent(productSlug)}`, {
        image_url: current.image_url || url,
        image_urls: nextUrls,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ url, path: filename }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to process image upload." }, { status: 400 });
  }
}

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}
