import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseInsert } from "@/lib/supabase-admin";

const PRODUCTS: Record<string, { name: string; price: number }> = {
  "monstera-deliciosa": { name: "Monstera Deliciosa", price: 1899 },
  "snake-plant": { name: "Snake Plant", price: 899 },
  "jade-plant": { name: "Jade Plant", price: 649 },
  "bird-of-paradise": { name: "Bird of Paradise", price: 2499 },
  "string-of-pearls": { name: "String of Pearls", price: 1199 },
  lavender: { name: "Lavender", price: 799 },
  "fiddle-leaf-fig": { name: "Fiddle Leaf Fig", price: 2199 },
  "aloe-vera": { name: "Aloe Vera", price: 699 },
};

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const customer = body?.customer ?? {};

    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    let subtotal = 0;
    const lineItems: Array<{ id: string; quantity: number; name: string; price: number }> = [];

    for (const rawItem of rawItems) {
      const id = typeof rawItem?.id === "string" ? rawItem.id : "";
      const quantity = Number(rawItem?.quantity);
      const product = PRODUCTS[id];

      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      }

      subtotal += product.price * quantity;
      lineItems.push({ id, quantity, name: product.name, price: product.price });
    }

    const delivery = subtotal === 0 || subtotal >= 1499 ? 0 : 79;
    const total = subtotal + delivery;
    const amount = Math.round(total * 100);
    const receipt = `verdant_${Date.now()}`;

    const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: {
          store: "Verdant",
          item_count: String(lineItems.reduce((sum, item) => sum + item.quantity, 0)),
        },
      }),
      cache: "no-store",
    });

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return NextResponse.json(
        { error: razorpayData?.error?.description || "Razorpay order creation failed." },
        { status: razorpayResponse.status },
      );
    }

    const orderId = razorpayData.id as string;

    if (isSupabaseConfigured()) {
      const result = await supabaseInsert("orders", {
        order_id: orderId,
        payment_id: null,
        customer_name: String(customer?.name ?? "").trim() || null,
        email: String(customer?.email ?? "").trim() || null,
        phone: String(customer?.phone ?? "").trim() || null,
        address: String(customer?.address ?? "").trim() || null,
        city: String(customer?.city ?? "").trim() || null,
        state: String(customer?.state ?? "").trim() || null,
        pincode: String(customer?.pin ?? "").trim() || null,
        amount: total,
        payment_status: "created",
        order_status: "awaiting_payment",
        items: lineItems,
      });

      if (!result.response?.ok) {
        return NextResponse.json(
          { error: "Payment order was created, but the order could not be saved. Please try again." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      key: keyId,
      orderId,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      receipt,
      subtotal,
      delivery,
      total,
    });
  } catch {
    return NextResponse.json({ error: "Unable to create payment order." }, { status: 500 });
  }
}
