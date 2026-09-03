import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isSupabaseConfigured, supabaseSelect, supabaseUpdate } from "@/lib/supabase-admin";
import { sendOrderConfirmationEmail } from "@/lib/order-notifications";
import { getProductBySlug } from "@/lib/products";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Razorpay is not configured. Add RAZORPAY_KEY_SECRET to .env.local." }, { status: 500 });

  try {
    const body = await request.json();
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const receivedSignature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";
    if (!orderId || !paymentId || !receivedSignature) return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });

    const expectedSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(receivedSignature, "utf8");
    const verified = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!verified) return NextResponse.json({ verified: false, error: "Invalid payment signature." }, { status: 400 });

    let confirmation = null;
    if (isSupabaseConfigured()) {
      const existing = await supabaseSelect("orders", `select=*&order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
      if (!existing.response?.ok) return NextResponse.json({ verified: true, orderSaved: false, error: "Payment verified, but the order could not be loaded." }, { status: 500 });
      const order = Array.isArray(existing.data) ? existing.data[0] : null;
      if (!order) return NextResponse.json({ verified: true, orderSaved: false, error: "Payment verified, but the order record was not found." }, { status: 500 });

      const wasAlreadyPaid = order.payment_status === "paid";
      const result = await supabaseUpdate("orders", `order_id=eq.${encodeURIComponent(orderId)}`, { payment_id: paymentId, payment_status: "paid", order_status: "paid" });
      if (!result.response?.ok) return NextResponse.json({ verified: true, orderSaved: false, error: "Payment verified, but the order record could not be updated." }, { status: 500 });

      if (!wasAlreadyPaid) {
        const orderItems = Array.isArray(order.items) ? order.items : [];
        for (const item of orderItems) {
          const slug = typeof item?.id === "string" ? item.id : "";
          const quantity = Number(item?.quantity || 0);
          if (!slug || quantity < 1) continue;
          const product = await getProductBySlug(slug);
          if (product) {
            await supabaseUpdate("products", `slug=eq.${encodeURIComponent(slug)}`, { stock: Math.max(0, product.stock - quantity), updated_at: new Date().toISOString() });
          }
        }

        confirmation = await sendOrderConfirmationEmail({
          order_id: order.order_id ?? orderId,
          payment_id: paymentId,
          customer_name: order.customer_name ?? null,
          email: order.email ?? null,
          phone: order.phone ?? null,
          amount: order.amount ?? null,
        });
      }
    }

    return NextResponse.json({ verified: true, orderSaved: isSupabaseConfigured(), confirmation });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
