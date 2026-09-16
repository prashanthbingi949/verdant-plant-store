"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const FAV_KEY = "verdant-favorites-v1";
export const FAV_EVENT = "verdant-favorites-change";

export function readFavoriteSlugs(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeFavoriteSlugs(slugs: string[]) {
  const unique = Array.from(new Set(slugs.filter(Boolean)));
  window.localStorage.setItem(FAV_KEY, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent(FAV_EVENT, { detail: { slugs: unique } }));
  return unique;
}

export function toggleFavoriteSlug(slug: string) {
  if (!slug) return false;
  const favorites = readFavoriteSlugs();
  const liked = favorites.includes(slug);
  writeFavoriteSlugs(liked ? favorites.filter((item) => item !== slug) : [...favorites, slug]);
  return !liked;
}

function slugFromButton(button: HTMLButtonElement): string {
  const explicit = button.getAttribute("data-verdant-favorite-slug")?.trim();
  if (explicit) return explicit;

  const card = button.closest<HTMLElement>("article");
  const link = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
  const href = link?.getAttribute("href") || "";
  return href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
}

function favoriteSelector() {
  // Only bridge legacy/global shop wishlist buttons. Home and PDP own their React state.
  return "main.verdant-shop-page article button[aria-label*='wishlist' i]";
}

function applyButtonState(button: HTMLButtonElement, liked: boolean) {
  button.dataset.verdantLiked = liked ? "true" : "false";
  button.setAttribute("aria-pressed", String(liked));
  button.style.background = liked ? "#202d20" : "rgba(244,245,233,.86)";
  button.style.color = liked ? "#ddf27a" : "#202d20";
  button.style.borderColor = liked ? "rgba(32,45,32,.08)" : "rgba(16,21,16,.08)";

  const label = button.getAttribute("aria-label") || "Wishlist product";
  const productName = label.replace(/^(Remove|Wishlist|Add)\s+/i, "");
  button.setAttribute("aria-label", `${liked ? "Remove" : "Wishlist"} ${productName}`);
  const icon = button.querySelector<SVGElement>("svg");
  if (icon) icon.style.fill = liked ? "currentColor" : "none";
  button.classList.toggle("is-saved", liked);
}

function syncFavoriteButtons() {
  const favorites = readFavoriteSlugs();
  document.querySelectorAll<HTMLButtonElement>(favoriteSelector()).forEach((button) => {
    const slug = slugFromButton(button);
    if (slug) applyButtonState(button, favorites.includes(slug));
  });
}

export default function FavoritesBridge() {
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    let timer: number | null = null;

    const scheduleSync = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!disposed) syncFavoriteButtons();
      }, 80);
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>(favoriteSelector());
      if (!button) return;
      const slug = slugFromButton(button);
      if (!slug) return;

      const liked = toggleFavoriteSlug(slug);
      applyButtonState(button, liked);
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("storage", scheduleSync);
    window.addEventListener(FAV_EVENT, scheduleSync);
    window.addEventListener("popstate", scheduleSync);

    syncFavoriteButtons();
    scheduleSync();

    return () => {
      disposed = true;
      if (timer !== null) window.clearTimeout(timer);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("storage", scheduleSync);
      window.removeEventListener(FAV_EVENT, scheduleSync);
      window.removeEventListener("popstate", scheduleSync);
    };
  }, [pathname]);

  return null;
}
