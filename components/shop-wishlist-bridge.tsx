"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const FAV_KEY = "verdant-favorites-v1";

function readFavorites(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: string[]) {
  window.localStorage.setItem(FAV_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("verdant-favorites-change"));
}

function getButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("main.verdant-shop-page article button[aria-label*='wishlist' i]"));
}

function slugForButton(button: HTMLButtonElement) {
  const card = button.closest<HTMLElement>("article");
  const link = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
  const href = link?.getAttribute("href") || "";
  return href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
}

function applyVisualState(button: HTMLButtonElement, liked: boolean) {
  button.dataset.verdantLiked = liked ? "true" : "false";
  button.style.background = liked ? "#202d20" : "rgba(244,245,233,.86)";
  button.style.color = liked ? "#ddf27a" : "#202d20";
  button.style.borderColor = liked ? "rgba(32,45,32,.08)" : "rgba(16,21,16,.08)";
  const icon = button.querySelector<SVGElement>("svg");
  if (icon) icon.style.fill = liked ? "currentColor" : "none";
  button.setAttribute("aria-pressed", String(liked));
}

function syncButtons() {
  const favorites = readFavorites();
  getButtons().forEach((button) => {
    const slug = slugForButton(button);
    if (!slug) return;
    const liked = favorites.includes(slug);
    applyVisualState(button, liked);
  });
}

export default function ShopWishlistBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/shop") return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>("main.verdant-shop-page article button[aria-label*='wishlist' i]");
      if (!button) return;

      const slug = slugForButton(button);
      if (!slug) return;

      const favorites = readFavorites();
      const liked = favorites.includes(slug);
      const updated = liked ? favorites.filter((item) => item !== slug) : Array.from(new Set([...favorites, slug]));

      writeFavorites(updated);
      applyVisualState(button, !liked);
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const observer = new MutationObserver(syncButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", onClick, true);
    window.addEventListener("storage", syncButtons);
    window.addEventListener("verdant-favorites-change", syncButtons);
    syncButtons();

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("storage", syncButtons);
      window.removeEventListener("verdant-favorites-change", syncButtons);
    };
  }, [pathname]);

  return null;
}
