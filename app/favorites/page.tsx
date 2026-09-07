"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";

const FAV_KEY = "verdant-favorites-v1";

type Product = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  level: string;
  price: number;
  size: string;
  description: string;
  tone: "moss" | "sage" | "lime";
  stock: number;
  active: boolean;
  image_url?: string | null;
  image_urls?: string[];
};

const fallbackImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=88",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=900&q=88",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=88",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=88",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=88",
  "lavender": "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=900&q=88",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=900&q=88",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=900&q=88",
};

function readFavorites() {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
}

export default function FavoritesPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    fetch("/api/products", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (Array.isArray(data?.products)) setProducts(data.products.filter((item: Product) => item.active));
    }).catch(() => {});
    window.addEventListener("storage", sync);
    window.addEventListener("verdant-favorites-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("verdant-favorites-change", sync);
    };
  }, []);

  const items = useMemo(() => products.filter((product) => favorites.includes(product.slug)), [products, favorites]);

  const remove = (slug: string) => {
    const next = favorites.filter((item) => item !== slug);
    setFavorites(next);
    window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("verdant-favorites-change"));
  };

  return (
    <main className="verdant-favorites-page">
      <style>{`
        .verdant-favorites-page{min-height:100vh;background:#f4f5e9;color:#101510;padding:34px clamp(18px,5vw,70px) 80px;}
        .verdant-favorites-shell{width:min(1180px,100%);margin:0 auto;}
        .verdant-favorites-top{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:12px 0 52px;}
        .verdant-favorites-brand{font-size:15px;font-weight:850;letter-spacing:.14em;}
        .verdant-favorites-links{display:flex;gap:8px;align-items:center;}
        .verdant-favorites-links a{border:1px solid rgba(16,21,16,.12);border-radius:999px;padding:10px 16px;font-size:12px;background:rgba(255,255,255,.3);}
        .verdant-favorites-eyebrow{font-size:9px;font-weight:850;letter-spacing:.2em;color:#536454;text-transform:uppercase;margin:0 0 12px;}
        .verdant-favorites-title{font-size:clamp(50px,8vw,92px);line-height:.9;letter-spacing:-.06em;margin:0 0 14px;}
        .verdant-favorites-copy{max-width:520px;color:rgba(16,21,16,.62);font-size:14px;line-height:1.55;margin:0 0 36px;}
        .verdant-favorites-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;}
        .verdant-favorite-card{min-width:0;}
        .verdant-favorite-image{position:relative;aspect-ratio:1;border-radius:24px;overflow:hidden;background:#e2e8d9;}
        .verdant-favorite-image img{width:100%;height:100%;display:block;object-fit:contain;padding:18px;transition:transform .55s ease;}
        .verdant-favorite-card:hover .verdant-favorite-image img{transform:scale(1.05);}
        .verdant-favorite-remove{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(244,245,233,.85);color:#202d20;}
        .verdant-favorite-meta{padding:12px 2px 0;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}
        .verdant-favorite-meta small{display:block;font-size:9px;color:rgba(16,21,16,.5);margin-bottom:5px;}
        .verdant-favorite-meta h2{font-size:16px;line-height:1.08;margin:0;}
        .verdant-favorite-buy{display:flex;flex-direction:column;align-items:flex-end;gap:7px;}
        .verdant-favorite-buy strong{font-size:14px;}
        .verdant-favorite-buy button{border-radius:999px;background:#202d20;color:#f4f5e9;padding:8px 11px;font-size:9px;font-weight:800;}
        .verdant-favorites-empty{border:1px dashed rgba(16,21,16,.16);border-radius:28px;padding:55px 20px;text-align:center;color:rgba(16,21,16,.58);}
        .verdant-dark .verdant-favorites-page{background:#101510;color:#f4f5e9;}
        .verdant-dark .verdant-favorites-links a{border-color:rgba(244,245,233,.14);color:#f4f5e9;}
        .verdant-dark .verdant-favorites-copy,.verdant-dark .verdant-favorite-meta small{color:rgba(244,245,233,.6);}
        .verdant-dark .verdant-favorite-image{background:#1c281d;}
        .verdant-dark .verdant-favorite-remove{background:rgba(244,245,233,.92);}
        .verdant-dark .verdant-favorite-buy button{background:#ddf27a;color:#101510;}
        @media(max-width:900px){.verdant-favorites-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media(max-width:560px){.verdant-favorites-page{padding:20px 14px 60px}.verdant-favorites-top{padding-bottom:36px}.verdant-favorites-links a{padding:8px 12px}.verdant-favorites-grid{gap:14px}.verdant-favorite-image{border-radius:18px}.verdant-favorite-meta h2{font-size:14px}.verdant-favorite-buy strong{font-size:12px}.verdant-favorite-buy button{padding:7px 9px;font-size:8px;}}
      `}</style>
      <div className="verdant-favorites-shell">
        <div className="verdant-favorites-top">
          <Link href="/" className="verdant-favorites-brand">VERDANT</Link>
          <div className="verdant-favorites-links">
            <Link href="/shop">Shop</Link>
            <Link href="/account">Account</Link>
          </div>
        </div>

        <p className="verdant-favorites-eyebrow">Your saved greens</p>
        <h1 className="verdant-favorites-title">Favourites.</h1>
        <p className="verdant-favorites-copy">Keep the plants and gardening essentials you love close by. Your favourites are saved on this device.</p>

        {items.length ? (
          <div className="verdant-favorites-grid">
            {items.map((product) => {
              const image = product.image_url || product.image_urls?.[0] || fallbackImages[product.slug];
              return (
                <article key={product.slug} className="verdant-favorite-card">
                  <div className="verdant-favorite-image">
                    <Link href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>
                      {image ? <img src={image} alt={product.name} /> : null}
                    </Link>
                    <button type="button" className="verdant-favorite-remove" onClick={() => remove(product.slug)} aria-label={`Remove ${product.name} from favourites`} title="Remove from favourites"><HeartIcon /></button>
                  </div>
                  <div className="verdant-favorite-meta">
                    <div><small>{product.category} · {product.level}</small><h2>{product.name}</h2></div>
                    <div className="verdant-favorite-buy"><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong><button type="button" onClick={() => addItem({ id: product.slug, name: product.name, price: Number(product.price), quantity: 1, tone: product.tone, size: product.size, category: product.category, image_url: image || null }, 1)}>Add +</button></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="verdant-favorites-empty">
            <p>No favourites yet.</p>
            <Link href="/shop">Explore the shop →</Link>
          </div>
        )}
      </div>
    </main>
  );
}
