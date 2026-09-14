"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
    if (!slug) return;

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
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/shop") return;
    let cancelled = false;
    const timers: number[] = [];

    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.products)) return;
        const products = data.products as ProductBadge[];
        syncBadges(products);
        [120, 450, 900].forEach((delay) => {
          timers.push(window.setTimeout(() => {
            if (!cancelled) syncBadges(products);
          }, delay));
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return (
    <style>{`
      .verdant-shop-page .group.min-w-0 > .relative > a > div > span { display: none !important; }
      .verdant-shop-page .group.min-w-0 > .relative > a > div > span[data-admin-badge="true"][aria-hidden="false"] { display: inline-flex !important; }
    `}</style>
  );
}
