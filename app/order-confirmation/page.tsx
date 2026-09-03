"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = { id: string; name: string; price: number; quantity: number };
type Order = {
  order_id: string;
  payment_id: string;
  customer_name: string | null;
  email: string | null;
  amount: number | null;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
  items: OrderItem[] | null;
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "";
  const paymentId = searchParams.get("payment") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !paymentId) {
      setError("This confirmation link is incomplete.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/order-confirmation?order=${encodeURIComponent(orderId)}&payment=${encodeURIComponent(paymentId)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Unable to load your order.");
        if (!cancelled) setOrder(data.order as Order);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load your order.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [orderId, paymentId]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f4f5e9] text-[#101510]"><div className="text-center"><p className="text-[10px] font-bold tracking-[.2em] text-black/40">VERDANT</p><p className="mt-4 text-sm text-black/50">Loading your order…</p></div></main>;
  }

  if (error || !order) {
    return <main className="min-h-screen bg-[#f4f5e9] px-5 py-20 text-[#101510]"><section className="mx-auto max-w-xl text-center"><p className="text-[10px] font-bold tracking-[.2em] text-black/40">ORDER CONFIRMATION</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.055em]">We couldn't find that order.</h1><p className="mt-5 text-sm leading-7 text-black/55">{error || "Please return to the store and contact us if you completed a payment."}</p><Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#202d20] px-7 py-3 text-sm font-bold text-[#f4f5e9]">Continue shopping</Link></section></main>;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const status = order.order_status || (order.payment_status === "paid" ? "paid" : "awaiting_payment");
  const isPaid = order.payment_status === "paid";

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="border-b border-black/10 px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link><Link href="/shop" className="text-sm font-semibold opacity-70 hover:opacity-100">Shop plants</Link></div></header>
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ddf27a] text-2xl">✓</div>
          <p className="mt-7 text-[10px] font-bold tracking-[.2em] text-black/45">ORDER CONFIRMED</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Thank you{order.customer_name ? `, ${order.customer_name.split(" ")[0]}` : ""}.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/55">Your payment has been verified and your order is safely recorded. We've also sent a confirmation email to {order.email || "your email address"}.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Info label="ORDER ID" value={order.order_id} />
          <Info label="PAYMENT" value={order.payment_id} />
          <Info label="STATUS" value={labelFor(status)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[28px] border border-black/10 bg-white/45 p-5 sm:p-7">
            <p className="text-[10px] font-bold tracking-[.18em] text-black/40">YOUR ITEMS</p>
            <div className="mt-5 divide-y divide-black/10">
              {items.map((item) => (
                <div key={`${item.id}-${item.name}`} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-black/40">Qty {item.quantity}</p></div>
                  <p className="font-semibold">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</p>
                </div>
              ))}
              {items.length === 0 && <p className="py-4 text-sm text-black/45">Item details unavailable.</p>}
            </div>
            <div className="mt-5 border-t border-black/10 pt-5"><div className="flex items-center justify-between text-lg font-bold"><span>Total</span><span>₹{Number(order.amount || 0).toLocaleString("en-IN")}</span></div></div>
          </section>

          <aside className="rounded-[28px] bg-[#202d20] p-6 text-[#f4f5e9] sm:p-7">
            <p className="text-[10px] font-bold tracking-[.18em] text-[#ddf27a]">WHAT HAPPENS NEXT</p>
            <div className="mt-6 space-y-5">
              <Step active={isPaid} title="Order confirmed" text="Payment received and verified." />
              <Step active={status === "packed" || status === "shipped" || status === "delivered"} title="Packed" text="We'll prepare your plant for dispatch." />
              <Step active={status === "shipped" || status === "delivered"} title="Shipped" text="You'll receive an email when it is on the way." />
              <Step active={status === "delivered"} title="Delivered" text="Enjoy your new piece of green." />
            </div>
            <Link href="/shop" className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#ddf27a] px-6 py-3 text-sm font-bold text-[#101510]">Continue shopping</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-black/10 bg-white/45 p-4"><p className="text-[10px] font-bold tracking-[.16em] text-black/40">{label}</p><p className="mt-2 break-all text-sm font-semibold">{value}</p></div>;
}

function Step({ active, title, text }: { active: boolean; title: string; text: string }) {
  return <div className="flex gap-3"><div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${active ? "bg-[#ddf27a] text-[#101510]" : "border border-white/20 text-white/30"}`}>{active ? "✓" : ""}</div><div><p className={`text-sm font-semibold ${active ? "text-white" : "text-white/35"}`}>{title}</p><p className="mt-1 text-xs leading-5 text-white/40">{text}</p></div></div>;
}

function labelFor(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
