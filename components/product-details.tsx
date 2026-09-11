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
  image_url?: string | null;
  image_urls?: string[];
};

const realProductImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=90",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1400&q=90",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=90",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1400&q=90",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1400&q=90",
  "lavender": "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=1400&q=90",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=1400&q=90",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=1400&q=90",
};

const toneStyles = {
  moss: { glow: "rgba(113,145,80,.26)", accent: "#ddf27a" },
  sage: { glow: "rgba(143,171,125,.25)", accent: "#d8eea3" },
  lime: { glow: "rgba(207,232,106,.27)", accent: "#ddf27a" },
};

function PlantRender({ product }: { product: Product }) {
  const images = Array.from(new Set([product.image_url, ...(product.image_urls || []), realProductImages[product.slug]].filter(Boolean))) as string[];
  const [active, setActive] = useState(images[0] || "");

  if (images.length) {
    return (
      <div className="vd-product-visual-shell">
        <div className="vd-product-visual-glow" />
        <div className="vd-product-visual-stage">
          <img src={active || images[0]} alt={product.name} className="vd-product-main-image" />
          <div className="vd-product-floor-shadow" />
        </div>
        {images.length > 1 && (
          <div className="vd-product-thumbs">
            {images.map((url) => (
              <button
                type="button"
                key={url}
                onClick={() => setActive(url)}
                className={`vd-thumb ${active === url ? "is-active" : ""}`}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const palette = {
    moss: ["#547342", "#78945b", "#c7c2b5"],
    sage: ["#607e54", "#98aa88", "#d4cdbf"],
    lime: ["#8ea64d", "#bbcd67", "#c8c1b0"],
  } as const;
  const [a, b, pot] = palette[product.tone];
  return (
    <div className="vd-product-visual-shell">
      <div className="vd-product-visual-glow" />
      <svg viewBox="0 0 560 560" className="vd-fallback-art" aria-hidden="true">
        <ellipse cx="280" cy="500" rx="132" ry="28" fill="#101510" fillOpacity=".13" />
        <path d="M280 445V205" stroke="#30472d" strokeWidth="13" strokeLinecap="round" />
        <path d="M276 306c-85-78-140-74-187-28 29 80 105 112 187 28Z" fill={a} />
        <path d="M292 270c41-95 106-120 178-96-12 79-73 130-178 96Z" fill={b} />
        <path d="M278 360c-73-52-130-36-169 15 37 55 94 69 169-15Z" fill={b} fillOpacity=".9" />
        <path d="M295 382c59-61 116-64 156-29-28 58-87 82-156 29Z" fill={a} fillOpacity=".92" />
        <path d="M282 204c-13-69 22-123 83-151 31 63 2 121-83 151Z" fill={product.tone === "lime" ? "#d7ed72" : b} />
        <path d="M180 443h200l-19 66H199l-19-66Z" fill={pot} />
        <ellipse cx="280" cy="444" rx="100" ry="18" fill="#9d988a" />
        <ellipse cx="280" cy="440" rx="78" ry="12" fill="#4e4534" />
      </svg>
    </div>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"about" | "care">("about");
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = useMemo(() => product.price * quantity, [product.price, quantity]);
  const maxQuantity = Math.min(20, Math.max(0, product.stock));
  const soldOut = !product.active || product.stock <= 0;
  const tone = toneStyles[product.tone] || toneStyles.moss;

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!Array.isArray(data?.products)) return;
        const candidates = (data.products as Product[]).filter((item) => item.active && item.slug !== product.slug);
        const sameSubcategory = candidates.filter((item) => product.subcategory && item.subcategory === product.subcategory);
        const sameCategory = candidates.filter((item) => item.category === product.category && !sameSubcategory.some((same) => same.slug === item.slug));
        setRelated([...sameSubcategory, ...sameCategory].slice(0, 4));
      })
      .catch(() => {});
  }, [product.category, product.slug, product.subcategory]);

  const handleAdd = () => {
    if (soldOut) return;
    addItem({ id: product.slug, name: product.name, price: product.price, tone: product.tone, size: product.size, category: product.category, image_url: product.image_url || product.image_urls?.[0] || realProductImages[product.slug] || null }, quantity);
    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2200);
  };

  const facts = [
    ["LIGHT", product.level.toLowerCase().includes("easy") ? "Bright, indirect light" : "Bright, filtered light"],
    ["CARE", product.level.replace(/^./, (s) => s.toUpperCase())],
    ["SIZE", product.size],
  ];

  return (
    <main className="vd-product-page" style={{ "--vd-accent": tone.accent, "--vd-glow": tone.glow } as React.CSSProperties}>
      <style>{`
        .vd-product-page{min-height:100vh;background:#f4f5e9;color:#101510;overflow:hidden}
        .vd-product-page .vd-header{position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(16,21,16,.09);background:rgba(244,245,233,.88);backdrop-filter:blur(18px)}
        .vd-product-page .vd-header-inner{max-width:1280px;margin:auto;min-height:72px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
        .vd-product-page .vd-brand{font-size:14px;font-weight:850;letter-spacing:.16em}
        .vd-product-page .vd-nav{display:flex;gap:28px;font-size:12px;font-weight:650;color:rgba(16,21,16,.58)}
        .vd-product-page .vd-nav a:hover{color:#101510}
        .vd-product-page .vd-bag{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:#ddf27a;font-size:12px;font-weight:850}
        .vd-product-page .vd-breadcrumb{max-width:1280px;margin:0 auto;padding:22px 24px 0;color:rgba(16,21,16,.48);font-size:10px;letter-spacing:.08em}
        .vd-product-page .vd-hero{max-width:1280px;margin:auto;padding:22px 24px 84px;display:grid;grid-template-columns:minmax(0,1.03fr) minmax(380px,.97fr);gap:72px;align-items:center}
        .vd-product-page .vd-gallery{min-height:680px;border-radius:36px;background:#e2ead4;position:relative;overflow:hidden;box-shadow:0 24px 70px rgba(32,45,32,.08)}
        .vd-product-page .vd-gallery::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.12),transparent 35%,rgba(16,21,16,.05));pointer-events:none}
        .vd-product-page .vd-gallery .vd-product-visual-shell{height:100%;min-height:680px}
        .vd-product-page .vd-product-visual-shell{position:relative;min-height:560px;height:100%;display:flex;flex-direction:column;justify-content:flex-end}
        .vd-product-page .vd-product-visual-glow{position:absolute;inset:5% 7% 15%;border-radius:50%;background:radial-gradient(circle,var(--vd-glow),transparent 62%);filter:blur(3px)}
        .vd-product-page .vd-product-visual-stage{position:relative;min-height:0;flex:1;display:grid;place-items:center;padding:44px 40px 30px}
        .vd-product-page .vd-product-main-image{position:relative;width:100%;height:100%;max-height:620px;object-fit:contain;mix-blend-mode:multiply;filter:drop-shadow(0 26px 30px rgba(16,21,16,.12));transition:transform .8s cubic-bezier(.2,.7,.2,1)}
        .vd-product-page .vd-gallery:hover .vd-product-main-image{transform:scale(1.025) translateY(-5px)}
        .vd-product-page .vd-product-floor-shadow{position:absolute;left:25%;right:25%;bottom:35px;height:42px;border-radius:50%;background:rgba(16,21,16,.12);filter:blur(20px)}
        .vd-product-page .vd-product-thumbs{position:relative;z-index:2;display:flex;gap:9px;overflow:auto;padding:12px 16px 16px;border-top:1px solid rgba(16,21,16,.08);background:rgba(244,245,233,.5);backdrop-filter:blur(12px)}
        .vd-product-page .vd-thumb{width:64px;height:64px;flex:0 0 64px;padding:6px;border:1px solid transparent;border-radius:14px;background:rgba(251,252,245,.6)}
        .vd-product-page .vd-thumb.is-active{border-color:#202d20;box-shadow:0 0 0 2px rgba(221,242,122,.5)}
        .vd-product-page .vd-thumb img{width:100%;height:100%;object-fit:contain}
        .vd-product-page .vd-fallback-art{position:relative;width:100%;height:100%;padding:46px;filter:drop-shadow(0 24px 24px rgba(16,21,16,.12))}
        .vd-product-page .vd-kicker{font-size:10px;font-weight:850;letter-spacing:.22em;color:#52634b;text-transform:uppercase}
        .vd-product-page .vd-title{margin-top:14px;font-size:clamp(54px,6.3vw,92px);line-height:.86;letter-spacing:-.065em;font-weight:760;max-width:720px}
        .vd-product-page .vd-title em{font-family:Georgia,'Times New Roman',serif;font-weight:400}
        .vd-product-page .vd-tagline{margin-top:18px;font-size:11px;font-weight:850;letter-spacing:.17em;text-transform:uppercase;color:#52634b}
        .vd-product-page .vd-desc{max-width:600px;margin-top:16px;color:rgba(16,21,16,.63);font-size:15px;line-height:1.8}
        .vd-product-page .vd-price-row{display:flex;align-items:flex-end;gap:13px;margin-top:28px;padding-top:24px;border-top:1px solid rgba(16,21,16,.1)}
        .vd-product-page .vd-price{font-size:34px;font-weight:800;letter-spacing:-.04em}
        .vd-product-page .vd-tax{font-size:10px;color:rgba(16,21,16,.4);padding-bottom:5px}
        .vd-product-page .vd-buy-row{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;margin-top:16px}
        .vd-product-page .vd-qty{height:52px;display:flex;align-items:center;border:1px solid rgba(16,21,16,.14);border-radius:999px;background:rgba(255,255,255,.42);padding:5px}
        .vd-product-page .vd-qty button{width:40px;height:40px;border-radius:50%;font-size:19px;color:#202d20;background:transparent}
        .vd-product-page .vd-qty button:hover:not(:disabled){background:#e9eddf}.vd-product-page .vd-qty button:disabled{opacity:.25;cursor:not-allowed}
        .vd-product-page .vd-qty span{width:32px;text-align:center;font-size:13px;font-weight:850}
        .vd-product-page .vd-add{height:52px;border-radius:999px;background:#202d20;color:#f4f5e9;font-size:13px;font-weight:850;transition:transform .24s ease,background .24s ease,box-shadow .24s ease}
        .vd-product-page .vd-add:hover:not(:disabled){transform:translateY(-2px);background:#101510;box-shadow:0 12px 28px rgba(16,21,16,.15)}
        .vd-product-page .vd-add.is-added{background:#ddf27a;color:#101510}
        .vd-product-page .vd-stock-row{display:flex;justify-content:space-between;gap:12px;margin-top:10px;font-size:10px;color:rgba(16,21,16,.43)}
        .vd-product-page .vd-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:34px}
        .vd-product-page .vd-fact{padding:16px 0;border-top:1px solid rgba(16,21,16,.1)}
        .vd-product-page .vd-fact-label{font-size:9px;font-weight:850;letter-spacing:.17em;color:rgba(16,21,16,.42)}
        .vd-product-page .vd-fact-value{margin-top:8px;font-size:12px;font-weight:760}
        .vd-product-page .vd-tabs{margin-top:34px;border-top:1px solid rgba(16,21,16,.1)}
        .vd-product-page .vd-tab-nav{display:flex;gap:26px;border-bottom:1px solid rgba(16,21,16,.1)}
        .vd-product-page .vd-tab{padding:16px 0;font-size:12px;font-weight:800;color:rgba(16,21,16,.45);border-bottom:2px solid transparent}.vd-product-page .vd-tab.is-active{color:#101510;border-color:#202d20}
        .vd-product-page .vd-tab-copy{padding:20px 0;color:rgba(16,21,16,.62);font-size:13px;line-height:1.8}
        .vd-product-page .vd-detail-row{display:grid;grid-template-columns:120px 1fr;padding:13px 0;border-bottom:1px solid rgba(16,21,16,.07);font-size:12px}.vd-product-page .vd-detail-row span:first-child{color:rgba(16,21,16,.42)}
        .vd-product-page .vd-story{background:#202d20;color:#f4f5e9;padding:92px 24px}
        .vd-product-page .vd-story-inner{max-width:1280px;margin:auto}
        .vd-product-page .vd-story-kicker{font-size:10px;font-weight:850;letter-spacing:.2em;color:#ddf27a;text-transform:uppercase}
        .vd-product-page .vd-story-grid{margin-top:28px;display:grid;grid-template-columns:.74fr 1.26fr;gap:60px;align-items:end}
        .vd-product-page .vd-story-title{margin:0;font-size:clamp(42px,5vw,74px);line-height:.93;letter-spacing:-.055em;font-weight:740}.vd-product-page .vd-story-title em{font-family:Georgia,'Times New Roman',serif;font-weight:400}
        .vd-product-page .vd-story-copy{max-width:650px;color:rgba(244,245,233,.68);font-size:15px;line-height:1.8}
        .vd-product-page .vd-story-cards{margin-top:54px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .vd-product-page .vd-story-card{min-height:178px;padding:22px;border:1px solid rgba(244,245,233,.11);border-radius:26px;background:rgba(255,255,255,.045);transition:transform .25s ease,border-color .25s ease,background .25s ease}.vd-product-page .vd-story-card:hover{transform:translateY(-4px);border-color:rgba(221,242,122,.32);background:rgba(255,255,255,.07)}
        .vd-product-page .vd-story-card small{font-size:9px;letter-spacing:.18em;color:rgba(244,245,233,.42)}.vd-product-page .vd-story-card h3{margin-top:14px;font-size:18px}.vd-product-page .vd-story-card p{margin-top:10px;color:rgba(244,245,233,.62);font-size:12px;line-height:1.6}
        .vd-product-page .vd-corner{padding:90px 24px;background:#eef1e2}.vd-product-page .vd-corner-inner{max-width:1280px;margin:auto}.vd-product-page .vd-section-head{display:flex;align-items:end;justify-content:space-between;gap:20px}.vd-product-page .vd-section-kicker{font-size:10px;font-weight:850;letter-spacing:.2em;color:#52634b}.vd-product-page .vd-section-title{margin-top:8px;font-size:clamp(36px,4.2vw,60px);line-height:.95;letter-spacing:-.05em}.vd-product-page .vd-section-note{max-width:360px;color:rgba(16,21,16,.5);font-size:12px;line-height:1.6}
        .vd-product-page .vd-related-grid{margin-top:32px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.vd-product-page .vd-related-card{min-width:0}.vd-product-page .vd-related-image{position:relative;aspect-ratio:1/.95;overflow:hidden;border-radius:24px;background:#dce5cf}.vd-product-page .vd-related-image img{width:100%;height:100%;object-fit:contain;padding:18px;mix-blend-mode:multiply;transition:transform .55s ease}.vd-product-page .vd-related-card:hover .vd-related-image img{transform:scale(1.045)}.vd-product-page .vd-related-meta{padding-top:13px}.vd-product-page .vd-related-category{font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:rgba(16,21,16,.4)}.vd-product-page .vd-related-name{margin-top:6px;font-size:15px;font-weight:780}.vd-product-page .vd-related-price{margin-top:5px;font-size:13px;font-weight:800}
        .vd-product-page .vd-mobile-bar{display:none}
        @media(max-width:1050px){.vd-product-page .vd-hero{gap:46px;grid-template-columns:1fr .9fr}.vd-product-page .vd-title{font-size:clamp(48px,6.4vw,72px)}.vd-product-page .vd-related-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:760px){.vd-product-page .vd-nav{display:none}.vd-product-page .vd-header-inner{min-height:62px;padding:0 16px}.vd-product-page .vd-breadcrumb{padding:15px 16px 0}.vd-product-page .vd-hero{display:block;padding:16px 16px 110px}.vd-product-page .vd-gallery{min-height:480px;border-radius:28px}.vd-product-page .vd-gallery .vd-product-visual-shell{min-height:480px}.vd-product-page .vd-product-visual-stage{padding:26px}.vd-product-page .vd-title{font-size:54px}.vd-product-page .vd-desc{font-size:14px}.vd-product-page .vd-facts{margin-top:26px}.vd-product-page .vd-buy-row{grid-template-columns:1fr}.vd-product-page .vd-qty{width:100%;justify-content:center}.vd-product-page .vd-story{padding:70px 16px}.vd-product-page .vd-story-grid{grid-template-columns:1fr;gap:26px}.vd-product-page .vd-story-cards{grid-template-columns:1fr}.vd-product-page .vd-corner{padding:70px 16px}.vd-product-page .vd-section-head{display:block}.vd-product-page .vd-section-note{margin-top:10px}.vd-product-page .vd-related-grid{grid-template-columns:repeat(2,1fr);gap:18px 10px}.vd-product-page .vd-mobile-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:80;display:flex;align-items:center;gap:10px;padding:8px;border:1px solid rgba(16,21,16,.12);border-radius:20px;background:rgba(244,245,233,.94);backdrop-filter:blur(18px);box-shadow:0 20px 50px rgba(16,21,16,.18)}.vd-product-page .vd-mobile-price{padding:0 8px;font-size:13px;font-weight:850}.vd-product-page .vd-mobile-add{height:44px;flex:1;border-radius:14px;background:#202d20;color:#f4f5e9;font-size:12px;font-weight:850}.vd-product-page .vd-mobile-add.is-added{background:#ddf27a;color:#101510}}
        @media(prefers-reduced-motion:reduce){.vd-product-page *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
        .verdant-dark .vd-product-page{background:#101510;color:#f4f5e9}.verdant-dark .vd-product-page .vd-header{background:rgba(16,21,16,.9);border-color:rgba(244,245,233,.08)}.verdant-dark .vd-product-page .vd-brand,.verdant-dark .vd-product-page .vd-nav,.verdant-dark .vd-product-page .vd-breadcrumb{color:#f4f5e9}.verdant-dark .vd-product-page .vd-breadcrumb,.verdant-dark .vd-product-page .vd-desc,.verdant-dark .vd-product-page .vd-tax,.verdant-dark .vd-product-page .vd-stock-row,.verdant-dark .vd-product-page .vd-fact-label,.verdant-dark .vd-product-page .vd-tab-copy,.verdant-dark .vd-product-page .vd-detail-row span:first-child{color:rgba(244,245,233,.58)}.verdant-dark .vd-product-page .vd-kicker,.verdant-dark .vd-product-page .vd-tagline,.verdant-dark .vd-product-page .vd-section-kicker{color:#bcd47a}.verdant-dark .vd-product-page .vd-gallery,.verdant-dark .vd-product-page .vd-product-visual-shell{background:#1a241b}.verdant-dark .vd-product-page .vd-product-thumbs{background:rgba(16,21,16,.6);border-color:rgba(244,245,233,.09)}.verdant-dark .vd-product-page .vd-qty{background:rgba(32,45,32,.7);border-color:rgba(244,245,233,.16)}.verdant-dark .vd-product-page .vd-qty button{color:#f4f5e9}.verdant-dark .vd-product-page .vd-tabs,.verdant-dark .vd-product-page .vd-tab-nav,.verdant-dark .vd-product-page .vd-fact,.verdant-dark .vd-product-page .vd-price-row{border-color:rgba(244,245,233,.12)}.verdant-dark .vd-product-page .vd-tab{color:rgba(244,245,233,.5)}.verdant-dark .vd-product-page .vd-tab.is-active{color:#f4f5e9;border-color:#ddf27a}.verdant-dark .vd-product-page .vd-corner{background:#152019}.verdant-dark .vd-product-page .vd-section-note,.verdant-dark .vd-product-page .vd-related-category{color:rgba(244,245,233,.5)}.verdant-dark .vd-product-page .vd-related-image{background:#1d2a1f}.verdant-dark .vd-product-page .vd-related-image img{mix-blend-mode:screen}.verdant-dark .vd-product-page .vd-mobile-bar{background:rgba(20,29,21,.95);border-color:rgba(244,245,233,.1)}.verdant-dark .vd-product-page .vd-mobile-price{color:#f4f5e9}
      `}</style>

      <header className="vd-header">
        <div className="vd-header-inner">
          <Link href="/" className="vd-brand">VERDANT</Link>
          <nav className="vd-nav"><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/#care">Plant care</Link></nav>
          <Link href="/cart" className="vd-bag">View bag</Link>
        </div>
      </header>

      <div className="vd-breadcrumb">Shop &nbsp;→&nbsp; {product.category} &nbsp;→&nbsp; {product.subcategory || "Collection"}</div>

      <section className="vd-hero">
        <div className="vd-gallery"><PlantRender product={product} /></div>

        <div>
          <p className="vd-kicker">{product.category}</p>
          <h1 className="vd-title">{product.name}</h1>
          <div className="vd-tagline">A little wild. Very at home.</div>
          <p className="vd-desc">{product.description}</p>

          <div className="vd-price-row"><div className="vd-price">₹{product.price.toLocaleString("en-IN")}</div><div className="vd-tax">Taxes calculated at checkout</div></div>

          {soldOut ? (
            <div className="vd-stock-row"><span>Currently out of stock</span><span>Join the waitlist later</span></div>
          ) : (
            <>
              <div className="vd-buy-row">
                <div className="vd-qty" aria-label="Quantity">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                  <span>{quantity}</span>
                  <button type="button" disabled={quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}>+</button>
                </div>
                <button type="button" onClick={handleAdd} className={`vd-add ${added ? "is-added" : ""}`}>{added ? "Added ✓" : `Add to bag · ₹${total.toLocaleString("en-IN")}`}</button>
              </div>
              <div className="vd-stock-row"><span>{product.stock <= 5 ? `Only ${product.stock} left in stock.` : `${product.stock} available.`}</span><span>Secure checkout · Fast delivery</span></div>
            </>
          )}

          <div className="vd-facts">{facts.map(([label, value]) => <div className="vd-fact" key={label}><div className="vd-fact-label">{label}</div><div className="vd-fact-value">{value}</div></div>)}</div>

          <div className="vd-tabs">
            <div className="vd-tab-nav"><button type="button" className={`vd-tab ${activeTab === "about" ? "is-active" : ""}`} onClick={() => setActiveTab("about")}>About</button><button type="button" className={`vd-tab ${activeTab === "care" ? "is-active" : ""}`} onClick={() => setActiveTab("care")}>Plant care</button><button type="button" className="vd-tab" onClick={() => setLiked((value) => !value)}>{liked ? "Saved ♥" : "Save ♡"}</button></div>
            {activeTab === "about" ? <p className="vd-tab-copy">Selected for character, resilience and that little feeling of life a room gets when something green takes root.</p> : <div className="vd-tab-copy">{product.details.length ? product.details.map(([label, value]) => <div key={`${label}-${value}`} className="vd-detail-row"><span>{label}</span><span>{value}</span></div>) : <p>Bright filtered light, steady watering and a little room to grow.</p>}</div>}
          </div>
        </div>
      </section>

      <section className="vd-story">
        <div className="vd-story-inner">
          <div className="vd-story-kicker">WHY YOU'LL LOVE IT</div>
          <div className="vd-story-grid">
            <h2 className="vd-story-title">Bring a little <em>life</em> into the room.</h2>
            <p className="vd-story-copy">Verdant pieces are chosen to make a space feel calmer, more considered and a little more alive. This one brings shape, texture and an easy sense of character without asking for perfection.</p>
          </div>
          <div className="vd-story-cards">
            <article className="vd-story-card"><small>01 / LIGHT</small><h3>Bright, filtered spaces</h3><p>Place it near a generous window where daylight is soft rather than harsh.</p></article>
            <article className="vd-story-card"><small>02 / RHYTHM</small><h3>Simple routines</h3><p>Water thoughtfully, let the soil breathe and adjust with the seasons.</p></article>
            <article className="vd-story-card"><small>03 / PRESENCE</small><h3>Made to be seen</h3><p>A sculptural focal point for desks, corners, shelves and slower spaces.</p></article>
          </div>
        </div>
      </section>

      <section className="vd-corner">
        <div className="vd-corner-inner">
          <div className="vd-section-head"><div><div className="vd-section-kicker">COMPLETE THE CORNER</div><h2 className="vd-section-title">Build the right little <em>ecosystem.</em></h2></div><p className="vd-section-note">Related products are pulled from the same collection first, then broadened to the category.</p></div>
          {related.length ? (
            <div className="vd-related-grid">
              {related.map((item) => {
                const image = item.image_url || item.image_urls?.[0] || realProductImages[item.slug];
                return <Link href={`/shop/${item.slug}`} className="vd-related-card" key={item.slug}>
                  <div className="vd-related-image">{image ? <img src={image} alt={item.name} loading="lazy" /> : <div className="vd-fallback-related">Verdant</div>}</div>
                  <div className="vd-related-meta"><div className="vd-related-category">{item.subcategory || item.category}</div><div className="vd-related-name">{item.name}</div><div className="vd-related-price">₹{item.price.toLocaleString("en-IN")}</div></div>
                </Link>;
              })}
            </div>
          ) : <p className="vd-section-note" style={{ marginTop: 32 }}>Related products will appear here as the catalogue grows.</p>}
        </div>
      </section>

      {!soldOut && <div className="vd-mobile-bar"><div className="vd-mobile-price">₹{product.price.toLocaleString("en-IN")}</div><button type="button" onClick={handleAdd} className={`vd-mobile-add ${added ? "is-added" : ""}`}>{added ? "Added ✓" : "Add to bag"}</button></div>}
    </main>
  );
}
