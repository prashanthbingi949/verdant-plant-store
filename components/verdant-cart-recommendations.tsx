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
  complete_corner_slugs?: string[];
};

type CartSignal = {
  id: string;
  category: string;
  size: string;
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
  "tools-equipment": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=86",
  "pots-planters": "https://images.unsplash.com/photo-1485955900006-10f4d324a811?auto=format&fit=crop&w=900&q=86",
  "soil-growing-media": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=86",
};

function normalise(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function imageFor(product: Product) {
  const configured = product.image_url || product.image_urls?.[0];
  if (configured) {
    const marker = configured.toLowerCase();
    if (!/placeholder|default-image|image-not-found|no-image/.test(marker)) return configured;
  }

  const category = normalise(product.category);
  const categoryKey = category.includes("tool") ? "tools-equipment" : category.includes("pot") || category.includes("planter") ? "pots-planters" : category.includes("soil") || category.includes("growing") ? "soil-growing-media" : product.slug;
  return fallbackImages[categoryKey] || fallbackImages[product.slug] || null;
}

function recommendationScore(product: Product, cartItems: CartSignal[]) {
  const cartCategories = cartItems.map((item) => normalise(item.category));
  const haystack = normalise(`${product.name} ${product.category} ${product.subcategory || ""} ${product.description}`);
  const candidateCategory = normalise(product.category);
  const isPlant = product.product_type !== "Gardening Supplies" && /plant|succulent|cacti|flower|green/.test(`${candidateCategory} ${haystack}`);
  const isPot = /pot|planter/.test(haystack);
  const isSoil = /soil|growing media/.test(haystack);
  const isNutrient = /fertil|nutrient/.test(haystack);
  const isTool = /tool|trowel|water|pruner|trellis/.test(haystack);
  const isSupply = product.product_type === "Gardening Supplies" || !isPlant;

  let score = Number(product.featured) || 0;

  if (cartCategories.some((value) => /indoor|succulent|cacti|outdoor|flower|plant/.test(value))) {
    if (isPot) score += 12;
    if (isSoil) score += 10;
    if (isNutrient) score += 7;
    if (isTool) score += 4;
  }
  if (cartCategories.some((value) => /pot|planter/.test(value)) && isPlant) score += 13;
  if (cartCategories.some((value) => /soil|growing/.test(value)) && (isPlant || isNutrient)) score += 11;
  if (cartCategories.some((value) => /fertil|nutrient/.test(value)) && (isPlant || isSoil)) score += 9;
  if (cartCategories.some((value) => /tool|trowel|water|trellis/.test(value)) && isPlant) score += 12;
  if (cartCategories.every((value) => /tool|trowel|water|trellis|equipment/.test(value)) && isPlant) score += 18;
  if (cartCategories.every((value) => /indoor|succulent|outdoor|plant|flower|green/.test(value)) && isSupply) score += 10;
  if (cartCategories.some((value) => value && (candidateCategory === value || haystack.includes(value)))) score -= isPlant === cartCategories.some((value) => /plant|indoor|succulent|outdoor/.test(value)) ? 5 : 2;

  return score;
}

function recommendationReason(product: Product, cartItems: CartSignal[]) {
  const categories = cartItems.map((item) => normalise(item.category));
  const haystack = normalise(`${product.name} ${product.category} ${product.subcategory || ""}`);
  if (categories.some((value) => /pot|planter/.test(value)) && /plant|succulent|outdoor|indoor/.test(haystack)) return "A natural companion for your planter";
  if (categories.some((value) => /tool|trowel|water|trellis|equipment/.test(value)) && /plant|succulent|outdoor|indoor/.test(haystack)) return "A little life to go with the kit";
  if (categories.some((value) => /plant|indoor|succulent|outdoor|flower/.test(value)) && /pot|planter/.test(haystack)) return "Gives your plant a home";
  if (categories.some((value) => /plant|indoor|succulent|outdoor|flower/.test(value)) && /soil|growing/.test(haystack)) return "Useful for the next growing cycle";
  if (categories.some((value) => /plant|indoor|succulent|outdoor|flower/.test(value)) && /fertil|nutrient/.test(haystack)) return "A care essential for healthy growth";
  return "Picked to complement your bag";
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
    const signals = items.map((item) => ({ id: item.id, category: item.category, size: item.size }));

    const curatedSlugs = products
      .filter((product) => product.complete_corner_slugs?.length)
      .flatMap((product) => product.complete_corner_slugs || []);
    const curatedRank = new Map<string, number>();
    curatedSlugs.forEach((slug, index) => { if (!curatedRank.has(slug)) curatedRank.set(slug, index); });

    const ranked = products
      .filter((product) => !ids.has(product.slug))
      .map((product) => ({
        product,
        score: recommendationScore(product, signals) + (curatedRank.has(product.slug) ? Math.max(0, 60 - (curatedRank.get(product.slug) || 0)) : 0),
      }))
      .sort((a, b) => b.score - a.score || Number(a.product.price) - Number(b.product.price));

    const picked: Product[] = [];
    const categoryCounts = new Map<string, number>();
    for (const entry of ranked) {
      const key = normalise(entry.product.category);
      const count = categoryCounts.get(key) || 0;
      if (count >= 2) continue;
      picked.push(entry.product);
      categoryCounts.set(key, count + 1);
      if (picked.length === 3) break;
    }
    return picked;
  }, [items, products]);

  if (!items.length || !recommendations.length) return null;

  const add = (product: Product) => {
    addItem({ id: product.slug, name: product.name, price: Number(product.price), tone: product.tone, size: product.size, category: product.category, image_url: imageFor(product) }, 1);
    setAdded(product.slug);
    window.setTimeout(() => setAdded((current) => current === product.slug ? null : current), 1800);
  };

  return (
    <section className="vd-cart-recommendations" aria-labelledby="cart-recommendations-title">
      <div className="vd-cart-recommendations-head">
        <div><p className="vd-cart-recommendations-kicker">COMPLETE THE CORNER</p><h2 id="cart-recommendations-title">Good with what you chose.</h2><p>Useful add-ons picked from the things already in your bag.</p></div>
        <Link href="/shop" className="vd-cart-recommendations-link">Browse all →</Link>
      </div>
      <div className="vd-cart-recommendations-grid">
        {recommendations.map((product) => {
          const image = imageFor(product);
          return <article key={product.slug} className="vd-cart-rec-card">
            <Link href={`/shop/${product.slug}`} className="vd-cart-rec-image">{image ? <img src={image} alt={product.name} loading="lazy" /> : <span className="vd-cart-rec-placeholder" aria-hidden="true">VERDANT</span>}</Link>
            <div className="vd-cart-rec-copy"><p>{product.subcategory || product.category}</p><Link href={`/shop/${product.slug}`}><h3>{product.name}</h3></Link><span className="vd-cart-rec-reason">{recommendationReason(product, items)}</span><div className="vd-cart-rec-foot"><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong><button type="button" onClick={() => add(product)}>{added === product.slug ? "Added ✓" : "Add"}</button></div></div>
          </article>;
        })}
      </div>
    </section>
  );
}
