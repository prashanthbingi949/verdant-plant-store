"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

function PlantThumb({ tone }: { tone: "moss" | "sage" | "lime" }) {
  const colors = {
    moss: ["#5d7d45", "#78945b"],
    sage: ["#6f8d63", "#9eaf8e"],
    lime: ["#8ea64d", "#b6ca5e"],
  } as const;
  const [a, b] = colors[tone];
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" aria-hidden="true">
      <path d="M90 145V70" stroke="#344a30" strokeWidth="5" strokeLinecap="round" />
      <path d="M88 101c-28-25-48-24-63-9 10 25 35 36 63 9Z" fill={a} />
      <path d="M94 92c14-31 36-38 59-30-4 26-24 43-59 30Z" fill={b} />
      <path d="M90 119c-24-17-42-12-54 5 12 17 31 22 54-5Z" fill={b} opacity=".88" />
      <path d="M95 127c19-19 38-20 51-9-9 18-29 26-51 9Z" fill={a} opacity=".92" />
      <path d="M91 70c-4-22 7-40 28-49 10 20 1 38-28 49Z" fill={b} />
      <path d="M57 146h66l-7 20H64l-7-20Z" fill="#c8c1b0" />
      <ellipse cx="90" cy="146" rx="33" ry="6" fill="#4e4534" opacity=".8" />
    </svg>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, delivery, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
        <header className="border-b border-black/10 px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link><Link href="/shop" className="rounded-full bg-[#ddf27a] px-4 py-2 text-sm font-bold">Continue shopping</Link></div>
        </header>
        <section className="mx-auto max-w-xl px-5 py-28 text-center sm:px-8">
          <p className="text-[10px] font-bold tracking-[.2em] text-black/45">YOUR BAG</p>
          <h1 className="mt-5 text-6xl font-semibold tracking-[-.06em]">Nothing here <em>yet.</em></h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-black/55">Choose a plant you love and we'll keep it here while you browse.</p>
          <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#202d20] px-7 py-3 text-sm font-bold text-[#f4f5e9]">Browse plants</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link><div className="text-sm text-black/55">{itemCount} {itemCount === 1 ? "item" : "items"}</div><Link href="/shop" className="rounded-full bg-[#ddf27a] px-4 py-2 text-sm font-bold">Continue shopping</Link></div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold tracking-[.2em] text-black/45">VERDANT BAG</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-7xl">Things taking <em className="font-serif font-normal">root.</em></h1></div><button onClick={clearCart} className="self-start text-sm font-semibold text-black/45 underline decoration-black/20 underline-offset-4 hover:text-black">Clear bag</button></div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-black/10 bg-white/40 p-4 sm:p-5">
                <div className="flex gap-4 sm:gap-6">
                  <div className="h-36 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#dde6cf] sm:h-44 sm:w-40"><PlantThumb tone={item.tone} /></div>
                  <div className="min-w-0 flex-1 py-1"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] tracking-wide text-black/45">{item.category} · {item.size}</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em] sm:text-2xl">{item.name}</h2></div><button onClick={() => removeItem(item.id)} className="text-xs text-black/45 hover:text-black" aria-label={`Remove ${item.name}`}>Remove</button></div><p className="mt-2 text-sm text-black/50">₹{item.price.toLocaleString("en-IN")} each</p><div className="mt-6 flex items-center justify-between gap-4"><div className="flex h-10 items-center rounded-full border border-black/10 bg-[#f4f5e9] p-1"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 rounded-full">−</button><span className="w-7 text-center text-sm font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8 rounded-full">+</button></div><strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></div></div>
                </div>
              </article>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start"><div className="rounded-[28px] bg-[#202d20] p-6 text-[#f4f5e9] sm:p-8"><p className="text-[10px] font-bold tracking-[.2em] text-[#ddf27a]">ORDER SUMMARY</p><div className="mt-7 space-y-4 text-sm"><div className="flex justify-between gap-4"><span className="text-white/55">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="flex justify-between gap-4"><span className="text-white/55">Delivery</span><span>{delivery === 0 ? "FREE" : `₹${delivery.toLocaleString("en-IN")}`}</span></div>{delivery > 0 && <p className="text-xs leading-5 text-[#ddf27a]">Add ₹{(1499 - subtotal).toLocaleString("en-IN")} more for free delivery.</p>}<div className="my-5 border-t border-white/10" /><div className="flex justify-between gap-4 text-lg font-bold"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div></div><Link href="/checkout" className="mt-8 flex h-12 items-center justify-center rounded-full bg-[#ddf27a] text-sm font-bold text-[#101510] transition hover:translate-y-[-1px]">Proceed to checkout</Link><p className="mt-4 text-center text-xs leading-5 text-white/45">Secure checkout · We keep delivery simple.</p></div></aside>
        </div>
      </section>
    </main>
  );
}
