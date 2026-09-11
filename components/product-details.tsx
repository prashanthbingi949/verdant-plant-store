"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  product_type?: "Plants" | "Gardening Supplies";
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

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    </svg>
  );
}

function PlantRender({ product }: { product: Product }) {
  const images = Array.from(new Set([product.image_url, ...(product.image_urls || [])].filter(Boolean))) as string[];
  const [active, setActive] = useState(images[0] || "");

  if (images.length) {
    return (
      <div className="flex h-full min-h-[520px] flex-col">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#dde6cf]">
          <div className="absolute inset-x-[18%] bottom-10 h-16 rounded-full bg-black/10 blur-3xl" />
          <img src={active || images[0]} alt={product.name} className="relative h-full w-full object-contain p-8 sm:p-12" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-black/10 bg-[#f4f5e9]/75 p-3">
            {images.map((url) => (
              <button type="button" key={url} onClick={() => setActive(url)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${active === url ? "border-[#202d20]" : "border-transparent"}`}>
                <img src={url} alt="" className="h-full w-full object-contain bg-[#dde6cf] p-1" />
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
    <div className="relative h-full min-h-[520px] w-full bg-[#dde6cf]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(238,246,193,.62),transparent_45%)]" />
      <svg viewBox="0 0 560 560" className="relative h-full w-full" aria-hidden="true">
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
        <path d="M214 444h132" stroke="#ded8c9" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ProductMiniCard({ product }: { product: Product }) {
  const image = product.image_url || product.image_urls?.[0] || null;
  return (
    <article className="group min-w-0">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[1.03/1] overflow-hidden rounded-[28px] border border-black/[.07] bg-[#e5eadb] shadow-[0_14px_38px_rgba(32,45,32,.06)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_55px_rgba(32,45,32,.13)]">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-contain p-7 transition duration-700 group-hover:scale-[1.045]" />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm font-semibold text-[#52634b]">{product.name}</div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-[#f4f5e9]/90 px-3 py-1.5 text-[9px] font-black tracking-[.14em] text-[#202d20] backdrop-blur">{product.level}</span>
          <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#f4f5e9]/90 text-[#202d20] backdrop-blur"><HeartIcon /></span>
        </div>
      </Link>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-black/40">{product.category}</p>
            <Link href={`/shop/${product.slug}`}><h3 className="mt-1 line-clamp-2 text-base font-semibold tracking-[-.025em] group-hover:text-[#52634b]">{product.name}</h3></Link>
          </div>
          <strong className="shrink-0 text-sm">₹{product.price.toLocaleString("en-IN")}</strong>
        </div>
      </div>
    </article>
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

  const maxQuantity = Math.min(20, Math.max(0, product.stock));
  const soldOut = !product.active || product.stock <= 0;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.products)) return;
        const all = data.products as Product[];
        const candidates = all
          .filter((item) => item.active && item.slug !== product.slug)
          .sort((a, b) => {
            const aScore = a.subcategory && product.subcategory && a.subcategory === product.subcategory ? 2 : a.category === product.category ? 1 : 0;
            const bScore = b.subcategory && product.subcategory && b.subcategory === product.subcategory ? 2 : b.category === product.category ? 1 : 0;
            return bScore - aScore || Number(b.featured) - Number(a.featured) || (a.sort_order || 0) - (b.sort_order || 0);
          });
        setRelated(candidates.slice(0, 4));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [product.category, product.slug, product.subcategory]);

  const careRows = useMemo(() => {
    const details = product.details || [];
    return details.length ? details : [
      ["Light", "Bright, indirect light"],
      ["Water", "Let the top layer dry before watering"],
      ["Humidity", "Medium"],
      ["Placement", "A calm, bright corner"],
    ];
  }, [product.details]);

  const handleAdd = () => {
    if (soldOut) return;
    addItem({ id: product.slug, name: product.name, price: product.price, tone: product.tone, size: product.size, category: product.category, image_url: product.image_url || product.image_urls?.[0] || null }, quantity);
    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2500);
  };

  return (
    <main className="min-h-screen bg-[#f4f5e9] text-[#101510]">
      <style>{`
        .verdant-product-page .product-display{background:linear-gradient(145deg,#e4ebd9 0%,#dbe6cf 100%);}
        .verdant-product-page .eyebrow{font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;}
        .verdant-product-page .soft-card{border:1px solid rgba(16,21,16,.09);background:rgba(255,255,255,.34);box-shadow:0 16px 50px rgba(32,45,32,.045);}
        .verdant-product-page .stat-card{transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease;}
        .verdant-product-page .stat-card:hover{transform:translateY(-3px);box-shadow:0 18px 45px rgba(32,45,32,.09);border-color:rgba(32,45,32,.15)}
        .verdant-product-page .purchase{box-shadow:0 14px 34px rgba(32,45,32,.12);}
        .verdant-product-page .sticky-buy{box-shadow:0 -10px 30px rgba(16,21,16,.08);backdrop-filter:blur(16px);}
        @media(max-width:760px){.verdant-product-page .hero-title{font-size:clamp(48px,15vw,74px)}.verdant-product-page .product-display{min-height:420px}.verdant-product-page .sticky-buy{display:block}.verdant-product-page .desktop-purchase{padding-bottom:100px}}
        @media(min-width:761px){.verdant-product-page .sticky-buy{display:none}}
      `}</style>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f5e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-sm font-extrabold tracking-[.14em]">VERDANT</Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/" className="opacity-70 hover:opacity-100">Home</Link>
            <Link href="/shop" className="font-semibold">Shop</Link>
            <Link href="/#care" className="opacity-70 hover:opacity-100">Plant care</Link>
          </nav>
          <Link href="/cart" className="rounded-full bg-[#ddf27a] px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5">View bag</Link>
        </div>
      </header>

      <section className="desktop-purchase mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-black/45">
          <Link href="/shop" className="hover:text-black">Shop</Link><span>→</span><span>{product.category}</span>{product.subcategory && <><span>→</span><span>{product.subcategory}</span></>}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div className="product-display relative overflow-hidden rounded-[38px] border border-black/[.07] shadow-[0_30px_80px_rgba(32,45,32,.09)]">
            <div className="absolute right-5 top-5 z-10">
              <button type="button" onClick={() => setLiked((value) => !value)} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"} className={`grid h-12 w-12 place-items-center rounded-full backdrop-blur-md transition ${liked ? "bg-[#ddf27a] text-[#202d20]" : "bg-[#f4f5e9]/90 text-[#202d20] hover:bg-[#ddf27a]"}`}><HeartIcon filled={liked} /></button>
            </div>
            <PlantRender product={product} />
          </div>

          <div className="flex flex-col justify-center py-3 lg:py-8">
            <p className="eyebrow text-[#52634b]">{product.category}</p>
            <h1 className="hero-title mt-4 max-w-[720px] text-6xl font-semibold leading-[.88] tracking-[-.065em]">{product.name}</h1>
            <p className="mt-4 text-sm font-medium text-black/45">{product.level} <span className="mx-2">·</span> {product.size}</p>

            <div className="mt-8 flex items-end justify-between gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/38">A little wild. Very at home.</p>
                <p className="mt-2 max-w-xl text-base leading-8 text-black/62">{product.description}</p>
              </div>
            </div>

            <div className="mt-8 flex items-end gap-4 border-t border-black/10 pt-7">
              <strong className="text-4xl tracking-[-.05em]">₹{product.price.toLocaleString("en-IN")}</strong>
              <span className="pb-1 text-xs text-black/40">taxes calculated at checkout</span>
            </div>

            {soldOut ? (
              <div className="mt-7 rounded-2xl border border-black/10 bg-black/[.03] px-4 py-3 text-sm font-semibold text-black/55">Currently out of stock</div>
            ) : (
              <div className="purchase mt-7 rounded-[28px] border border-black/[.08] bg-white/35 p-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex h-13 w-fit items-center rounded-full border border-black/10 bg-[#f4f5e9] p-1">
                    <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-10 w-10 rounded-full text-lg hover:bg-black/5">−</button>
                    <span className="w-9 text-center text-sm font-bold">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={quantity >= maxQuantity} className="h-10 w-10 rounded-full text-lg hover:bg-black/5 disabled:opacity-30">+</button>
                  </div>
                  <button type="button" onClick={handleAdd} className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#202d20] px-6 text-sm font-bold text-[#f4f5e9] transition hover:-translate-y-0.5 hover:bg-[#101510]">{added ? "Added ✓" : "Add to bag"}</button>
                </div>
                <div className="mt-3 flex items-center justify-between px-2 text-xs text-black/40">
                  <span>{product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} available`}</span>
                  <span>Secure checkout</span>
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-2">
              <div className="stat-card soft-card rounded-2xl p-4"><p className="eyebrow text-black/35">LIGHT</p><p className="mt-2 text-sm font-semibold">{careRows.find(([label]) => label.toLowerCase() === "light")?.[1] || "Bright indirect"}</p></div>
              <div className="stat-card soft-card rounded-2xl p-4"><p className="eyebrow text-black/35">CARE</p><p className="mt-2 text-sm font-semibold">{product.level}</p></div>
              <div className="stat-card soft-card rounded-2xl p-4"><p className="eyebrow text-black/35">SIZE</p><p className="mt-2 text-sm font-semibold">{product.size}</p></div>
            </div>

            <div className="mt-9 border-t border-black/10">
              <div className="flex gap-7 border-b border-black/10">
                <button type="button" onClick={() => setActiveTab("about")} className={`py-4 text-sm font-bold ${activeTab === "about" ? "border-b-2 border-[#202d20]" : "text-black/45"}`}>About</button>
                <button type="button" onClick={() => setActiveTab("care")} className={`py-4 text-sm font-bold ${activeTab === "care" ? "border-b-2 border-[#202d20]" : "text-black/45"}`}>Plant care</button>
              </div>
              {activeTab === "about" ? (
                <div className="py-6">
                  <p className="max-w-2xl text-sm leading-7 text-black/58">Selected for character, resilience and that little feeling of life a room gets when something green takes root.</p>
                  <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-[#202d20] px-3 py-1.5 text-[10px] font-bold text-[#f4f5e9]">Easy to live with</span><span className="rounded-full border border-black/10 bg-white/40 px-3 py-1.5 text-[10px] font-bold">Good indoor presence</span><span className="rounded-full border border-black/10 bg-white/40 px-3 py-1.5 text-[10px] font-bold">Chosen for character</span></div>
                </div>
              ) : (
                <div className="py-2">{careRows.map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] border-b border-black/7 py-4 text-sm last:border-0"><span className="text-black/42">{label}</span><span className="font-medium">{value}</span></div>)}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#202d20] px-5 py-16 text-[#f4f5e9] sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="eyebrow text-[#ddf27a]">WHY YOU'LL LOVE IT</p>
              <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-6xl">A little piece of <em>life</em> for your space.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Character", "A distinct silhouette that gives a room something to talk about."],
                ["02", "Presence", "Designed to make shelves, corners and desks feel more alive."],
                ["03", "Routine", "Simple care rhythms that fit everyday life rather than fight it."],
              ].map(([num, title, copy]) => (
                <div key={num} className="rounded-[28px] border border-white/10 bg-white/[.05] p-6 transition hover:-translate-y-1 hover:bg-white/[.07]">
                  <p className="text-xs text-white/38">{num}</p><p className="mt-10 text-lg font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-white/58">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[.6fr_1.4fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#52634b]">WHERE IT THRIVES</p>
            <h2 className="mt-4 text-5xl font-semibold leading-[.94] tracking-[-.055em]">Made for spaces that feel <em>lived in.</em></h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {["Bedroom", "Desk", "Living room", "Bright corner"].map((place, index) => (
              <div key={place} className="soft-card rounded-[26px] p-5"><span className="text-[9px] font-black tracking-[.16em] text-black/35">0{index + 1}</span><p className="mt-10 text-base font-semibold">{place}</p><p className="mt-2 text-xs leading-5 text-black/45">A natural place for this plant to become part of the room.</p></div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-black/10 bg-[#eef1e3] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-5"><div><p className="eyebrow text-[#52634b]">COMPLETE THE CORNER</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Goes well with it.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-black/52">Related products from the same part of the Verdant catalogue, chosen to build a more complete plant setup.</p></div><Link href={`/shop${product.subcategory ? `?category=${encodeURIComponent(product.category)}` : ""}`} className="hidden rounded-full border border-black/10 bg-white/50 px-4 py-2 text-xs font-bold sm:inline-flex">Browse more →</Link></div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <ProductMiniCard key={item.slug} product={item} />)}</div>
          </div>
        </section>
      )}

      <div className="sticky-buy fixed inset-x-0 bottom-0 z-50 hidden border-t border-black/10 bg-[#f4f5e9]/92 px-4 py-3 sm:px-5">
        <div className="mx-auto flex max-w-xl items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-xs text-black/45">₹{product.price.toLocaleString("en-IN")}</p></div><button type="button" disabled={soldOut} onClick={handleAdd} className="rounded-full bg-[#202d20] px-5 py-3 text-xs font-bold text-[#f4f5e9] disabled:opacity-40">{added ? "Added ✓" : "Add to bag"}</button></div>
      </div>
    </main>
  );
}
