"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  product_type?: "Plants" | "Gardening Supplies";
  level: string;
  price: number;
  size: string;
  description: string;
  tone: "moss" | "sage" | "lime";
  stock: number;
  active: boolean;
  featured?: boolean;
  image_url?: string | null;
  image_urls?: string[];
};

const fallbackImages: Record<string, string> = {
  "monstera-deliciosa": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=86",
  "snake-plant": "https://images.unsplash.com/photo-1611211232932-da3113c5b960?auto=format&fit=crop&w=900&q=86",
  "jade-plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=86",
  "bird-of-paradise": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=86",
  "string-of-pearls": "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=86",
  lavender: "https://images.unsplash.com/photo-1451336819701-5a83f6534292?auto=format&fit=crop&w=900&q=86",
  "fiddle-leaf-fig": "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=900&q=86",
  "aloe-vera": "https://images.unsplash.com/photo-1513360994626-fc3639d1cc82?auto=format&fit=crop&w=900&q=86",
};

function imageFor(product: Product) {
  return product.image_url || product.image_urls?.[0] || fallbackImages[product.slug] || null;
}

function recommendationScore(product: Product, cartItems: { category: string; subcategory?: string; id: string }[]) {
  const categories = cartItems.map((item) => item.category.toLowerCase());
  const subcategories = cartItems.map((item) => (item.subcategory || "").toLowerCase());
  const haystack = `${product.name} ${product.category} ${product.subcategory || ""} ${product.description}`.toLowerCase();
  let score = Number(product.featured) || 0;

  if (subcategories.some((value) => value && haystack.includes(value))) score += 7;
  if (categories.some((value) => value && haystack.includes(value))) score += 5;

  if (categories.some((value) => /indoor/.test(value)) && /pot|planter|soil|fertil|tool/.test(haystack)) score += 6;
  if (categories.some((value) => /succulent|cacti/.test(value)) && /pot|soil|fertil/.test(haystack)) score += 6;
  if (categories.some((value) => /outdoor|flower/.test(value)) && /soil|fertil|tool|pot|planter/.test(haystack)) score += 6;
  if (categories.some((value) => /pot|planter/.test(value)) && /indoor|succulent|outdoor|plant/.test(haystack)) score += 6;
  if (categories.some((value) => /soil|growing/.test(value)) && /fertil|nutrient|indoor|succulent|outdoor/.test(haystack)) score += 5;

  return score;
}

export default function VerdantCartRecommendations() {
  const { items, addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!Array.isArray(data?.products)) return;
        setProducts(data.products.filter((product: Product) => product.active && product.stock > 0));
      })
      .catch(() => setProducts([]));
  }, []);

  const recommendations = useMemo(() => {
    const ids = new Set(items.map((item) => item.id));
    return products
      .filter((product) => !ids.has(product.slug))
      .map((product) => ({ product, score: recommendationScore(product, items) }))
      .sort((a, b) => b.score - a.score || Number(a.product.price) - Number(b.product.price))
      .slice(0, 3)
      .map(({ product }) => product);
  }, [items, products]);

  if (!items.length || !recommendations.length) return null;

  const add = (product: Product) => {
    addItem({
      id: product.slug,
      name: product.name,
      price: Number(product.price),
      tone: product.tone,
      size: product.size,
      category: product.category,
      image_url: imageFor(product),
    }, 1);
    setAdded(product.slug);
    window.setTimeout(() => setAdded((current) => current === product.slug ? null : current), 1800);
  };

  return (
    <section className="vd-cart-recommendations" aria-labelledby="cart-recommendations-title">
      <div className="vd-cart-recommendations-head">
        <div>
          <p className="vd-cart-recommendations-kicker">COMPLETE THE CORNER</p>
          <h2 id="cart-recommendations-title">Good with what you chose.</h2>
          <p>Useful add-ons picked from the things already in your bag.</p>
        </div>
        <Link href="/shop" className="vd-cart-recommendations-link">Browse all →</Link>
      </div>

      <div className="vd-cart-recommendations-grid">
        {recommendations.map((product) => {
          const image = imageFor(product);
          return (
            <article key={product.slug} className="vd-cart-rec-card">
              <Link href={`/shop/${product.slug}`} className="vd-cart-rec-image">
                {image ? <img src={image} alt={product.name} loading="lazy" /> : <span />}
              </Link>
              <div className="vd-cart-rec-copy">
                <p>{product.subcategory || product.category}</p>
                <Link href={`/shop/${product.slug}`}><h3>{product.name}</h3></Link>
                <span>{product.size} · {product.level}</span>
                <div className="vd-cart-rec-foot">
                  <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
                  <button type="button" onClick={() => add(product)}>{added === product.slug ? "Added ✓" : "Add"}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
