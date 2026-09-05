import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const result = await supabaseSelect("cms_pages", `select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
  const page = result.configured && result.response?.ok && Array.isArray(result.data) ? result.data[0] : null;
  if (!page) return NextResponse.json({ error: "Page not found." }, { status: 404 });
  return NextResponse.json({ page });
}
