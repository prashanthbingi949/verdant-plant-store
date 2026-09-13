"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";

const FAV_KEY = "verdant-favorites-v1";
const THEME_KEY = "verdant-theme-v1";
const DELIVERY_THRESHOLD = 1499;

type FinderProduct = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  level: string;
  price: number;
  size: string;
  description: string;
  stock: number;
  active: boolean;
  tone?: "moss" | "sage" | "lime";
  image_url?: string | null;
  image_urls?: string[];
};

type FinderAnswers = {
  light: "bright" | "medium" | "low";
  care: "easy" | "balanced" | "obsessed";
  space: "bedroom" | "desk" | "living" | "balcony";
};

type Mood = {
  id: string;
  title: string;
  copy: string;
  keywords: string[];
};

const MOODS: Mood[] = [
  { id: "calm", title: "Calm Corner", copy: "Soft, easy greens for quiet spaces.", keywords: ["snake", "jade", "aloe", "easy", "succulent"] },
  { id: "statement", title: "Statement Space", copy: "Plants with presence and personality.", keywords: ["monstera", "bird", "fiddle", "statement", "tropical"] },
  { id: "tiny", title: "Tiny Jungle", copy: "Desk-sized greens for small moments.", keywords: ["tabletop", "small", "desk", "succulent", "6\"", "hanging"] },
  { id: "sunny", title: "Sunny Balcony", copy: "Bright-loving plants for open air.", keywords: ["outdoor", "lavender", "flower", "sunny", "balcony", "seasonal"] },
];

const FALLBACK_IMAGES: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=88",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=1000&q=88",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=88",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1000&q=88",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1000&q=88",
  lavender: "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=1000&q=88",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=1000&q=88",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=1000&q=88",
};

function readFavorites(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: string[]) {
  window.localStorage.setItem(FAV_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("verdant-favorites-change"));
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    </svg>
  );
}

