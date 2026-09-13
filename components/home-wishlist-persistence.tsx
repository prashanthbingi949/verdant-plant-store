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

function writeFavorites(items: string[]) {
  window.localStorage.setItem(FAV_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("verdant-favorites-change"));
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
  button.setAttribute("aria-label", `${favorites.includes(slug) ? "Remove" : "Wishlist"} ${button.getAttribute("aria-label")?.replace(/^(Remove|Wishlist|Add|Wishlist)\s+/i, "") || "product"}`);
}

export default function HomeWishlistPersistence() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const syncAll = () => {
      const favorites = readFavorites();
      getHomeWishlistButtons().forEach((button) => syncButtonState(button, favorites));
    };

    const handleClick = (event: Event) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>("main.verdant-site article.product-card button.wish");
      if (!button) return;

      const slug = slugForButton(button);
      if (!slug) return;

      const favorites = readFavorites();
      const wasLiked = button.classList.contains("is-liked");
      const updated = wasLiked
        ? favorites.filter((item) => item !== slug)
        : Array.from(new Set([...favorites, slug]));

      writeFavorites(updated);
      syncButtonState(button, updated);
    };

    const observer = new MutationObserver(() => syncAll());
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", handleClick, true);
    window.addEventListener("storage", syncAll);
    window.addEventListener("verdant-favorites-change", syncAll);

    syncAll();

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("storage", syncAll);
      window.removeEventListener("verdant-favorites-change", syncAll);
    };
  }, []);

  return null;
}
