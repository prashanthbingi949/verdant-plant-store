import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isSupabaseConfigured, supabaseUpdate } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Add RAZORPAY_KEY_SECRET to .env.local." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const receivedSignature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";

    if (!orderId || !paymentId || !receivedSignature) {
      return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(receivedSignature, "utf8");
    const verified = expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (!verified) {
      return NextResponse.json({ verified: false, error: "Invalid payment signature." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const result = await supabaseUpdate(
        "orders",
        `order_id=eq.${encodeURIComponent(orderId)}`,
        {
          payment_id: paymentId,
          payment_status: "paid",
        },
      );

      if (!result.response?.ok) {
        return NextResponse.json(
          { verified: true, orderSaved: false, error: "Payment verified, but the order record could not be updated." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ verified: true, orderSaved: isSupabaseConfigured() });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
