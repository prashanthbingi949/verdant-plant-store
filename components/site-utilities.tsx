"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FAV_KEY = "verdant-favorites-v1";
const THEME_KEY = "verdant-theme-v1";

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

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    </svg>
  );
}

export default function SiteUtilities() {
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    try {
      // Verdant is light-mode only now. Clear any previously saved theme state
      // and remove the old dark-mode class so older sessions cannot re-enable it.
      window.localStorage.removeItem(THEME_KEY);
      document.documentElement.classList.remove("verdant-dark");
      document.documentElement.style.colorScheme = "light";
      setFavoriteCount(readFavorites().length);
    } catch {
      setFavoriteCount(0);
    }

    const handleFavoriteClick = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as Element | null;
      const button = target?.closest<HTMLButtonElement>('button[aria-label^="Wishlist "]');
      if (!button) return;

      window.requestAnimationFrame(() => {
        const card = button.closest<HTMLElement>(".product-card");
        const link = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
        const href = link?.getAttribute("href") || "";
        const slug = href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
        if (!slug) return;

        const next = readFavorites();
        const liked = button.classList.contains("is-liked");
        const updated = liked ? Array.from(new Set([...next, slug])) : next.filter((item) => item !== slug);
        writeFavorites(updated);
        setFavoriteCount(updated.length);
      });
    };

    const sync = () => setFavoriteCount(readFavorites().length);
    document.addEventListener("click", handleFavoriteClick, true);
    window.addEventListener("storage", sync);
    window.addEventListener("verdant-favorites-change", sync);

    return () => {
      document.removeEventListener("click", handleFavoriteClick, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener("verdant-favorites-change", sync);
    };
  }, []);

  return (
    <Link
      href="/favorites"
      aria-label={`Open favourites${favoriteCount ? `, ${favoriteCount} saved` : ""}`}
      className="verdant-top-favorites"
    >
      <HeartIcon />
      {favoriteCount > 0 && <span className="verdant-top-favorites-count">{favoriteCount > 99 ? "99+" : favoriteCount}</span>}
      <style>{`
        .verdant-top-favorites{position:fixed;top:14px;right:102px;z-index:115;width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(16,21,16,.1);border-radius:999px;background:rgba(244,245,233,.94);color:#202d20;box-shadow:0 8px 24px rgba(16,21,16,.08);backdrop-filter:blur(14px);transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
        .verdant-top-favorites:hover{transform:translateY(-1px);background:#ddf27a;box-shadow:0 12px 28px rgba(32,45,32,.13)}
        .verdant-top-favorites-count{position:absolute;right:-2px;top:-3px;min-width:17px;height:17px;display:grid;place-items:center;padding:0 4px;border-radius:999px;background:#202d20;color:#f4f5e9;font-size:9px;font-weight:900;line-height:1;border:2px solid #f4f5e9}
        @media(max-width:760px){.verdant-top-favorites{top:10px;right:78px;width:38px;height:38px}.verdant-top-favorites-count{right:-2px;top:-4px}}
      `}</style>
    </Link>
  );
}
