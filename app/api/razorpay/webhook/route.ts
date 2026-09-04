import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isSupabaseConfigured, supabaseRest, supabaseSelect } from "@/lib/supabase-admin";
import { sendOrderConfirmationEmail } from "@/lib/order-notifications";

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
};

function safeEqual(a: string, b: string) {
  const expected = Buffer.from(a, "utf8");
  const received = Buffer.from(b, "utf8");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Razorpay webhook is not configured." }, { status: 500 });

  try {
    const rawBody = await request.text();
    const receivedSignature = request.headers.get("x-razorpay-signature") || "";
    if (!receivedSignature) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!safeEqual(expectedSignature, receivedSignature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let payload: RazorpayWebhookEvent;
    try {
      payload = JSON.parse(rawBody) as RazorpayWebhookEvent;
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    if (payload.event !== "payment.captured" && payload.event !== "order.paid") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Order service is not configured." }, { status: 500 });

    const payment = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const paymentId = typeof payment?.id === "string" ? payment.id : "";
    const orderId = typeof payment?.order_id === "string" ? payment.order_id : typeof orderEntity?.id === "string" ? orderEntity.id : "";

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: "Webhook is missing order or payment details." }, { status: 400 });
    }

    const finalizeResponse = await supabaseRest("/rest/v1/rpc/finalize_paid_order", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ p_order_id: orderId, p_payment_id: paymentId }),
    });
    const finalizeData = finalizeResponse ? await finalizeResponse.json().catch(() => null) : null;

    if (!finalizeResponse?.ok) {
      return NextResponse.json({ error: "Unable to finalize the paid order." }, { status: 500 });
    }

    const status = typeof finalizeData?.status === "string" ? finalizeData.status : "";
    if (status === "already_processed") return NextResponse.json({ ok: true, alreadyProcessed: true });
    if (status === "payment_mismatch") return NextResponse.json({ error: "Payment does not match the existing order." }, { status: 409 });
    if (status === "not_found") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (status === "inventory_issue") return NextResponse.json({ error: "Payment received but inventory could not be reserved." }, { status: 409 });
    if (status === "invalid_state") return NextResponse.json({ error: "Order is not in a payable state." }, { status: 409 });
    if (status !== "processed") return NextResponse.json({ error: "Unable to finalize the paid order." }, { status: 500 });

    const existing = await supabaseSelect("orders", `select=*&order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
    const order = Array.isArray(existing.data) ? existing.data[0] : null;

    const confirmation = await sendOrderConfirmationEmail({
      order_id: order?.order_id ?? orderId,
      payment_id: paymentId,
      customer_name: order?.customer_name ?? null,
      email: order?.email ?? null,
      phone: order?.phone ?? null,
      amount: order?.amount ?? null,
    });

    return NextResponse.json({ ok: true, processed: true, confirmation });
  } catch {
    return NextResponse.json({ error: "Unable to process Razorpay webhook." }, { status: 500 });
  }
}
