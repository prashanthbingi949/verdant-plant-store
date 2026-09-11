"use client";

import { useEffect } from "react";

type ProductBadge = {
  slug: string;
  badge_text?: string | null;
};

function syncBadges(products: ProductBadge[]) {
  const root = document.querySelector(".verdant-shop-page");
  if (!root) return;

  const bySlug = new Map(products.map((product) => [product.slug, product.badge_text?.trim() || ""]));
  const links = root.querySelectorAll<HTMLAnchorElement>('a[href^="/shop/"]');

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const slug = href.slice("/shop/".length).split(/[?#]/)[0];
    if (!slug || slug === "") return;

    const card = link.closest("article");
    const badge = card?.querySelector<HTMLElement>(".relative > span");
    if (!badge) return;

    const value = bySlug.get(slug) || "";
    badge.dataset.adminBadge = "true";
    badge.textContent = value;
    badge.setAttribute("aria-hidden", value ? "false" : "true");
  });
}

export default function ShopBadgeBridge() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let products: ProductBadge[] = [];

    const run = () => {
      if (!cancelled && products.length) syncBadges(products);
    };

    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.products)) return;
        products = data.products as ProductBadge[];
        run();

        const root = document.querySelector(".verdant-shop-page");
        if (!root) return;
        observer = new MutationObserver(() => run());
        observer.observe(root, { childList: true, subtree: true });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
