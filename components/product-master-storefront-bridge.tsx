"use client";

import { useEffect } from "react";

type ProductMasterView = {
  slug: string;
  name: string;
  personality_line?: string;
  short_description?: string;
  compare_at_price?: number | null;
  price: number;
  image_alt_text?: string;
  image_alt_texts?: string[];
  related_product_slugs?: string[];
};

type RelatedProduct = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
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

function imageFor(product: RelatedProduct) {
  return product.image_url || product.image_urls?.[0] || fallbackImages[product.slug] || "";
}

function formatPrice(value: number) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function applyMasterCopy(product: ProductMasterView) {
  const root = document.querySelector<HTMLElement>(".vd-pdp");
  if (!root) return;

  const tagline = root.querySelector<HTMLElement>(".vd-tagline");
  if (tagline && product.personality_line?.trim()) tagline.textContent = product.personality_line.trim();

  const description = root.querySelector<HTMLElement>(".vd-description");
  if (description && product.short_description?.trim()) description.textContent = product.short_description.trim();

  const mainAlt = product.image_alt_text?.trim() || `Exact product image — ${product.name}`;
  const galleryImages = Array.from(root.querySelectorAll<HTMLImageElement>(".vd-pdp-main-image, .vd-pdp-thumb img, .vd-related-image img"));
  galleryImages.forEach((image, index) => {
    image.alt = index === 0 ? mainAlt : product.image_alt_texts?.[index - 1]?.trim() || product.image_alt_texts?.[0]?.trim() || mainAlt;
  });

  const priceRow = root.querySelector<HTMLElement>(".vd-price-row");
  if (priceRow && product.compare_at_price != null && Number(product.compare_at_price) > Number(product.price) && !priceRow.querySelector(".vd-master-compare")) {
    const compare = document.createElement("span");
    compare.className = "vd-master-compare";
    compare.textContent = formatPrice(Number(product.compare_at_price));
    compare.style.cssText = "font-size:14px;color:rgba(16,21,16,.42);text-decoration:line-through;padding-bottom:7px;";
    priceRow.appendChild(compare);
  }
}

async function applyCuratedRelated(product: ProductMasterView) {
  const slugs = Array.from(new Set(product.related_product_slugs || [])).filter(Boolean).slice(0, 4);
  if (!slugs.length) return;

  const grid = document.querySelector<HTMLElement>(".vd-related-grid");
  if (!grid) return;

  try {
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(data?.products)) return;

    const bySlug = new Map((data.products as RelatedProduct[]).map((item) => [item.slug, item]));
    const curated = slugs.map((slug) => bySlug.get(slug)).filter((item): item is RelatedProduct => Boolean(item && item.slug !== product.slug));
    if (!curated.length) return;

    grid.replaceChildren(...curated.map((item) => {
      const link = document.createElement("a");
      link.href = `/shop/${item.slug}`;
      link.className = "vd-related-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "vd-related-image";
      const src = imageFor(item);
      if (src) {
        const image = document.createElement("img");
        image.src = src;
        image.alt = item.name;
        image.loading = "lazy";
        imageWrap.appendChild(image);
      }

      const copy = document.createElement("div");
      copy.className = "vd-related-copy";
      const meta = document.createElement("div");
      meta.className = "vd-related-meta";
      meta.textContent = item.subcategory || item.category;
      const name = document.createElement("div");
      name.className = "vd-related-name";
      name.textContent = item.name;
      const bottom = document.createElement("div");
      bottom.className = "vd-related-bottom";
      const price = document.createElement("div");
      price.className = "vd-related-price";
      price.textContent = formatPrice(Number(item.price));
      const view = document.createElement("div");
      view.className = "vd-related-link";
      view.textContent = "View →";
      bottom.append(price, view);
      copy.append(meta, name, bottom);
      link.append(imageWrap, copy);
      return link;
    }));
  } catch {
    // Keep the existing automatic related products when curation cannot be loaded.
  }
}

export default function ProductMasterStorefrontBridge({ product }: { product: ProductMasterView }) {
  useEffect(() => {
    const timers = [0, 700].map((delay) => window.setTimeout(() => {
      applyMasterCopy(product);
      void applyCuratedRelated(product);
    }, delay));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [product]);

  return null;
}
