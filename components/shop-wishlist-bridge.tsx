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

function getButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("main.verdant-shop-page article button[aria-label*='wishlist']"));
}

function slugForButton(button: HTMLButtonElement) {
  const card = button.closest<HTMLElement>("article");
  const link = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
  const href = link?.getAttribute("href") || "";
  return href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
}

function syncButtons() {
  const favorites = readFavorites();
  getButtons().forEach((button) => {
    const slug = slugForButton(button);
    if (!slug) return;
    const liked = favorites.includes(slug);
    const label = button.getAttribute("aria-label") || "Wishlist product";
    const name = label.replace(/^(Add|Remove)\s+/i, "");
    button.classList.toggle("bg-[#202d20]", liked);
    button.classList.toggle("text-[#ddf27a]", liked);
    button.classList.toggle("bg-[#f4f5e9]/86", !liked);
    button.classList.toggle("text-[#202d20]", !liked);
    button.setAttribute("aria-label", `${liked ? "Remove" : "Add"} ${name}`);
  });
}

export default function ShopWishlistBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/shop") return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>("main.verdant-shop-page article button[aria-label*='wishlist']");
      if (!button) return;

      const liked = button.classList.contains("bg-[#202d20]");
      const label = button.getAttribute("aria-label") || "Wishlist product";
      button.classList.toggle("bg-[#202d20]", !liked);
      button.classList.toggle("text-[#ddf27a]", !liked);
      button.classList.toggle("bg-[#f4f5e9]/86", liked);
      button.classList.toggle("text-[#202d20]", liked);
      button.setAttribute("aria-label", `${!liked ? "Remove" : "Add"} ${label.replace(/^(Add|Remove)\s+/i, "")}`);

      // SiteUtilities persists this DOM state after capture. Stop React's local
      // liked state from fighting the persisted favourite state.
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
