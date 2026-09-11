"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";

export default function MiniCartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, itemCount, subtotal, delivery, total, updateQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/cart") {
      setOpen(false);
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href="/cart"]');
      if (!link) return;
      event.preventDefault();
      setOpen(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close cart"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] cursor-default bg-[#101510]/35 backdrop-blur-[2px]"
        />
      )}

      <aside
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-[420px] flex-col bg-[#f4f5e9] shadow-[-20px_0_70px_rgba(16,21,16,.22)] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${open ? "translate-x-0" : "pointer-events-none translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-7">
          <div>
            <p className="text-[9px] font-black tracking-[.2em] text-[#52634b]">YOUR GREEN CORNER</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-.035em]">Cart <span className="text-sm font-semibold text-black/45">({itemCount})</span></h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/40 text-xl transition hover:-translate-y-0.5 hover:bg-[#ddf27a]">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="group flex gap-4 rounded-[22px] border border-black/8 bg-white/45 p-3.5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[18px] bg-[#e5eadb]">
                    {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-2" /> : <div className="h-full w-full bg-gradient-to-br from-[#dbe7cf] to-[#eef2e7]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[9px] font-black uppercase tracking-[.14em] text-black/40">{item.category}</p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{item.name}</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="shrink-0 text-lg leading-none text-black/35 transition hover:text-[#202d20]">×</button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-black/10 bg-[#f4f5e9] p-1">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-7 w-7 place-items-center rounded-full text-sm transition hover:bg-white">−</button>
                        <span className="w-7 text-center text-[11px] font-bold">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full text-sm transition hover:bg-white">+</button>
                      </div>
                      <strong className="text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#ddf27a] text-2xl text-[#202d20]">🌿</div>
              <h3 className="mt-5 text-xl font-semibold">Your cart is growing.</h3>
              <p className="mt-2 max-w-[260px] text-sm leading-6 text-black/50">Add a plant, pot or garden essential and it will appear here.</p>
              <button type="button" onClick={() => setOpen(false)} className="mt-5 rounded-full bg-[#202d20] px-5 py-3 text-sm font-bold text-[#f4f5e9] transition hover:-translate-y-0.5">Keep shopping</button>
            </div>
          )}
        </div>

        <div className="border-t border-black/10 bg-[#f4f5e9]/95 px-6 py-5 backdrop-blur-xl sm:px-7">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-black/55"><span>Subtotal</span><strong className="text-[#202d20]">₹{subtotal.toLocaleString("en-IN")}</strong></div>
            <div className="flex items-center justify-between text-black/55"><span>Delivery</span><span>{delivery === 0 ? "Free" : `₹${delivery.toLocaleString("en-IN")}`}</span></div>
            <div className="mt-3 flex items-center justify-between border-t border-black/8 pt-3"><span className="font-bold">Total</span><strong className="text-lg">₹{total.toLocaleString("en-IN")}</strong></div>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <button type="button" disabled={!items.length} onClick={() => { setOpen(false); router.push("/checkout"); }} className="rounded-full bg-[#202d20] px-5 py-3.5 text-sm font-bold text-[#f4f5e9] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35">Checkout</button>
            <Link href="/cart" onClick={() => setOpen(false)} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/40 px-5 py-3.5 text-sm font-bold text-[#202d20] transition hover:-translate-y-0.5 hover:bg-[#ddf27a]">View cart</Link>
          </div>
        </div>
      </aside>
    </>
  );
}
