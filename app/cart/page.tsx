"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart-provider";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, delivery, total, itemCount } = useCart();
  const threshold = 1499;
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  const remaining = Math.max(0, threshold - subtotal);
  const itemCountLabel = useMemo(() => `${itemCount} ${itemCount === 1 ? "item" : "items"}`, [itemCount]);

  if (items.length === 0) {
    return (
      <main className="vd-cart-empty">
        <style>{`
          .vd-cart-empty{min-height:100vh;background:#f4f5e9;color:#101510;display:grid;place-items:center;padding:32px}
          .vd-cart-empty-card{width:min(620px,100%);text-align:center;border:1px solid rgba(16,21,16,.1);border-radius:36px;padding:64px 28px;background:rgba(255,255,255,.42);box-shadow:0 24px 70px rgba(32,45,32,.07)}
          .vd-cart-empty-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:#52634b}
          .vd-cart-empty h1{margin:14px 0 0;font-size:clamp(48px,8vw,84px);line-height:.9;letter-spacing:-.065em}
          .vd-cart-empty h1 em{font-family:Georgia,'Times New Roman',serif;font-weight:400}
          .vd-cart-empty p{max-width:430px;margin:18px auto 0;color:rgba(16,21,16,.58);font-size:14px;line-height:1.7}
          .vd-cart-empty a{display:inline-flex;margin-top:28px;border-radius:999px;background:#202d20;color:#f4f5e9;padding:13px 22px;font-size:12px;font-weight:850;text-decoration:none}
        `}</style>
        <div className="vd-cart-empty-card">
          <p className="vd-cart-empty-kicker">YOUR GREEN CORNER</p>
          <h1>Nothing here <em>yet.</em></h1>
          <p>Choose a plant, a planter or a garden essential and we&apos;ll keep it safe here while you browse.</p>
          <Link href="/shop">Explore the shop →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="vd-cart-page">
      <style>{`
        .vd-cart-page{--forest:#202d20;--cream:#f4f5e9;--ink:#101510;--lime:#ddf27a;min-height:100vh;background:var(--cream);color:var(--ink)}
        .vd-cart-page *{box-sizing:border-box}.vd-cart-page a{text-decoration:none;color:inherit}
        .vd-cart-header{position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(16,21,16,.09);background:rgba(244,245,233,.9);backdrop-filter:blur(18px)}
        .vd-cart-header-inner{max-width:1280px;margin:auto;min-height:72px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:18px}
        .vd-cart-brand{font-size:14px;font-weight:900;letter-spacing:.16em}.vd-cart-header-center{font-size:11px;color:rgba(16,21,16,.5)}
        .vd-cart-continue{border-radius:999px;background:var(--lime);padding:11px 16px;font-size:11px;font-weight:900}
        .vd-cart-wrap{max-width:1280px;margin:auto;padding:56px 24px 96px}.vd-cart-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:#52634b}
        .vd-cart-title{margin:12px 0 0;font-size:clamp(52px,7vw,88px);line-height:.9;letter-spacing:-.065em}.vd-cart-title em{font-family:Georgia,'Times New Roman',serif;font-weight:400}
        .vd-cart-top{display:flex;justify-content:space-between;gap:24px;align-items:flex-end}.vd-cart-clear{border:0;background:none;text-decoration:underline;text-underline-offset:4px;color:rgba(16,21,16,.46);font-size:11px;font-weight:800;cursor:pointer}
        .vd-cart-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(340px,.7fr);gap:34px;margin-top:46px;align-items:start}.vd-cart-items{display:grid;gap:12px}
        .vd-cart-item{display:grid;grid-template-columns:148px minmax(0,1fr);gap:20px;padding:14px;border:1px solid rgba(16,21,16,.09);border-radius:28px;background:rgba(255,255,255,.46);transition:.25s ease}.vd-cart-item:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(32,45,32,.08)}
        .vd-cart-item-media{aspect-ratio:1;border-radius:22px;background:#e0e8d5;overflow:hidden}.vd-cart-item-media img{width:100%;height:100%;object-fit:contain;padding:10px}.vd-cart-item-body{padding:5px 3px}
        .vd-cart-item-head{display:flex;justify-content:space-between;gap:12px}.vd-cart-item-category{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(16,21,16,.46)}
        .vd-cart-item-name{margin-top:5px;font-size:21px;letter-spacing:-.03em}.vd-cart-item-price{margin-top:8px;font-size:12px;color:rgba(16,21,16,.55)}
        .vd-cart-remove{border:0;background:none;color:rgba(16,21,16,.42);font-size:10px;font-weight:800;cursor:pointer}.vd-cart-item-bottom{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:28px}
        .vd-cart-qty{display:flex;align-items:center;padding:4px;border-radius:999px;border:1px solid rgba(16,21,16,.1);background:#f4f5e9}.vd-cart-qty button{width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:#202d20;font-size:18px;cursor:pointer}.vd-cart-qty button:hover{background:#fff}.vd-cart-qty span{width:30px;text-align:center;font-size:12px;font-weight:900}.vd-cart-line-total{font-size:15px;font-weight:900}
        .vd-cart-summary{position:sticky;top:94px;align-self:start;max-height:calc(100vh - 112px);overflow:auto;scrollbar-width:none;-ms-overflow-style:none;border-radius:30px;background:var(--forest);color:var(--cream);padding:26px;box-shadow:0 26px 64px rgba(32,45,32,.17)}.vd-cart-summary::-webkit-scrollbar{width:0;height:0;display:none}
        .vd-cart-summary-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:var(--lime)}.vd-cart-summary h2{margin-top:8px;font-size:28px;letter-spacing:-.04em}
        .vd-cart-progress{margin-top:22px;padding:14px;border-radius:18px;background:rgba(244,245,233,.06);border:1px solid rgba(244,245,233,.08)}.vd-cart-progress-top{display:flex;justify-content:space-between;gap:10px;font-size:10px}.vd-cart-progress-top strong{color:var(--lime)}.vd-cart-progress-track{height:7px;margin-top:10px;border-radius:999px;background:rgba(244,245,233,.11);overflow:hidden}.vd-cart-progress-fill{height:100%;border-radius:999px;background:var(--lime);transition:width .45s ease}
        .vd-cart-summary-lines{margin-top:24px;display:grid;gap:12px;font-size:12px}.vd-cart-summary-line{display:flex;justify-content:space-between;gap:12px}.vd-cart-summary-muted{color:rgba(244,245,233,.52)}.vd-cart-summary-divider{height:1px;background:rgba(244,245,233,.1);margin:8px 0}.vd-cart-total{font-size:20px;font-weight:900}
        .vd-cart-checkout{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:22px;height:52px;border-radius:999px;background:var(--lime);color:#101510;font-size:12px;font-weight:900;transition:.25s ease}.vd-cart-checkout:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(221,242,122,.18)}
        .vd-cart-note{margin-top:12px;text-align:center;font-size:10px;line-height:1.5;color:rgba(244,245,233,.44)}.vd-cart-summary-link{display:block;margin-top:14px;text-align:center;font-size:10px;font-weight:800;color:rgba(244,245,233,.62)}
        .vd-cart-bottom-note{margin-top:28px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.vd-cart-note-card{padding:15px;border:1px solid rgba(16,21,16,.09);border-radius:20px;background:rgba(255,255,255,.35)}.vd-cart-note-card strong{display:block;font-size:11px}.vd-cart-note-card span{display:block;margin-top:5px;font-size:10px;line-height:1.5;color:rgba(16,21,16,.52)}
        @media(max-width:900px){.vd-cart-grid{grid-template-columns:1fr}.vd-cart-summary{position:static;max-height:none;overflow:visible}.vd-cart-item{grid-template-columns:116px minmax(0,1fr)}}
        @media(max-width:620px){.vd-cart-header-inner{padding:0 16px}.vd-cart-header-center{display:none}.vd-cart-wrap{padding:38px 16px 88px}.vd-cart-top{align-items:flex-start}.vd-cart-title{font-size:54px}.vd-cart-clear{padding-top:8px}.vd-cart-item{grid-template-columns:92px minmax(0,1fr);gap:13px;padding:10px;border-radius:22px}.vd-cart-item-media{border-radius:16px}.vd-cart-item-name{font-size:16px}.vd-cart-item-bottom{margin-top:18px}.vd-cart-bottom-note{grid-template-columns:1fr}.vd-cart-summary{border-radius:24px;padding:20px}.vd-cart-summary h2{font-size:24px}}
        @media(prefers-reduced-motion:reduce){.vd-cart-item,.vd-cart-checkout{transition:none}.vd-cart-item:hover,.vd-cart-checkout:hover{transform:none}}
      `}</style>

      <header className="vd-cart-header"><div className="vd-cart-header-inner"><Link href="/" className="vd-cart-brand">VERDANT</Link><span className="vd-cart-header-center">{itemCountLabel}</span><Link href="/shop" className="vd-cart-continue">Continue shopping</Link></div></header>

      <section className="vd-cart-wrap">
        <div className="vd-cart-top"><div><p className="vd-cart-kicker">YOUR GREEN CORNER</p><h1 className="vd-cart-title">Things taking <em>root.</em></h1></div><button type="button" className="vd-cart-clear" onClick={clearCart}>Clear bag</button></div>

        <div className="vd-cart-grid">
          <div>
            <div className="vd-cart-items">
              {items.map((item) => (
                <article key={item.id} className="vd-cart-item">
                  <div className="vd-cart-item-media">{item.image_url ? <img src={item.image_url} alt={item.name} /> : null}</div>
                  <div className="vd-cart-item-body">
                    <div className="vd-cart-item-head"><div><p className="vd-cart-item-category">{item.category} · {item.size}</p><h2 className="vd-cart-item-name">{item.name}</h2><p className="vd-cart-item-price">₹{Number(item.price).toLocaleString("en-IN")} each</p></div><button type="button" className="vd-cart-remove" onClick={() => removeItem(item.id)}>Remove</button></div>
                    <div className="vd-cart-item-bottom"><div className="vd-cart-qty"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name}`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name}`}>+</button></div><strong className="vd-cart-line-total">₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</strong></div>
                  </div>
                </article>
              ))}
            </div>

            <div className="vd-cart-bottom-note"><div className="vd-cart-note-card"><strong>Easy delivery</strong><span>Free over ₹1,499.</span></div><div className="vd-cart-note-card"><strong>Secure payment</strong><span>Razorpay handles checkout.</span></div><div className="vd-cart-note-card"><strong>Curated greens</strong><span>Picked to feel good together.</span></div></div>
          </div>

          <aside className="vd-cart-summary"><p className="vd-cart-summary-kicker">ORDER SUMMARY</p><h2>Ready to grow.</h2><div className="vd-cart-progress"><div className="vd-cart-progress-top"><span>{delivery === 0 ? "Free delivery unlocked" : `₹${remaining.toLocaleString("en-IN")} away from free delivery.`}</span><strong>{progress}%</strong></div><div className="vd-cart-progress-track"><div className="vd-cart-progress-fill" style={{ width: `${progress}%` }} /></div></div><div className="vd-cart-summary-lines"><div className="vd-cart-summary-line"><span className="vd-cart-summary-muted">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="vd-cart-summary-line"><span className="vd-cart-summary-muted">Delivery</span><span>{delivery === 0 ? "FREE" : `₹${delivery.toLocaleString("en-IN")}`}</span></div><div className="vd-cart-summary-divider" /><div className="vd-cart-summary-line vd-cart-total"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div></div><Link href="/checkout" className="vd-cart-checkout">Proceed to checkout <span>→</span></Link><p className="vd-cart-note">Secure checkout · UPI, cards and supported Razorpay methods.</p><Link href="/shop" className="vd-cart-summary-link">Keep exploring the catalogue →</Link></aside>
        </div>
      </section>
    </main>
  );
}
