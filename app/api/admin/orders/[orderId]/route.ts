import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isValidAdminToken } from "@/lib/admin-auth";
import { supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";
import { sendOrderNotifications } from "@/lib/order-notifications";

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
    const status = body?.status as OrderStatus;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const existing = await supabaseSelect("orders", `select=*&order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
    if (!existing.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!existing.response?.ok) return NextResponse.json({ error: "Unable to load the order." }, { status: 502 });

    const previousOrder = Array.isArray(existing.data) ? existing.data[0] : null;
    if (!previousOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const result = await supabaseUpdate(
      "orders",
      `order_id=eq.${encodeURIComponent(orderId)}`,
      { order_status: status },
    );

    if (!result.configured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    if (!result.response?.ok) return NextResponse.json({ error: "Unable to update order." }, { status: 502 });

    let notifications = null;
    if (previousOrder.order_status !== status && (status === "shipped" || status === "delivered")) {
      notifications = await sendOrderNotifications(
        {
          order_id: previousOrder.order_id ?? null,
          payment_id: previousOrder.payment_id ?? null,
          customer_name: previousOrder.customer_name ?? null,
          email: previousOrder.email ?? null,
          phone: previousOrder.phone ?? null,
          amount: previousOrder.amount ?? null,
        },
        status,
      );
    }

    return NextResponse.json({
      ok: true,
      order: Array.isArray(result.data) ? result.data[0] ?? null : null,
      notifications,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
