"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

async function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return true;
  if (document.getElementById("razorpay-checkout-js")) {
    await new Promise<void>((resolve) => {
      const script = document.getElementById("razorpay-checkout-js");
      script?.addEventListener("load", () => resolve(), { once: true });
    });
    return Boolean(window.Razorpay);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, delivery, total, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) return;
    setProcessing(true);
    setError("");

    try {
      const data = new FormData(event.currentTarget);
      const firstName = String(data.get("firstName") ?? "").trim();
      const lastName = String(data.get("lastName") ?? "").trim();
      const email = String(data.get("email") ?? "").trim();
      const phone = String(data.get("phone") ?? "").trim();
      const address = String(data.get("address") ?? "").trim();
      const city = String(data.get("city") ?? "").trim();
      const state = String(data.get("state") ?? "").trim();
      const pin = String(data.get("pin") ?? "").trim();

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Razorpay could not be loaded. Check your internet connection and try again.");
      }

      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          customer: {
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            address,
            city,
            state,
            pin,
          },
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || "Unable to create the Razorpay order.");

      const key = orderData.key as string | undefined;
      if (!key) throw new Error("Razorpay Key ID is not configured on the server.");

      const Razorpay = window.Razorpay;
      const razorpay = new Razorpay({
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Verdant",
        description: "Verdant plant order",
        order_id: orderData.orderId,
        prefill: { name: `${firstName} ${lastName}`.trim(), email, contact: phone },
        notes: { address, city, state, pin, receipt: orderData.receipt },
        theme: { color: "#202d20" },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, order_id: orderData.orderId }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.verified) throw new Error(verifyData.error || "Payment verification failed.");

            clearCart();
            router.replace(`/order-confirmation?order=${encodeURIComponent(response.razorpay_order_id)}&payment=${encodeURIComponent(response.razorpay_payment_id)}`);
          } catch (verificationError) {
            setError(verificationError instanceof Error ? verificationError.message : "Payment verification failed.");
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });

      razorpay.open();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to start payment.");
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
        <header className="border-b border-black/10 px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link><Link href="/shop" className="rounded-full bg-[#ddf27a] px-4 py-2 text-sm font-bold">Browse plants</Link></div></header>
        <section className="mx-auto max-w-xl px-5 py-28 text-center sm:px-8"><p className="text-[10px] font-bold tracking-[.2em] text-black/45">CHECKOUT</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Your bag is empty.</h1><p className="mt-5 text-sm leading-7 text-black/55">Add a plant before heading to checkout.</p><Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#202d20] px-7 py-3 text-sm font-bold text-[#f4f5e9]">Continue shopping</Link></section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link><Link href="/cart" className="text-sm font-semibold opacity-70 hover:opacity-100">Back to bag</Link></div></header>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16"><div className="mb-10"><p className="text-[10px] font-bold tracking-[.2em] text-black/45">VERDANT CHECKOUT</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-7xl">Bring it <em className="font-serif font-normal">home.</em></h1></div>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-[28px] border border-black/10 bg-white/40 p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.17em] text-black/45">01 / CONTACT</p><h2 className="mt-2 text-2xl font-semibold">Your details</h2></div><span className="text-xs text-black/40">Required</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm">First name<input required name="firstName" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label><label className="text-sm">Last name<input required name="lastName" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label><label className="text-sm sm:col-span-2">Email<input required type="email" name="email" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label><label className="text-sm sm:col-span-2">Phone<input required type="tel" name="phone" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label></div></section>
            <section className="rounded-[28px] border border-black/10 bg-white/40 p-5 sm:p-7"><p className="text-[10px] font-bold tracking-[.17em] text-black/45">02 / DELIVERY</p><h2 className="mt-2 text-2xl font-semibold">Shipping address</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm sm:col-span-2">Address<input required name="address" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label><label className="text-sm">City<input required name="city" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label><label className="text-sm">State<input required name="state" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label><label className="text-sm">PIN code<input required inputMode="numeric" pattern="[0-9]{6}" name="pin" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f4f5e9] px-4 outline-none focus:border-black/25" /></label></div></section>
            <section className="rounded-[28px] border border-black/10 bg-white/40 p-5 sm:p-7"><p className="text-[10px] font-bold tracking-[.17em] text-black/45">03 / PAYMENT</p><h2 className="mt-2 text-2xl font-semibold">Pay securely</h2><div className="mt-6 rounded-2xl border border-[#202d20]/20 bg-[#202d20]/5 p-4"><div className="flex gap-3"><div className="mt-0.5 h-5 w-5 rounded-full border-[6px] border-[#202d20]" /><div><p className="text-sm font-bold">Razorpay Checkout</p><p className="mt-1 text-xs leading-5 text-black/50">UPI, cards, net banking and supported Razorpay payment methods are handled in the secure checkout window.</p></div></div></div>{error && <div role="alert" className="mt-4 rounded-2xl border border-red-900/15 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}<button type="submit" disabled={processing} className="mt-6 flex h-13 w-full items-center justify-center rounded-full bg-[#202d20] px-6 py-3.5 text-sm font-bold text-[#f4f5e9] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60">{processing ? "Opening secure payment…" : `Pay ₹${total.toLocaleString("en-IN")}`}</button></section>
          </form>

          <aside className="lg:sticky lg:top-24"><div className="rounded-[28px] bg-[#202d20] p-6 text-[#f4f5e9] sm:p-8"><p className="text-[10px] font-bold tracking-[.2em] text-[#ddf27a]">YOUR ORDER</p><div className="mt-7 space-y-4">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p>{item.name}</p><p className="mt-1 text-xs text-white/45">Qty {item.quantity}</p></div><span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span></div>)}</div><div className="my-6 border-t border-white/10" /><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-white/50">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="flex justify-between"><span className="text-white/50">Delivery</span><span>{delivery === 0 ? "FREE" : `₹${delivery.toLocaleString("en-IN")}`}</span></div><div className="my-5 border-t border-white/10" /><div className="flex justify-between text-xl font-bold"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div></div><div className="mt-7 rounded-2xl bg-white/5 p-4 text-xs leading-5 text-white/50">Orders over ₹1,499 qualify for free delivery.</div></div></aside>
        </div>
      </section>
    </main>
  );
}
