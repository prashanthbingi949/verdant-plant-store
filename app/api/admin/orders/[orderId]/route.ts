import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseUpdate } from "@/lib/supabase-admin";

const ALLOWED_STATUSES = ["awaiting_payment", "paid", "packed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;

  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await context.params;
  if (!orderId) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });

  try {
    const body = await request.json();
    const status = body?.status;

    if (!ALLOWED_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const result = await supabaseUpdate(
      "orders",
      `order_id=eq.${encodeURIComponent(orderId)}`,
      { order_status: status },
    );

    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) return NextResponse.json({ error: "Unable to update order." }, { status: 502 });

    return NextResponse.json({ ok: true, order: Array.isArray(result.data) ? result.data[0] ?? null : null });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