function scoreProduct(product: FinderProduct, answers: FinderAnswers) {
  const text = `${product.slug} ${product.name} ${product.category} ${product.subcategory || ""} ${product.level} ${product.description} ${product.size}`.toLowerCase();
  let score = 0;

  if (answers.care === "easy") score += product.level.toLowerCase().includes("easy") ? 5 : 0;
  if (answers.care === "balanced") score += product.level.toLowerCase().includes("medium") ? 4 : product.level.toLowerCase().includes("easy") ? 3 : 0;
  if (answers.care === "obsessed") score += 3;

  if (answers.light === "bright") score += /(bright|sunny|filtered|outdoor|balcony)/.test(text) ? 4 : 1;
  if (answers.light === "medium") score += /(medium|indirect|filtered|indoor)/.test(text) ? 4 : 1;
  if (answers.light === "low") score += /(snake|low|shade|resilient)/.test(text) ? 5 : 1;

  if (answers.space === "bedroom") score += /(snake|jade|aloe|indoor|succulent)/.test(text) ? 4 : 1;
  if (answers.space === "desk") score += /(tabletop|small|succulent|6\"|desk|hanging)/.test(text) ? 5 : 1;
  if (answers.space === "living") score += /(monstera|bird|fiddle|tropical|statement|indoor)/.test(text) ? 5 : 1;
  if (answers.space === "balcony") score += /(outdoor|lavender|flower|sunny|balcony|seasonal)/.test(text) ? 5 : 1;

  return score;
}

function whyThisPlant(product: FinderProduct, answers: FinderAnswers) {
  const reasons: string[] = [];
  const text = `${product.slug} ${product.name} ${product.category} ${product.subcategory || ""} ${product.level} ${product.description}`.toLowerCase();
  if (answers.care === "easy" && product.level.toLowerCase().includes("easy")) reasons.push("easy-care fit");
  if (answers.light === "low" && /snake|low|resilient/.test(text)) reasons.push("great for lower light");
  if (answers.light === "bright" && /bright|sunny|outdoor|balcony/.test(text)) reasons.push("loves bright spaces");
  if (answers.space === "desk" && /tabletop|succulent|small|desk/.test(text)) reasons.push("works beautifully on a desk");
  if (answers.space === "living" && /monstera|bird|fiddle|statement|tropical/.test(text)) reasons.push("adds a strong living-room presence");
  if (answers.space === "balcony" && /outdoor|lavender|flower|balcony/.test(text)) reasons.push("made for sunny outdoor corners");
  if (!reasons.length) reasons.push("a strong match for your space");
  return reasons.slice(0, 2).join(" · ");
}

function FinderModal({ onClose }: { onClose: () => void }) {
  const { addItem } = useCart();
  const [mode, setMode] = useState<"finder" | "mood">("finder");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FinderAnswers>({ light: "medium", care: "balanced", space: "living" });
  const [products, setProducts] = useState<FinderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<Mood | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        setProducts(Array.isArray(data?.products) ? data.products.filter((item: FinderProduct) => item.active && item.stock > 0) : []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .sort((a, b) => scoreProduct(b, answers) - scoreProduct(a, answers))
      .slice(0, 3);
  }, [answers, products]);

  const moodMatches = useMemo(() => {
    if (!mood) return [];
    return products
      .map((product) => {
        const text = `${product.slug} ${product.name} ${product.category} ${product.subcategory || ""} ${product.level} ${product.description} ${product.size}`.toLowerCase();
        const score = mood.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 2 : 0), 0);
        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0)
      .slice(0, 4)
      .map((item) => item.product);
  }, [mood, products]);

  const activeResults = mode === "finder" ? (step >= 3 ? matches : []) : moodMatches;

  const add = (product: FinderProduct) => {
    addItem({
      id: product.slug,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      tone: product.tone || "moss",
      size: product.size,
      category: product.category,
      image_url: product.image_url || product.image_urls?.[0] || FALLBACK_IMAGES[product.slug] || null,
    }, 1);
  };

  const optionButton = (selected: boolean) => ({
    border: selected ? "1px solid #202d20" : "1px solid rgba(16,21,16,.1)",
    background: selected ? "#202d20" : "rgba(255,255,255,.65)",
    color: selected ? "#f4f5e9" : "#101510",
  });

  return (
    <div className="vd-wow-backdrop" role="dialog" aria-modal="true" aria-label="Verdant plant discovery">
      <div className="vd-wow-modal">
        <div className="vd-wow-head">
          <div>
            <p className="vd-wow-kicker">THE VERDANT DISCOVERY ROOM</p>
            <h2>Let&apos;s find something <em>good.</em></h2>
          </div>
          <button type="button" className="vd-wow-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="vd-wow-modes">
          <button type="button" onClick={() => { setMode("finder"); setMood(null); }} style={optionButton(mode === "finder")}>Find My Plant</button>
          <button type="button" onClick={() => { setMode("mood"); setStep(0); }} style={optionButton(mode === "mood")}>Shop by Mood</button>
        </div>

        {loading ? (
          <div className="vd-wow-loading">Curating your green shortlist…</div>
        ) : mode === "finder" ? (
          <>
            {step === 0 && <FinderQuestion label="How much light do you get?" options={[
              ["bright", "☀️", "Bright"], ["medium", "🌤️", "Medium"], ["low", "🌙", "Low"],
            ]} selected={answers.light} onSelect={(value) => { setAnswers((current) => ({ ...current, light: value as FinderAnswers["light"] })); setStep(1); }} />}
            {step === 1 && <FinderQuestion label="How much care do you enjoy?" options={[
              ["easy", "🫶", "Almost none"], ["balanced", "🌿", "A little love"], ["obsessed", "🌳", "I talk to my plants"],
            ]} selected={answers.care} onSelect={(value) => { setAnswers((current) => ({ ...current, care: value as FinderAnswers["care"] })); setStep(2); }} />}
            {step === 2 && <FinderQuestion label="Where will it live?" options={[
              ["bedroom", "🛏️", "Bedroom"], ["desk", "💻", "Desk"], ["living", "🛋️", "Living room"], ["balcony", "🌤️", "Balcony"],
            ]} selected={answers.space} onSelect={(value) => { setAnswers((current) => ({ ...current, space: value as FinderAnswers["space"] })); setStep(3); }} />}

            {step >= 3 && (
              <div className="vd-wow-results">
                <div className="vd-wow-result-head">
                  <div><p className="vd-wow-kicker">YOUR MATCHES</p><h3>These three feel right.</h3></div>
                  <button type="button" className="vd-wow-reset" onClick={() => setStep(0)}>Start again</button>
                </div>
                <div className="vd-wow-product-grid">{activeResults.map((product) => (
                  <article className="vd-wow-product" key={product.slug}>
                    <Link href={`/shop/${product.slug}`} onClick={onClose} className="vd-wow-product-media">
                      <img src={product.image_url || product.image_urls?.[0] || FALLBACK_IMAGES[product.slug] || FALLBACK_IMAGES["monstera-deliciosa"]} alt={product.name} />
                    </Link>
                    <div className="vd-wow-product-copy"><div><p>{product.category}</p><h4>{product.name}</h4><span>{whyThisPlant(product, answers)}</span></div><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong></div>
                    <div className="vd-wow-product-actions"><Link href={`/shop/${product.slug}`} onClick={onClose}>View plant</Link><button type="button" onClick={() => add(product)}>Add +</button></div>
                  </article>
                ))}</div>
              </div>
            )}
          </>
        ) : (
          <div className="vd-wow-mood-area">
            {!mood ? (
              <>
                <p className="vd-wow-mood-intro">Choose the feeling you&apos;re creating.</p>
                <div className="vd-wow-mood-grid">{MOODS.map((item) => <button type="button" key={item.id} className="vd-wow-mood-card" onClick={() => setMood(item)}><span>{item.id === "calm" ? "◌" : item.id === "statement" ? "✦" : item.id === "tiny" ? "•" : "☀"}</span><strong>{item.title}</strong><small>{item.copy}</small></button>)}</div>
              </>
            ) : (
              <div className="vd-wow-results"><div className="vd-wow-result-head"><div><p className="vd-wow-kicker">SHOP BY MOOD</p><h3>{mood.title}</h3><p className="vd-wow-subline">{mood.copy}</p></div><button type="button" className="vd-wow-reset" onClick={() => setMood(null)}>Change mood</button></div><div className="vd-wow-product-grid">{moodMatches.map((product) => <article className="vd-wow-product" key={product.slug}><Link href={`/shop/${product.slug}`} onClick={onClose} className="vd-wow-product-media"><img src={product.image_url || product.image_urls?.[0] || FALLBACK_IMAGES[product.slug] || FALLBACK_IMAGES["monstera-deliciosa"]} alt={product.name} /></Link><div className="vd-wow-product-copy"><div><p>{product.category}</p><h4>{product.name}</h4><span>{product.level}</span></div><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong></div><div className="vd-wow-product-actions"><Link href={`/shop/${product.slug}`} onClick={onClose}>View plant</Link><button type="button" onClick={() => add(product)}>Add +</button></div></article>)}</div></div>
            )}
          </div>
        )}
      </div>
      <style>{`
        .vd-wow-backdrop{position:fixed;inset:0;z-index:3000;background:rgba(16,21,16,.28);backdrop-filter:blur(10px);display:grid;place-items:center;padding:22px;animation:vd-fade .18s ease both}
        .vd-wow-modal{width:min(980px,100%);max-height:min(820px,calc(100vh - 44px));overflow:auto;border:1px solid rgba(16,21,16,.12);border-radius:32px;background:#f4f5e9;color:#101510;box-shadow:0 35px 100px rgba(16,21,16,.25);padding:28px;animation:vd-pop .25s cubic-bezier(.2,.8,.2,1) both}
        .vd-wow-head{display:flex;justify-content:space-between;gap:22px;align-items:flex-start}.vd-wow-kicker{margin:0;color:#52634b;font-size:9px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}.vd-wow-head h2{margin:8px 0 0;font-size:clamp(32px,5vw,56px);line-height:.95;letter-spacing:-.055em}.vd-wow-head h2 em{font-family:Georgia,'Times New Roman',serif;font-weight:400}.vd-wow-close{width:42px;height:42px;border:1px solid rgba(16,21,16,.1);border-radius:50%;background:#fff;color:#101510;font-size:24px;line-height:1}.vd-wow-modes{display:flex;gap:8px;margin:24px 0 22px;flex-wrap:wrap}.vd-wow-modes button{border-radius:999px;padding:10px 15px;font-size:12px;font-weight:850}.vd-wow-question{padding:14px 0 4px}.vd-wow-question h3{margin:0;font-size:clamp(26px,4vw,40px);letter-spacing:-.04em}.vd-wow-question .vd-wow-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:22px}.vd-wow-option{min-height:110px;border-radius:24px;padding:18px;text-align:left;font-size:15px;font-weight:900;transition:transform .2s ease,box-shadow .2s ease}.vd-wow-option span{display:block;font-size:27px;margin-bottom:18px}.vd-wow-option:hover{transform:translateY(-2px);box-shadow:0 15px 32px rgba(32,45,32,.09)}.vd-wow-results{padding-top:6px}.vd-wow-result-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:16px}.vd-wow-result-head h3{margin:6px 0 0;font-size:28px;letter-spacing:-.04em}.vd-wow-subline{margin:6px 0 0;color:rgba(16,21,16,.55);font-size:13px}.vd-wow-reset{border:1px solid rgba(16,21,16,.1);background:#fff;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:800}.vd-wow-product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.vd-wow-product{border:1px solid rgba(16,21,16,.09);border-radius:24px;background:rgba(255,255,255,.5);overflow:hidden;min-width:0}.vd-wow-product-media{display:block;aspect-ratio:1;background:#e7ecdf;overflow:hidden}.vd-wow-product-media img{width:100%;height:100%;object-fit:contain;padding:18px;transition:transform .6s ease}.vd-wow-product:hover .vd-wow-product-media img{transform:scale(1.045)}.vd-wow-product-copy{display:flex;justify-content:space-between;gap:10px;padding:14px 14px 6px}.vd-wow-product-copy p{margin:0 0 4px;font-size:9px;color:rgba(16,21,16,.46)}.vd-wow-product-copy h4{margin:0;font-size:16px;line-height:1.05}.vd-wow-product-copy span{display:block;margin-top:7px;font-size:10px;line-height:1.45;color:rgba(16,21,16,.55)}.vd-wow-product-copy strong{font-size:13px;white-space:nowrap}.vd-wow-product-actions{display:flex;gap:8px;padding:10px 14px 14px}.vd-wow-product-actions a,.vd-wow-product-actions button{flex:1;border:0;border-radius:999px;padding:9px 10px;font-size:10px;font-weight:850;text-align:center}.vd-wow-product-actions a{background:#202d20;color:#f4f5e9}.vd-wow-product-actions button{background:#ddf27a;color:#101510}.vd-wow-mood-intro{margin:8px 0 16px;color:rgba(16,21,16,.55);font-size:13px}.vd-wow-mood-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.vd-wow-mood-card{padding:22px;border:1px solid rgba(16,21,16,.09);border-radius:26px;background:#fff;text-align:left;transition:.22s ease}.vd-wow-mood-card:hover{transform:translateY(-3px);box-shadow:0 18px 38px rgba(32,45,32,.1);border-color:rgba(32,45,32,.18)}.vd-wow-mood-card span{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#ddf27a;color:#202d20;font-size:20px;margin-bottom:16px}.vd-wow-mood-card strong{display:block;font-size:20px;letter-spacing:-.03em}.vd-wow-mood-card small{display:block;margin-top:7px;font-size:11px;line-height:1.5;color:rgba(16,21,16,.55)}.vd-wow-loading{padding:80px 10px;text-align:center;color:rgba(16,21,16,.55);font-size:13px}
        .vd-wow-free{position:fixed;right:20px;top:88px;z-index:110;max-width:320px;border:1px solid rgba(16,21,16,.09);border-radius:20px;background:rgba(244,245,233,.95);box-shadow:0 15px 40px rgba(32,45,32,.11);backdrop-filter:blur(14px);padding:12px 14px;color:#101510}.vd-wow-free-row{display:flex;justify-content:space-between;gap:14px;font-size:10px;font-weight:800}.vd-wow-free-track{height:6px;margin-top:9px;border-radius:999px;background:#dfe5d6;overflow:hidden}.vd-wow-free-fill{height:100%;border-radius:999px;background:#202d20;transition:width .35s ease}.vd-wow-free small{display:block;margin-top:7px;font-size:9px;color:rgba(16,21,16,.5)}
        @keyframes vd-fade{from{opacity:0}to{opacity:1}}@keyframes vd-pop{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
        @media(max-width:760px){.vd-wow-backdrop{padding:10px}.vd-wow-modal{padding:20px;border-radius:26px;max-height:calc(100vh - 20px)}.vd-wow-question .vd-wow-options{grid-template-columns:1fr}.vd-wow-product-grid{grid-template-columns:1fr}.vd-wow-mood-grid{grid-template-columns:1fr}.vd-wow-free{right:12px;left:12px;top:auto;bottom:14px;max-width:none}.vd-wow-head h2{font-size:36px}}
        @media(prefers-reduced-motion:reduce){.vd-wow-backdrop,.vd-wow-modal{animation:none}.vd-wow-option,.vd-wow-product-media img,.vd-wow-mood-card{transition:none}}
      `}</style>
    </div>
  );
}

