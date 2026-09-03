import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = (url.searchParams.get("order") || "").trim();
    const paymentId = (url.searchParams.get("payment") || "").trim();

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: "Order ID and payment ID are required." }, { status: 400 });
    }

    const result = await supabaseSelect(
      "orders",
      `select=*&order_id=eq.${encodeURIComponent(orderId)}&payment_id=eq.${encodeURIComponent(paymentId)}&limit=1`,
    );

    if (!result.configured) {
      return NextResponse.json({ error: "Order tracking is not configured." }, { status: 500 });
    }

    if (!result.response?.ok) {
      return NextResponse.json({ error: "Unable to look up the order." }, { status: 502 });
    }

    const order = Array.isArray(result.data) ? result.data[0] : null;
    if (!order) return NextResponse.json({ error: "We couldn't find that order." }, { status: 404 });

    return NextResponse.json({
      order: {
        order_id: order.order_id,
        created_at: order.created_at,
        customer_name: order.customer_name,
        email: order.email,
        amount: order.amount,
        payment_status: order.payment_status,
        order_status: order.order_status,
        items: order.items,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load order tracking." }, { status: 400 });
  }
}
