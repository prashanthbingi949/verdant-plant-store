"use client";

import { useEffect } from "react";

const FAV_KEY = "verdant-favorites-v1";

function readFavorites(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function getHomeWishlistButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("main.verdant-site article.product-card button.wish"));
}

function slugForButton(button: HTMLButtonElement) {
  const card = button.closest<HTMLElement>("article.product-card");
  const link = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
  const href = link?.getAttribute("href") || "";
  return href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
}

function syncButtonState(button: HTMLButtonElement, favorites: string[]) {
  const slug = slugForButton(button);
  if (!slug) return;
  button.classList.toggle("is-liked", favorites.includes(slug));
  const currentLabel = button.getAttribute("aria-label") || "product";
  const productName = currentLabel.replace(/^(Remove|Wishlist|Add)\s+/i, "") || "product";
  button.setAttribute("aria-label", `${favorites.includes(slug) ? "Remove" : "Wishlist"} ${productName}`);
}

export default function HomeWishlistPersistence() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const syncAll = () => {
      const favorites = readFavorites();
      getHomeWishlistButtons().forEach((button) => syncButtonState(button, favorites));
    };

    const observer = new MutationObserver(() => syncAll());
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("storage", syncAll);
    window.addEventListener("verdant-favorites-change", syncAll);
    syncAll();

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncAll);
      window.removeEventListener("verdant-favorites-change", syncAll);
    };
  }, []);

  return null;
}
