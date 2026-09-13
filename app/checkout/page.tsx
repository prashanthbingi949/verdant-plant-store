"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = { key: string; amount: number; currency: string; name: string; description: string; order_id: string; prefill: { name?: string; email?: string; contact?: string }; notes?: Record<string, string>; theme?: { color?: string }; handler: (response: RazorpaySuccess) => void; modal?: { ondismiss?: () => void } };
declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void } } }

async function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return true;
  if (document.getElementById("razorpay-checkout-js")) {
    await new Promise<void>((resolve) => document.getElementById("razorpay-checkout-js")?.addEventListener("load", () => resolve(), { once: true }));
    return Boolean(window.Razorpay);
  }
  return new Promise((resolve) => { const script = document.createElement("script"); script.id = "razorpay-checkout-js"; script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true; script.onload = () => resolve(Boolean(window.Razorpay)); script.onerror = () => resolve(false); document.body.appendChild(script); });
}

const STEPS = ["Contact", "Delivery", "Payment"];
const THRESHOLD = 1499;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, delivery, total, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) return;
    setProcessing(true); setError("");
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
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("Razorpay could not be loaded. Check your internet connection and try again.");
      const orderResponse = await fetch("/api/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((item) => ({ id: item.id, quantity: item.quantity })), customer: { name: `${firstName} ${lastName}`.trim(), email, phone, address, city, state, pin } }) });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || "Unable to create the Razorpay order.");
      if (!orderData.key) throw new Error("Razorpay Key ID is not configured on the server.");
      const razorpay = new window.Razorpay({
        key: orderData.key, amount: orderData.amount, currency: orderData.currency, name: "Verdant", description: "Verdant plant order", order_id: orderData.orderId,
        prefill: { name: `${firstName} ${lastName}`.trim(), email, contact: phone }, notes: { address, city, state, pin, receipt: orderData.receipt }, theme: { color: "#202d20" },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...response, order_id: orderData.orderId }) });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.verified) throw new Error(verifyData.error || "Payment verification failed.");
            clearCart();
            router.replace(`/order-confirmation?order=${encodeURIComponent(response.razorpay_order_id)}&payment=${encodeURIComponent(response.razorpay_payment_id)}`);
          } catch (verificationError) { setError(verificationError instanceof Error ? verificationError.message : "Payment verification failed."); }
          finally { setProcessing(false); }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      razorpay.open();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to start payment."); setProcessing(false); }
  }

  if (items.length === 0) return <main className="vd-checkout-empty"><style>{`.vd-checkout-empty{min-height:100vh;background:#f4f5e9;color:#101510;display:grid;place-items:center;padding:28px}.vd-checkout-empty-card{width:min(620px,100%);padding:60px 28px;text-align:center;border:1px solid rgba(16,21,16,.1);border-radius:34px;background:rgba(255,255,255,.42);box-shadow:0 24px 70px rgba(32,45,32,.08)}.vd-checkout-empty-card p{color:rgba(16,21,16,.55);line-height:1.7}.vd-checkout-empty-card a{display:inline-flex;margin-top:26px;background:#202d20;color:#f4f5e9;padding:12px 20px;border-radius:999px;font-size:12px;font-weight:850}`}</style><div className="vd-checkout-empty-card"><p style={{fontSize:10,fontWeight:900,letterSpacing:".2em",color:"#52634b"}}>VERDANT CHECKOUT</p><h1 style={{margin:"14px 0 0",fontSize:"clamp(46px,8vw,78px)",lineHeight:.9,letterSpacing:"-.06em"}}>Your bag is empty.</h1><p style={{marginTop:16}}>Add something green before heading to checkout.</p><Link href="/shop">Return to the shop →</Link></div></main>;

  const progress = Math.min(100, Math.round((subtotal / THRESHOLD) * 100));
  const remaining = Math.max(0, THRESHOLD - subtotal);
  const deliveryCopy = delivery === 0 ? "Free delivery unlocked." : `₹${remaining.toLocaleString("en-IN")} away from free delivery.`;
  const totalLabel = `Pay ₹${total.toLocaleString("en-IN")}`;

  return (
    <main className="vd-checkout">
      <style>{`
        .vd-checkout{--forest:#202d20;--cream:#f4f5e9;--ink:#101510;--lime:#ddf27a;min-height:100vh;background:var(--cream);color:var(--ink)}.vd-checkout *{box-sizing:border-box}.vd-checkout a{text-decoration:none;color:inherit}
        .vd-checkout-header{position:sticky;top:0;z-index:60;border-bottom:1px solid rgba(16,21,16,.09);background:rgba(244,245,233,.92);backdrop-filter:blur(18px)}.vd-checkout-header-inner{max-width:1280px;margin:auto;min-height:72px;padding:0 24px;display:flex;align-items:center;justify-content:space-between}.vd-checkout-brand{font-size:14px;font-weight:900;letter-spacing:.16em}.vd-checkout-back{font-size:11px;font-weight:800;color:rgba(16,21,16,.56)}
        .vd-checkout-wrap{max-width:1280px;margin:auto;padding:48px 24px 110px}.vd-checkout-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:#52634b}.vd-checkout-title{margin:12px 0 0;font-size:clamp(54px,7vw,88px);line-height:.88;letter-spacing:-.065em}.vd-checkout-title em{font-family:Georgia,'Times New Roman',serif;font-weight:400}.vd-checkout-subtitle{max-width:620px;margin-top:14px;color:rgba(16,21,16,.55);font-size:14px;line-height:1.7}
        .vd-checkout-steps{display:flex;align-items:center;gap:10px;margin-top:28px;max-width:720px}.vd-checkout-step{display:flex;align-items:center;gap:8px;color:rgba(16,21,16,.4);font-size:10px;font-weight:850;white-space:nowrap}.vd-checkout-step-dot{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(16,21,16,.15);font-size:9px}.vd-checkout-step.active{color:var(--ink)}.vd-checkout-step.active .vd-checkout-step-dot{background:var(--forest);color:var(--cream);border-color:var(--forest)}.vd-checkout-step-line{height:1px;flex:1;background:rgba(16,21,16,.1)}
        .vd-checkout-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(330px,.9fr);gap:34px;margin-top:44px}.vd-checkout-form{display:grid;gap:14px}.vd-checkout-card{border:1px solid rgba(16,21,16,.1);border-radius:28px;padding:22px;background:rgba(255,255,255,.44);box-shadow:0 18px 46px rgba(32,45,32,.045)}.vd-checkout-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.vd-checkout-card-kicker{font-size:9px;font-weight:900;letter-spacing:.16em;color:rgba(16,21,16,.44)}.vd-checkout-card h2{margin-top:7px;font-size:25px;letter-spacing:-.04em}.vd-checkout-required{font-size:10px;color:rgba(16,21,16,.4)}.vd-checkout-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}.vd-checkout-field{display:grid;gap:7px;font-size:11px;font-weight:750}.vd-checkout-field.full{grid-column:1/-1}.vd-checkout-field input{height:50px;width:100%;padding:0 15px;border:1px solid rgba(16,21,16,.1);border-radius:17px;background:#f4f5e9;color:#101510;outline:none;font:inherit;font-weight:500}.vd-checkout-field input:focus{border-color:rgba(16,21,16,.28);box-shadow:0 0 0 4px rgba(221,242,122,.28)}.vd-checkout-field input:-webkit-autofill{-webkit-text-fill-color:#101510;box-shadow:0 0 0 1000px #f4f5e9 inset}
        .vd-checkout-payment{padding:16px;border:1px solid rgba(32,45,32,.15);border-radius:20px;background:rgba(32,45,32,.045);margin-top:20px}.vd-checkout-payment-row{display:flex;gap:12px}.vd-checkout-payment-mark{width:22px;height:22px;flex:0 0 22px;border-radius:50%;border:6px solid var(--forest);margin-top:1px}.vd-checkout-payment strong{font-size:12px}.vd-checkout-payment p{margin-top:5px;color:rgba(16,21,16,.54);font-size:11px;line-height:1.6}.vd-checkout-error{margin-top:14px;border-radius:16px;background:#fff1f0;border:1px solid rgba(127,29,29,.12);padding:12px;color:#7f1d1d;font-size:11px;line-height:1.5}.vd-checkout-submit{height:54px;width:100%;margin-top:18px;border:0;border-radius:999px;background:var(--forest);color:var(--cream);font-size:12px;font-weight:900;transition:.25s ease}.vd-checkout-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 32px rgba(16,21,16,.14)}.vd-checkout-submit:disabled{opacity:.58;cursor:not-allowed}
        .vd-checkout-summary{position:sticky;top:96px;align-self:start;border-radius:30px;background:var(--forest);color:var(--cream);padding:25px;box-shadow:0 28px 70px rgba(32,45,32,.19)}.vd-checkout-summary-kicker{font-size:9px;font-weight:900;letter-spacing:.2em;color:var(--lime)}.vd-checkout-summary h2{margin-top:7px;font-size:27px;letter-spacing:-.04em}.vd-checkout-summary-items{display:grid;gap:12px;margin-top:24px}.vd-checkout-summary-item{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:10px;align-items:center}.vd-checkout-summary-thumb{width:56px;height:56px;border-radius:16px;background:#dfe7d4;overflow:hidden}.vd-checkout-summary-thumb img{width:100%;height:100%;object-fit:contain;padding:5px}.vd-checkout-summary-item-name{font-size:11px;font-weight:800}.vd-checkout-summary-item-meta{margin-top:3px;font-size:9px;color:rgba(244,245,233,.46)}.vd-checkout-summary-item-price{font-size:11px;font-weight:850}.vd-checkout-progress{margin-top:20px;padding:13px;border-radius:18px;background:rgba(244,245,233,.06);border:1px solid rgba(244,245,233,.08)}.vd-checkout-progress-top{display:flex;justify-content:space-between;gap:10px;font-size:9px;color:rgba(244,245,233,.68)}.vd-checkout-progress-top strong{color:var(--lime)}.vd-checkout-progress-track{height:6px;margin-top:9px;border-radius:999px;background:rgba(244,245,233,.1);overflow:hidden}.vd-checkout-progress-fill{height:100%;border-radius:999px;background:var(--lime)}.vd-checkout-lines{display:grid;gap:12px;margin-top:22px;font-size:12px}.vd-checkout-line{display:flex;justify-content:space-between;gap:12px}.vd-checkout-muted{color:rgba(244,245,233,.5)}.vd-checkout-divider{height:1px;background:rgba(244,245,233,.1);margin:7px 0}.vd-checkout-total{font-size:20px;font-weight:900}.vd-checkout-trust{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}.vd-checkout-trust div{padding:11px;border-radius:15px;background:rgba(244,245,233,.06)}.vd-checkout-trust strong{display:block;font-size:9px;color:var(--lime)}.vd-checkout-trust span{display:block;margin-top:4px;font-size:9px;line-height:1.45;color:rgba(244,245,233,.52)}.vd-checkout-mobile-bar{display:none}
        @media(max-width:900px){.vd-checkout-grid{grid-template-columns:1fr}.vd-checkout-summary{position:static}.vd-checkout-mobile-bar{display:block;position:fixed;left:12px;right:12px;bottom:12px;z-index:80;padding:8px;border:1px solid rgba(16,21,16,.1);border-radius:22px;background:rgba(244,245,233,.92);backdrop-filter:blur(18px);box-shadow:0 20px 50px rgba(16,21,16,.18)}.vd-checkout-mobile-bar button{height:48px;width:100%;border:0;border-radius:999px;background:var(--forest);color:var(--cream);font-size:12px;font-weight:900}}
        @media(max-width:620px){.vd-checkout-header-inner{min-height:64px;padding:0 16px}.vd-checkout-wrap{padding:34px 16px 100px}.vd-checkout-fields{grid-template-columns:1fr}.vd-checkout-field.full{grid-column:auto}.vd-checkout-title{font-size:54px}.vd-checkout-steps{gap:6px}.vd-checkout-step-line{min-width:10px}.vd-checkout-card{padding:18px;border-radius:24px}.vd-checkout-summary{padding:20px;border-radius:24px}.vd-checkout-trust{grid-template-columns:1fr 1fr}}
        @media(prefers-reduced-motion:reduce){.vd-checkout-submit{transition:none}.vd-checkout-submit:hover{transform:none}}
      `}</style>
      <header className="vd-checkout-header"><div className="vd-checkout-header-inner"><Link href="/" className="vd-checkout-brand">VERDANT</Link><Link href="/cart" className="vd-checkout-back">← Back to bag</Link></div></header>
      <section className="vd-checkout-wrap"><p className="vd-checkout-kicker">VERDANT CHECKOUT</p><h1 className="vd-checkout-title">Bring it <em>home.</em></h1><p className="vd-checkout-subtitle">A calm, secure final step. Your plants are almost ready for their new corner.</p><div className="vd-checkout-steps" aria-label="Checkout progress">{STEPS.map((step,index)=><div key={step} className={`vd-checkout-step ${index===0?"active":""}`}><span className="vd-checkout-step-dot">{index+1}</span><span>{step}</span>{index<STEPS.length-1&&<span className="vd-checkout-step-line"/>}</div>)}</div>
        <div className="vd-checkout-grid"><form id="checkout-form" className="vd-checkout-form" onSubmit={handleSubmit}>
          <section className="vd-checkout-card"><div className="vd-checkout-card-head"><div><p className="vd-checkout-card-kicker">01 / CONTACT</p><h2>Your details</h2></div><span className="vd-checkout-required">Required</span></div><div className="vd-checkout-fields"><label className="vd-checkout-field">First name<input required name="firstName" autoComplete="given-name"/></label><label className="vd-checkout-field">Last name<input required name="lastName" autoComplete="family-name"/></label><label className="vd-checkout-field full">Email<input required type="email" name="email" autoComplete="email"/></label><label className="vd-checkout-field full">Phone<input required type="tel" name="phone" autoComplete="tel"/></label></div></section>
          <section className="vd-checkout-card"><div className="vd-checkout-card-head"><div><p className="vd-checkout-card-kicker">02 / DELIVERY</p><h2>Shipping address</h2></div><span className="vd-checkout-required">Secure delivery</span></div><div className="vd-checkout-fields"><label className="vd-checkout-field full">Address<input required name="address" autoComplete="street-address"/></label><label className="vd-checkout-field">City<input required name="city" autoComplete="address-level2"/></label><label className="vd-checkout-field">State<input required name="state" autoComplete="address-level1"/></label><label className="vd-checkout-field">PIN code<input required inputMode="numeric" pattern="[0-9]{6}" name="pin" autoComplete="postal-code"/></label></div></section>
          <section className="vd-checkout-card"><div className="vd-checkout-card-head"><div><p className="vd-checkout-card-kicker">03 / PAYMENT</p><h2>Pay securely</h2></div><span className="vd-checkout-required">Powered by Razorpay</span></div><div className="vd-checkout-payment"><div className="vd-checkout-payment-row"><div className="vd-checkout-payment-mark"/><div><strong>Secure Razorpay checkout</strong><p>UPI, cards, net banking and supported payment methods open in the secure Razorpay window.</p></div></div></div>{error&&<div className="vd-checkout-error" role="alert">{error}</div>}<button type="submit" className="vd-checkout-submit" disabled={processing}>{processing?"Opening secure payment…":totalLabel}</button></section>
        </form>
        <aside className="vd-checkout-summary"><p className="vd-checkout-summary-kicker">YOUR ORDER</p><h2>Ready to grow.</h2><div className="vd-checkout-summary-items">{items.map((item)=><div key={item.id} className="vd-checkout-summary-item"><div className="vd-checkout-summary-thumb">{item.image_url?<img src={item.image_url} alt=""/>:null}</div><div><p className="vd-checkout-summary-item-name">{item.name}</p><p className="vd-checkout-summary-item-meta">Qty {item.quantity} · {item.size}</p></div><span className="vd-checkout-summary-item-price">₹{(Number(item.price)*item.quantity).toLocaleString("en-IN")}</span></div>)}</div><div className="vd-checkout-progress"><div className="vd-checkout-progress-top"><span>{deliveryCopy}</span><strong>{delivery===0?100:progress}%</strong></div><div className="vd-checkout-progress-track"><div className="vd-checkout-progress-fill" style={{width:`${delivery===0?100:progress}%`}}/></div></div><div className="vd-checkout-lines"><div className="vd-checkout-line"><span className="vd-checkout-muted">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div className="vd-checkout-line"><span className="vd-checkout-muted">Delivery</span><span>{delivery===0?"FREE":`₹${delivery.toLocaleString("en-IN")}`}</span></div><div className="vd-checkout-divider"/><div className="vd-checkout-line vd-checkout-total"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div></div><div className="vd-checkout-trust"><div><strong>SECURE</strong><span>Razorpay payment window</span></div><div><strong>FREE</strong><span>Delivery over ₹1,499</span></div></div></aside></div></section><div className="vd-checkout-mobile-bar"><button type="submit" form="checkout-form" disabled={processing}>{processing?"Opening secure payment…":totalLabel}</button></div>
    </main>
  );
}