function FinderQuestion({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: [string, string, string][];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="vd-wow-question">
      <p className="vd-wow-kicker">A FEW QUICK QUESTIONS</p>
      <h3>{label}</h3>
      <div className="vd-wow-options">
        {options.map(([value, emoji, title]) => (
          <button
            type="button"
            key={value}
            className="vd-wow-option"
            onClick={() => onSelect(value)}
            style={{
              border: selected === value ? "1px solid #202d20" : "1px solid rgba(16,21,16,.1)",
              background: selected === value ? "#202d20" : "rgba(255,255,255,.65)",
              color: selected === value ? "#f4f5e9" : "#101510",
            }}
          >
            <span>{emoji}</span>{title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SiteUtilities() {
  const pathname = usePathname();
  const { subtotal } = useCart();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [finderOpen, setFinderOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.removeItem(THEME_KEY);
      document.documentElement.classList.remove("verdant-dark");
      document.documentElement.style.colorScheme = "light";
      setFavoriteCount(readFavorites().length);
    } catch {
      setFavoriteCount(0);
    }

    if (pathname !== "/shop") return;

    const handleFavoriteClick = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as Element | null;
      const button = target?.closest<HTMLButtonElement>('button[aria-label*="wishlist"]');
      if (!button) return;

      window.requestAnimationFrame(() => {
        const card = button.closest<HTMLElement>("article");
        const link = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
        const href = link?.getAttribute("href") || "";
        const slug = href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
        if (!slug) return;

        const next = readFavorites();
        const label = button.getAttribute("aria-label")?.toLowerCase() || "";
        const liked = label.startsWith("remove ");
        const updated = liked ? next.filter((item) => item !== slug) : Array.from(new Set([...next, slug]));
        writeFavorites(updated);
        setFavoriteCount(updated.length);
      });
    };

    const sync = () => setFavoriteCount(readFavorites().length);
    document.addEventListener("click", handleFavoriteClick, true);
    window.addEventListener("storage", sync);
    window.addEventListener("verdant-favorites-change", sync);

    return () => {
      document.removeEventListener("click", handleFavoriteClick, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener("verdant-favorites-change", sync);
    };
  }, [pathname]);

  useEffect(() => {
    if (!finderOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFinderOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [finderOpen]);

  const progress = Math.min(100, (subtotal / DELIVERY_THRESHOLD) * 100);
  const deliveryCopy = subtotal >= DELIVERY_THRESHOLD
    ? "You have unlocked FREE delivery."
    : `₹${Math.max(0, DELIVERY_THRESHOLD - subtotal).toLocaleString("en-IN")} away from FREE delivery.`;

  const showFinder = pathname === "/shop";
  const showDelivery = pathname === "/cart" || pathname === "/checkout";

  return (
    <>
      {showFinder && (
        <>
          <div className="vd-wow-launcher">
            <button type="button" onClick={() => setFinderOpen(true)} className="vd-wow-launcher-main">
              <span className="vd-wow-launcher-icon">✦</span>
              <span><small>VERDANT DISCOVERY</small><strong>Find my plant</strong></span>
            </button>
          </div>
          <style>{`
            .vd-wow-launcher{position:fixed;left:20px;bottom:20px;z-index:108}.vd-wow-launcher-main{display:flex;align-items:center;gap:10px;border:1px solid rgba(16,21,16,.1);border-radius:999px;background:rgba(244,245,233,.94);color:#202d20;box-shadow:0 12px 34px rgba(32,45,32,.12);backdrop-filter:blur(14px);padding:8px 14px 8px 8px;text-align:left;transition:.22s ease}.vd-wow-launcher-main:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(32,45,32,.16)}.vd-wow-launcher-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#ddf27a;font-size:17px}.vd-wow-launcher-main small,.vd-wow-launcher-main strong{display:block}.vd-wow-launcher-main small{font-size:7px;letter-spacing:.18em;font-weight:900;color:#667462}.vd-wow-launcher-main strong{margin-top:2px;font-size:12px}@media(max-width:760px){.vd-wow-launcher{left:12px;bottom:12px}.vd-wow-launcher-main{padding-right:12px}}
          `}</style>
        </>
      )}

      {showDelivery && subtotal > 0 && (
        <div className="vd-wow-free" aria-live="polite">
          <div className="vd-wow-free-row"><span>VERDANT DELIVERY</span><span>{Math.round(progress)}%</span></div>
          <div className="vd-wow-free-track"><div className="vd-wow-free-fill" style={{ width: `${progress}%` }} /></div>
          <small>{deliveryCopy}</small>
        </div>
      )}

      {showFinder && (
        <Link href="/favorites" aria-label={`Open favourites${favoriteCount ? `, ${favoriteCount} saved` : ""}`} className="verdant-top-favorites">
          <HeartIcon />
          {favoriteCount > 0 && <span className="verdant-top-favorites-count">{favoriteCount > 99 ? "99+" : favoriteCount}</span>}
        </Link>
      )}

      {finderOpen && showFinder && <FinderModal onClose={() => setFinderOpen(false)} />}

      <style>{`
        .verdant-top-favorites{position:fixed;top:16px;right:102px;z-index:115;width:44px;height:44px;display:grid;place-items:center;border:1px solid rgba(16,21,16,.1);border-radius:999px;background:rgba(244,245,233,.96);color:#202d20;box-shadow:0 8px 24px rgba(16,21,16,.08);backdrop-filter:blur(14px);transition:transform .2s ease,background .2s ease,box-shadow .2s ease}.verdant-top-favorites:hover{transform:translateY(-1px);background:#ddf27a;box-shadow:0 12px 28px rgba(32,45,32,.13)}.verdant-top-favorites-count{position:absolute;right:-2px;top:-3px;min-width:17px;height:17px;display:grid;place-items:center;padding:0 4px;border-radius:999px;background:#202d20;color:#f4f5e9;font-size:9px;font-weight:900;line-height:1;border:2px solid #f4f5e9}@media(max-width:760px){.verdant-top-favorites{top:10px;right:74px;width:44px;height:44px}.verdant-top-favorites-count{right:-2px;top:-4px}}
      `}</style>
    </>
  );
}
