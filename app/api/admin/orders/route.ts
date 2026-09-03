import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseSelect } from "@/lib/supabase-admin";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await supabaseSelect("orders", "select=*&order=created_at.desc");

  if (!result.configured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  if (!result.response?.ok) {
    return NextResponse.json({ error: "Unable to load orders." }, { status: 502 });
  }

  return NextResponse.json({ orders: Array.isArray(result.data) ? result.data : [] });
}
