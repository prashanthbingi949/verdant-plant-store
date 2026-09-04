import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isSupabaseConfigured, supabaseRest, supabaseSelect } from "@/lib/supabase-admin";
import { sendOrderConfirmationEmail } from "@/lib/order-notifications";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Razorpay is not configured. Add RAZORPAY_KEY_SECRET to .env.local." }, { status: 500 });

  try {
    const body = await request.json();
    const orderId = typeof body?.order_id === "string" ? body.order_id.trim() : "";
    const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
    const receivedSignature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";
    if (!orderId || !paymentId || !receivedSignature) return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });

    const expectedSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(receivedSignature, "utf8");
    const verified = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!verified) return NextResponse.json({ verified: false, error: "Invalid payment signature." }, { status: 400 });

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Order service is not configured." }, { status: 500 });
    }

    const existing = await supabaseSelect("orders", `select=*&order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
    if (!existing.response?.ok) return NextResponse.json({ verified: true, orderSaved: false, error: "Payment verified, but the order could not be loaded." }, { status: 500 });
    const order = Array.isArray(existing.data) ? existing.data[0] : null;
    if (!order) return NextResponse.json({ verified: true, orderSaved: false, error: "Payment verified, but the order record was not found." }, { status: 500 });

    if (order.payment_status === "paid") {
      if (order.payment_id === paymentId) {
        return NextResponse.json({ verified: true, orderSaved: true, alreadyProcessed: true, confirmation: null });
      }
      return NextResponse.json({ verified: true, orderSaved: true, error: "This order is already associated with a different payment." }, { status: 409 });
    }

    const finalizeResponse = await supabaseRest("/rest/v1/rpc/finalize_paid_order", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ p_order_id: orderId, p_payment_id: paymentId }),
    });
    const finalizeData = finalizeResponse ? await finalizeResponse.json().catch(() => null) : null;

    if (!finalizeResponse?.ok) {
      return NextResponse.json({ verified: true, orderSaved: false, error: "Payment was verified, but the order could not be finalized." }, { status: 500 });
    }

    const status = typeof finalizeData?.status === "string" ? finalizeData.status : "";

    if (status === "already_processed") {
      return NextResponse.json({ verified: true, orderSaved: true, alreadyProcessed: true, confirmation: null });
    }

    if (status === "payment_mismatch") {
      return NextResponse.json({ verified: true, orderSaved: true, error: "This order is already associated with a different payment." }, { status: 409 });
    }

    if (status === "not_found") {
      return NextResponse.json({ verified: true, orderSaved: false, error: "Payment verified, but the order record was not found." }, { status: 500 });
    }

    if (status === "invalid_state") {
      return NextResponse.json({ verified: true, orderSaved: false, error: "This order is not in a payable state." }, { status: 409 });
    }

    if (status === "inventory_issue") {
      return NextResponse.json({
        verified: true,
        orderSaved: true,
        inventoryIssue: true,
        error: "Payment was verified, but stock could not be reserved. Please contact Verdant support with your order ID.",
      }, { status: 409 });
    }

    if (status !== "processed") {
      return NextResponse.json({ verified: true, orderSaved: false, error: "Payment was verified, but the order could not be finalized." }, { status: 500 });
    }

    const confirmation = await sendOrderConfirmationEmail({
      order_id: order.order_id ?? orderId,
      payment_id: paymentId,
      customer_name: order.customer_name ?? null,
      email: order.email ?? null,
      phone: order.phone ?? null,
      amount: order.amount ?? null,
    });

    return NextResponse.json({ verified: true, orderSaved: true, confirmation });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
