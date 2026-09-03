import { NextResponse } from "next/server";
import crypto from "node:crypto";

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

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
