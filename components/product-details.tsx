"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";

type Product = {
  id: string;
  slug: string;
  name: string;
  product_type?: "Plants" | "Gardening Supplies";
  category: string;
  subcategory?: string;
  price: number;
  level: string;
  size: string;
  description: string;
  details: string[][];
  tone: "moss" | "sage" | "lime";
  stock: number;
  active: boolean;
  featured?: boolean;
  badge_text?: string;
  image_url?: string | null;
  image_urls?: string[];
};

const fallbackImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=90",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1400&q=90",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=90",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1400&q=90",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1400&q=90",
  lavender: "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=1400&q=90",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=1400&q=90",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=1400&q=90",
};

function displayImages(product: Product) {
  const configured = [product.image_url, ...(product.image_urls || [])].filter(
    (value): value is string => Boolean(value),
  );
  const unique = Array.from(new Set(configured));
  return unique.length ? unique : fallbackImages[product.slug] ? [fallbackImages[product.slug]] : [];
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function ProductVisual({ product }: { product: Product }) {
  const images = displayImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0] || "";

  return (
    <div className="vd-pdp-visual">
      <div className="vd-pdp-visual-glow" />
      <div className="vd-pdp-visual-stage">
        {activeImage ? (
          <img src={activeImage} alt={product.name} className="vd-pdp-main-image" />
        ) : (
          <div className="vd-pdp-art-fallback" aria-hidden="true"><span /><span /><span /></div>
        )}
        <div className="vd-pdp-floor-shadow" />
      </div>
      {images.length > 1 && (
        <div className="vd-pdp-thumbs" aria-label={`${product.name} images`}>
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`View image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`vd-pdp-thumb ${index === activeIndex ? "is-active" : ""}`}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "care">("about");
  const [related, setRelated] = useState<Product[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxQuantity = Math.min(20, Math.max(1, product.stock));
  const soldOut = !product.active || product.stock < 1;

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!Array.isArray(data?.products)) return;
        const candidates = (data.products as Product[]).filter((item) => item.active && item.slug !== product.slug);
        const sameSub = product.subcategory ? candidates.filter((item) => item.subcategory === product.subcategory) : [];
        const sameCategory = candidates.filter((item) => item.category === product.category && !sameSub.some((same) => same.slug === item.slug));
        setRelated([...sameSub, ...sameCategory].slice(0, 4));
      })
      .catch(() => setRelated([]));
  }, [product.category, product.slug, product.subcategory]);

  const addToBag = () => {
    if (soldOut) return;
    addItem(
      {
        id: product.slug,
        name: product.name,
        price: Number(product.price),
        tone: product.tone,
        size: product.size,
        category: product.category,
        image_url: product.image_url || product.image_urls?.[0] || fallbackImages[product.slug] || null,
      },
      quantity,
    );
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2200);
  };

  const price = useMemo(() => Number(product.price).toLocaleString("en-IN"), [product.price]);
  const facts = [
    ["LIGHT", product.level.toLowerCase().includes("easy") ? "Bright, indirect light" : "Bright, filtered light"],
    ["CARE", product.level.replace(/^./, (letter) => letter.toUpperCase())],
    ["SIZE", product.size],
  ];
  const careRows = product.details.length
    ? product.details
    : [["Light", "Bright, indirect light"], ["Water", "When the top soil layer dries"], ["Humidity", "Medium to high"], ["Pet note", "Keep away from curious pets"]];

  return (
    <main className="vd-pdp">
      <style>{`
        .vd-pdp{--forest:#202d20;--forest-deep:#101510;--cream:#f4f5e9;--lime:#ddf27a;--ink:#101510;--muted:rgba(16,21,16,.58);min-height:100vh;overflow-x:hidden;background:var(--cream);color:var(--ink)}
        .vd-pdp *,.vd-pdp *::before,.vd-pdp *::after{box-sizing:border-box}.vd-pdp a{text-decoration:none;color:inherit}
        .vd-pdp .vd-pdp-header{position:sticky;top:0;z-index:60;border-bottom:1px solid rgba(16,21,16,.09);background:rgba(244,245,233,.88);backdrop-filter:blur(18px)}
        .vd-pdp .vd-pdp-header-inner{max-width:1280px;margin:auto;min-height:72px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:18px}.vd-pdp .vd-brand{font-size:14px;font-weight:900;letter-spacing:.16em}.vd-pdp .vd-nav{display:flex;gap:28px;font-size:12px;font-weight:700;color:rgba(16,21,16,.58)}.vd-pdp .vd-nav a:hover{color:var(--ink)}.vd-pdp .vd-bag{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:var(--lime);font-size:12px;font-weight:900}
        .vd-pdp .vd-crumb{max-width:1280px;margin:auto;padding:20px 24px 0;color:rgba(16,21,16,.48);font-size:10px;letter-spacing:.08em}
        .vd-pdp .vd-hero{max-width:1280px;margin:auto;padding:20px 24px 76px;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(380px,.98fr);gap:58px;align-items:center}.vd-pdp .vd-gallery{position:relative;min-height:600px;border-radius:36px;overflow:hidden;background:#e1e9d4;box-shadow:0 24px 70px rgba(32,45,32,.08)}
        .vd-pdp .vd-pdp-visual{height:100%;min-height:600px;position:relative;display:flex;flex-direction:column}.vd-pdp .vd-pdp-visual-glow{position:absolute;inset:7% 8% 18%;border-radius:50%;background:radial-gradient(circle,rgba(188,214,143,.34),transparent 64%);filter:blur(2px)}.vd-pdp .vd-pdp-visual-stage{position:relative;flex:1;min-height:0;display:grid;place-items:center;padding:36px 48px 20px}.vd-pdp .vd-pdp-main-image{position:relative;width:100%;height:100%;max-height:560px;object-fit:contain;filter:drop-shadow(0 28px 24px rgba(16,21,16,.13));transition:transform .65s cubic-bezier(.2,.7,.2,1),filter .65s ease}.vd-pdp .vd-gallery:hover .vd-pdp-main-image{transform:scale(1.02) translateY(-5px);filter:drop-shadow(0 34px 30px rgba(16,21,16,.16))}.vd-pdp .vd-pdp-floor-shadow{position:absolute;left:24%;right:24%;bottom:31px;height:38px;border-radius:50%;background:rgba(16,21,16,.12);filter:blur(18px)}
        .vd-pdp .vd-pdp-thumbs{position:relative;z-index:3;display:flex;gap:10px;overflow:auto;padding:12px 16px 16px;border-top:1px solid rgba(16,21,16,.08);background:rgba(244,245,233,.56);backdrop-filter:blur(12px)}.vd-pdp .vd-pdp-thumb{width:62px;height:62px;flex:0 0 62px;padding:6px;border-radius:14px;border:1px solid transparent;background:rgba(251,252,245,.66);transition:.22s ease}.vd-pdp .vd-pdp-thumb:hover{transform:translateY(-1px)}.vd-pdp .vd-pdp-thumb.is-active{border-color:var(--forest);box-shadow:0 0 0 2px rgba(221,242,122,.7)}.vd-pdp .vd-pdp-thumb img{width:100%;height:100%;object-fit:contain;border-radius:9px}
        .vd-pdp .vd-pdp-hero-content{display:flex;flex-direction:column;justify-content:center}.vd-pdp .vd-eyebrow{font-size:10px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:#52634b}.vd-pdp .vd-title{margin:15px 0 0;max-width:700px;font-size:clamp(52px,5.8vw,82px);font-weight:780;line-height:.88;letter-spacing:-.065em}.vd-pdp .vd-tagline{margin-top:17px;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#52634b}.vd-pdp .vd-meta{display:flex;gap:9px;align-items:center;margin-top:9px;font-size:12px;color:var(--muted)}.vd-pdp .vd-description{max-width:610px;margin-top:16px;font-size:15px;line-height:1.8;color:var(--muted)}
        .vd-pdp .vd-price-row{display:flex;align-items:flex-end;gap:14px;margin-top:24px;padding-top:22px;border-top:1px solid rgba(16,21,16,.1)}.vd-pdp .vd-price{font-size:36px;font-weight:900;letter-spacing:-.045em}.vd-pdp .vd-tax{font-size:10px;color:rgba(16,21,16,.43);padding-bottom:6px}.vd-pdp .vd-buy-box{margin-top:16px;padding:8px;border:1px solid rgba(16,21,16,.12);border-radius:24px;background:rgba(255,255,255,.34);box-shadow:0 18px 46px rgba(32,45,32,.06)}.vd-pdp .vd-buy-row{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px}.vd-pdp .vd-qty{height:52px;display:flex;align-items:center;padding:5px;border-radius:999px;border:1px solid rgba(16,21,16,.12);background:rgba(244,245,233,.9)}.vd-pdp .vd-qty button{width:40px;height:40px;border:0;border-radius:50%;font-size:19px;color:var(--ink);background:transparent}.vd-pdp .vd-qty button:hover:not(:disabled){background:#e8ecd9}.vd-pdp .vd-qty button:disabled{opacity:.24}.vd-pdp .vd-qty span{width:32px;text-align:center;font-size:13px;font-weight:900}.vd-pdp .vd-add{height:52px;border:0;border-radius:999px;background:var(--forest);color:var(--cream);font-size:13px;font-weight:900;transition:.25s ease}.vd-pdp .vd-add:hover:not(:disabled){transform:translateY(-1px);background:var(--forest-deep);box-shadow:0 12px 26px rgba(16,21,16,.14)}.vd-pdp .vd-add.is-added{background:var(--lime);color:var(--ink)}.vd-pdp .vd-buy-foot{display:flex;justify-content:space-between;gap:12px;margin-top:8px;padding:0 6px;font-size:10px;color:rgba(16,21,16,.44)}.vd-pdp .vd-stock{font-weight:800;color:rgba(16,21,16,.55)}
        .vd-pdp .vd-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}.vd-pdp .vd-fact{padding-top:15px;border-top:1px solid rgba(16,21,16,.1)}.vd-pdp .vd-fact-label{font-size:9px;font-weight:900;letter-spacing:.16em;color:rgba(16,21,16,.45)}.vd-pdp .vd-fact-value{margin-top:8px;font-size:12px;font-weight:850;line-height:1.35}.vd-pdp .vd-info{max-width:700px;margin-top:30px;border-top:1px solid rgba(16,21,16,.1)}.vd-pdp .vd-tabs{display:flex;align-items:center;gap:26px;border-bottom:1px solid rgba(16,21,16,.09)}.vd-pdp .vd-tab{position:relative;padding:15px 0;border:0;background:none;font-size:12px;font-weight:850;color:rgba(16,21,16,.42)}.vd-pdp .vd-tab.active{color:var(--ink)}.vd-pdp .vd-tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--forest)}.vd-pdp .vd-save{margin-left:auto;display:inline-flex;align-items:center;gap:5px}.vd-pdp .vd-save svg{width:13px;height:13px}.vd-pdp .vd-info-copy{padding:20px 0;color:var(--muted);font-size:13px;line-height:1.8}.vd-pdp .vd-care-grid{display:grid;grid-template-columns:1fr 1.55fr}.vd-pdp .vd-care-row{display:contents}.vd-pdp .vd-care-label,.vd-pdp .vd-care-value{padding:11px 0;border-bottom:1px solid rgba(16,21,16,.07);font-size:12px}.vd-pdp .vd-care-label{color:rgba(16,21,16,.45)}.vd-pdp .vd-care-value{font-weight:700}
        .vd-pdp .vd-section-dark{background:var(--forest);color:var(--cream);padding:88px 24px}.vd-pdp .vd-section-inner{max-width:1280px;margin:auto}.vd-pdp .vd-section-kicker{font-size:10px;font-weight:900;letter-spacing:.2em;color:var(--lime)}.vd-pdp .vd-section-title{margin-top:14px;font-size:clamp(36px,4.2vw,62px);line-height:.95;letter-spacing:-.05em;font-weight:760}.vd-pdp .vd-section-title em{font-family:Georgia,'Times New Roman',serif;font-weight:400}.vd-pdp .vd-story-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:40px}.vd-pdp .vd-story-card{min-height:210px;padding:24px;border-radius:24px;border:1px solid rgba(244,245,233,.1);background:linear-gradient(145deg,rgba(244,245,233,.08),rgba(244,245,233,.03))}.vd-pdp .vd-story-number{font-size:10px;color:rgba(244,245,233,.44);letter-spacing:.16em}.vd-pdp .vd-story-card h3{margin-top:36px;font-size:21px;letter-spacing:-.02em}.vd-pdp .vd-story-card p{margin-top:10px;font-size:12px;line-height:1.7;color:rgba(244,245,233,.62)}
        .vd-pdp .vd-related{padding:84px 24px 96px;background:#eaeee0}.vd-pdp .vd-related-inner{max-width:1280px;margin:auto}.vd-pdp .vd-related-head{display:flex;justify-content:space-between;gap:16px;align-items:end}.vd-pdp .vd-related-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:28px}.vd-pdp .vd-related-card{overflow:hidden;border-radius:26px;background:#f7f8ee;border:1px solid rgba(16,21,16,.09);transition:.3s ease}.vd-pdp .vd-related-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(32,45,32,.11)}.vd-pdp .vd-related-image{aspect-ratio:1;background:#dfe7d4;display:grid;place-items:center;overflow:hidden}.vd-pdp .vd-related-image img{width:100%;height:100%;object-fit:contain;padding:20px;transition:.5s ease}.vd-pdp .vd-related-card:hover .vd-related-image img{transform:scale(1.045)}.vd-pdp .vd-related-copy{padding:16px}.vd-pdp .vd-related-meta{font-size:9px;color:rgba(16,21,16,.47);letter-spacing:.13em;text-transform:uppercase}.vd-pdp .vd-related-name{margin-top:6px;font-size:15px;font-weight:850}.vd-pdp .vd-related-bottom{display:flex;justify-content:space-between;gap:10px;margin-top:12px;align-items:center}.vd-pdp .vd-related-price{font-size:13px;font-weight:900}.vd-pdp .vd-related-link{font-size:11px;font-weight:850;color:#52634b}
        .vd-pdp .vd-mobile-bar{display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:70;padding:8px;border:1px solid rgba(16,21,16,.12);border-radius:22px;background:rgba(244,245,233,.92);backdrop-filter:blur(18px);box-shadow:0 18px 48px rgba(16,21,16,.18)}.vd-pdp .vd-mobile-bar-inner{display:grid;grid-template-columns:auto 1fr;gap:8px}.vd-pdp .vd-mobile-price{display:flex;align-items:center;padding:0 12px;font-size:13px;font-weight:900}
        @media(max-width:980px){.vd-pdp .vd-hero{grid-template-columns:1fr;gap:32px;padding-bottom:56px}.vd-pdp .vd-gallery,.vd-pdp .vd-pdp-visual{min-height:560px}.vd-pdp .vd-related-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:680px){.vd-pdp .vd-pdp-header-inner{min-height:64px;padding:0 16px}.vd-pdp .vd-nav{display:none}.vd-pdp .vd-crumb{padding:15px 16px 0;font-size:9px}.vd-pdp .vd-hero{padding:16px 16px 110px;gap:24px}.vd-pdp .vd-gallery,.vd-pdp .vd-pdp-visual{min-height:420px;border-radius:26px}.vd-pdp .vd-pdp-visual-stage{padding:26px 20px 18px}.vd-pdp .vd-title{font-size:54px}.vd-pdp .vd-description{font-size:14px;line-height:1.7}.vd-pdp .vd-buy-row{grid-template-columns:1fr}.vd-pdp .vd-qty{justify-content:center;width:100%}.vd-pdp .vd-facts{gap:10px}.vd-pdp .vd-fact-value{font-size:11px}.vd-pdp .vd-story-grid{grid-template-columns:1fr}.vd-pdp .vd-related{padding:64px 16px 90px}.vd-pdp .vd-related-grid{grid-template-columns:1fr 1fr;gap:10px}.vd-pdp .vd-related-copy{padding:12px}.vd-pdp .vd-related-name{font-size:13px}.vd-pdp .vd-mobile-bar{display:block}}
        .verdant-dark .vd-pdp{background:#101510;color:#f4f5e9}.verdant-dark .vd-pdp .vd-pdp-header{background:rgba(16,21,16,.9);border-color:rgba(244,245,233,.08)}.verdant-dark .vd-pdp .vd-brand,.verdant-dark .vd-pdp .vd-nav,.verdant-dark .vd-pdp .vd-crumb{color:#f4f5e9}.verdant-dark .vd-pdp .vd-crumb,.verdant-dark .vd-pdp .vd-description,.verdant-dark .vd-pdp .vd-tax,.verdant-dark .vd-pdp .vd-buy-foot,.verdant-dark .vd-pdp .vd-fact-label,.verdant-dark .vd-pdp .vd-tab,.verdant-dark .vd-pdp .vd-care-label{color:rgba(244,245,233,.58)}.verdant-dark .vd-pdp .vd-eyebrow,.verdant-dark .vd-pdp .vd-tagline{color:#bcd47a}.verdant-dark .vd-pdp .vd-gallery{background:#1a241b}.verdant-dark .vd-pdp .vd-pdp-thumbs{background:rgba(16,21,16,.6);border-color:rgba(244,245,233,.09)}.verdant-dark .vd-pdp .vd-pdp-thumb{background:rgba(244,245,233,.05)}.verdant-dark .vd-pdp .vd-qty{background:rgba(32,45,32,.7);border-color:rgba(244,245,233,.16)}.verdant-dark .vd-pdp .vd-qty button{color:#f4f5e9}.verdant-dark .vd-pdp .vd-price-row,.verdant-dark .vd-pdp .vd-fact,.verdant-dark .vd-pdp .vd-info,.verdant-dark .vd-pdp .vd-tabs,.verdant-dark .vd-pdp .vd-care-label,.verdant-dark .vd-pdp .vd-care-value{border-color:rgba(244,245,233,.12)}.verdant-dark .vd-pdp .vd-tab.active{color:#f4f5e9}.verdant-dark .vd-pdp .vd-related{background:#152019}.verdant-dark .vd-pdp .vd-related-card{background:rgba(244,245,233,.04);border-color:rgba(244,245,233,.09)}.verdant-dark .vd-pdp .vd-related-image{background:#1d2a1f}.verdant-dark .vd-pdp .vd-related-image img{mix-blend-mode:screen}.verdant-dark .vd-pdp .vd-mobile-bar{background:rgba(20,29,21,.95);border-color:rgba(244,245,233,.1)}.verdant-dark .vd-pdp .vd-mobile-price{color:#f4f5e9}
      `}</style>

      <header className="vd-pdp-header">
        <div className="vd-pdp-header-inner">
          <Link href="/" className="vd-brand">VERDANT</Link>
          <nav className="vd-nav"><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/#care">Plant care</Link></nav>
          <Link href="/cart" className="vd-bag">View bag</Link>
        </div>
      </header>

      <div className="vd-crumb">Shop&nbsp; → &nbsp;{product.category}&nbsp; → &nbsp;{product.subcategory || product.name}</div>

      <section className="vd-hero">
        <div className="vd-gallery"><ProductVisual product={product} /></div>
        <div className="vd-pdp-hero-content">
          <p className="vd-eyebrow">{product.category}</p>
          <h1 className="vd-title">{product.name}</h1>
          <div className="vd-meta"><span>{product.level}</span><span>·</span><span>{product.size}</span></div>
          <p className="vd-tagline">A little wild. Very at home.</p>
          <p className="vd-description">{product.description}</p>

          <div className="vd-price-row"><strong className="vd-price">₹{price}</strong><span className="vd-tax">taxes calculated at checkout</span></div>
          <div className="vd-buy-box">
            <div className="vd-buy-row">
              <div className="vd-qty" aria-label="Quantity">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={quantity >= maxQuantity}>+</button>
              </div>
              <button type="button" className={`vd-add ${added ? "is-added" : ""}`} onClick={addToBag} disabled={soldOut}>{soldOut ? "Out of stock" : added ? "Added ✓" : `Add to bag · ₹${price}`}</button>
            </div>
            <div className="vd-buy-foot"><span className="vd-stock">{product.stock <= 5 && product.stock > 0 ? `Only ${product.stock} left` : product.stock > 0 ? `${product.stock} available` : "Unavailable"}</span><span>Secure checkout · Fast delivery</span></div>
          </div>

          <div className="vd-facts">{facts.map(([label, value]) => <div className="vd-fact" key={label}><div className="vd-fact-label">{label}</div><div className="vd-fact-value">{value}</div></div>)}</div>

          <div className="vd-info">
            <div className="vd-tabs">
              <button type="button" className={`vd-tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button>
              <button type="button" className={`vd-tab ${activeTab === "care" ? "active" : ""}`} onClick={() => setActiveTab("care")}>Plant care</button>
              <button type="button" className="vd-tab vd-save" onClick={() => setLiked((value) => !value)}>Save <HeartIcon filled={liked} /></button>
            </div>
            {activeTab === "about" ? <p className="vd-info-copy">Selected for character, resilience and that little feeling of life a room gets when something green takes root.</p> : <div className="vd-care-grid">{careRows.map(([label, value]) => <div className="vd-care-row" key={`${label}-${value}`}><div className="vd-care-label">{label}</div><div className="vd-care-value">{value}</div></div>)}</div>}
          </div>
        </div>
      </section>

      <section className="vd-section-dark"><div className="vd-section-inner"><p className="vd-section-kicker">WHY YOU&apos;LL LOVE IT</p><h2 className="vd-section-title">Make room for a little <em>life.</em></h2><div className="vd-story-grid">
        <article className="vd-story-card"><p className="vd-story-number">01 / PRESENCE</p><h3>Designed to be noticed.</h3><p>Strong foliage and an unmistakable silhouette give your space a confident green focal point.</p></article>
        <article className="vd-story-card"><p className="vd-story-number">02 / RHYTHM</p><h3>Simple routines win.</h3><p>A little consistent care is all it asks in return for months of fresh growth.</p></article>
        <article className="vd-story-card"><p className="vd-story-number">03 / HOME</p><h3>Built for lived-in spaces.</h3><p>Bedrooms, living rooms and work corners all get a little more character with something growing nearby.</p></article>
      </div></div></section>

      {related.length > 0 && <section className="vd-related"><div className="vd-related-inner"><div className="vd-related-head"><div><p className="vd-eyebrow">COMPLETE THE CORNER</p><h2 className="vd-section-title" style={{ color: "#101510", marginBottom: 0 }}>Things that belong <em>together.</em></h2></div><Link href="/shop" className="vd-related-link">Browse all →</Link></div><div className="vd-related-grid">{related.map((item) => { const image = displayImages(item)[0]; return <Link key={item.slug} href={`/shop/${item.slug}`} className="vd-related-card"><div className="vd-related-image">{image ? <img src={image} alt={item.name} loading="lazy" /> : <span />}</div><div className="vd-related-copy"><div className="vd-related-meta">{item.subcategory || item.category}</div><div className="vd-related-name">{item.name}</div><div className="vd-related-bottom"><div className="vd-related-price">₹{Number(item.price).toLocaleString("en-IN")}</div><div className="vd-related-link">View →</div></div></div></Link>; })}</div></div></section>}

      <div className="vd-mobile-bar"><div className="vd-mobile-bar-inner"><div className="vd-mobile-price">₹{price}</div><button type="button" className={`vd-add ${added ? "is-added" : ""}`} onClick={addToBag} disabled={soldOut}>{soldOut ? "Out of stock" : added ? "Added ✓" : "Add to bag"}</button></div></div>
    </main>
  );
}
