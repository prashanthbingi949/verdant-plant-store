"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Item = { id: string; name: string; price: number; quantity: number };
type Order = {
  order_id: string | null;
  created_at: string;
  customer_name: string | null;
  email: string | null;
  amount: number | null;
  payment_status: string | null;
  order_status: string | null;
  items: Item[] | null;
};

const statuses = ["paid", "packed", "shipped", "delivered"] as const;

type OrderStatus = (typeof statuses)[number];

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialOrder = params.get("order") || "";
    const initialPayment = params.get("payment") || "";
    if (initialOrder) setOrderId(initialOrder);
    if (initialPayment) setPaymentId(initialPayment);
    if (initialOrder && initialPayment) lookup(initialOrder, initialPayment);
  }, []);

  async function lookup(currentOrder = orderId.trim(), currentPayment = paymentId.trim()) {
    if (!currentOrder || !currentPayment) {
      setError("Enter both your Order ID and Payment ID.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(`/api/order-tracking?order=${encodeURIComponent(currentOrder)}&payment=${encodeURIComponent(currentPayment)}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "We couldn't find that order.");
      setOrder(data.order as Order);
      window.history.replaceState({}, "", `/order-tracking?order=${encodeURIComponent(currentOrder)}&payment=${encodeURIComponent(currentPayment)}`);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Unable to find your order.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lookup();
  }

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="border-b border-black/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link>
          <Link href="/shop" className="text-sm font-semibold opacity-65 hover:opacity-100">Shop plants</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[.2em] text-black/45">ORDER TRACKING</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Where’s your <em className="font-serif font-normal">green?</em></h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-black/55">Enter the Order ID and Payment ID from your confirmation email to see the latest status.</p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-9 rounded-[28px] border border-black/10 bg-white/55 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="text-sm">Order ID<input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="order_…" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label>
            <label className="text-sm">Payment ID<input value={paymentId} onChange={(event) => setPaymentId(event.target.value)} placeholder="pay_…" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label>
            <button disabled={loading} className="h-12 rounded-full bg-[#202d20] px-6 text-sm font-bold text-[#f4f5e9] disabled:opacity-60">{loading ? "Checking…" : "Track order"}</button>
          </div>
          {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        </form>

        {order && <TrackingResult order={order} />}
      </section>
    </main>
  );
}

function TrackingResult({ order }: { order: Order }) {
  const rawStatus = order.payment_status === "paid" ? order.order_status || "paid" : "awaiting_payment";
  const statusIndex = rawStatus === "awaiting_payment" ? -1 : Math.max(0, statuses.indexOf(rawStatus as OrderStatus));
  const statusLabel = rawStatus.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-[28px] bg-[#202d20] p-6 text-[#f4f5e9] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[.2em] text-[#ddf27a]">YOUR ORDER</p>
            <h2 className="mt-3 text-2xl font-semibold">{order.order_id}</h2>
            <p className="mt-2 text-sm text-white/50">Placed {formatDate(order.created_at)}</p>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold capitalize">{statusLabel}</div>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-4">
          {statuses.map((status, index) => {
            const complete = statusIndex >= index;
            return <div key={status} className={`rounded-2xl p-4 ${complete ? "bg-[#ddf27a] text-[#101510]" : "bg-white/5 text-white/40"}`}><p className="text-xs font-bold">{complete ? "✓" : "0"}</p><p className="mt-2 text-sm font-semibold capitalize">{status}</p></div>;
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_.65fr]">
        <section className="rounded-[28px] border border-black/10 bg-white/55 p-6 sm:p-8">
          <p className="text-[10px] font-bold tracking-[.18em] text-black/40">ITEMS</p>
          <div className="mt-5 divide-y divide-black/10">
            {items.map((item) => <div key={`${item.id}-${item.name}`} className="flex justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-black/40">Qty {item.quantity}</p></div><p className="font-semibold">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</p></div>)}
            {items.length === 0 && <p className="py-4 text-sm text-black/45">No item details available.</p>}
          </div>
          <div className="mt-5 border-t border-black/10 pt-5"><div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{Number(order.amount || 0).toLocaleString("en-IN")}</span></div></div>
        </section>

        <aside className="rounded-[28px] border border-black/10 bg-white/55 p-6 sm:p-8">
          <p className="text-[10px] font-bold tracking-[.18em] text-black/40">DELIVERY</p>
          <p className="mt-4 text-sm font-semibold">{order.customer_name || "Customer"}</p>
          <p className="mt-1 break-all text-sm text-black/55">{order.email || ""}</p>
          <div className="mt-7 rounded-2xl border border-black/10 bg-black/[.025] p-4 text-sm leading-6 text-black/55">Your status is updated by Verdant as your order moves through packing, shipping and delivery.</div>
        </aside>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
