"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const THEME_KEY = "verdant-theme-v1";
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

export default function SiteUtilities() {
  const [dark, setDark] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextDark = savedTheme === "dark" || (savedTheme === null && prefersDark);
      document.documentElement.classList.toggle("verdant-dark", nextDark);
      setDark(nextDark);
      setFavoriteCount(readFavorites().length);
    } catch {
      setDark(false);
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

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("verdant-dark", next);
    window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  const heart = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    </svg>
  );

  const moon = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.8 8.8 0 1 0 12 12Z" />
    </svg>
  );

  const sun = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );

  return (
    <>
      <style>{`
        .verdant-utilities { position: fixed; right: 16px; bottom: 16px; z-index: 120; display:flex; align-items:center; gap:6px; padding:6px; border:1px solid rgba(16,21,16,.14); border-radius:999px; background:rgba(244,245,233,.9); backdrop-filter:blur(16px); box-shadow:0 10px 30px rgba(16,21,16,.12); color:#202d20; }
        .verdant-utility-btn { position:relative; width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:999px; background:transparent; color:inherit; cursor:pointer; transition:background .2s ease, transform .2s ease; }
        .verdant-utility-btn:hover { background:rgba(32,45,32,.08); transform:translateY(-1px); }
        .verdant-utility-count { position:absolute; top:1px; right:0; min-width:16px; height:16px; display:grid; place-items:center; border-radius:999px; background:#ddf27a; color:#101510; font-size:9px; font-weight:900; }

        .verdant-dark { color-scheme: dark; }
        .verdant-dark body { background:#101510; color:#f4f5e9; }
        .verdant-dark .verdant-site { background:#101510; color:#f4f5e9; }
        .verdant-dark .site-header { background:rgba(16,21,16,.9); color:#f4f5e9; border-color:rgba(244,245,233,.08); }
        .verdant-dark .site-header .desktop-nav a,
        .verdant-dark .site-header .account-link,
        .verdant-dark .site-header .brand,
        .verdant-dark .site-header .text-link { color:#f4f5e9; }
        .verdant-dark .section-heading>p,
        .verdant-dark .product-info p,
        .verdant-dark .footer-brand p { color:rgba(244,245,233,.68); }
        .verdant-dark .collections-section,
        .verdant-dark .shop-section,
        .verdant-dark .care-section { background:#101510; color:#f4f5e9; }
        .verdant-dark .premium-category-card,
        .verdant-dark .product-card { color:#f4f5e9; }
        .verdant-dark .premium-category-copy { background:#182119; color:#f4f5e9; }
        .verdant-dark .premium-category-copy p { color:rgba(244,245,233,.62); }
        .verdant-dark .premium-category-copy > span:first-child { color:#bcd47a; }
        .verdant-dark .collection-card { filter:brightness(.72); }
        .verdant-dark .product-image { background:#1c281d !important; }
        .verdant-dark .product-badge,
        .verdant-dark .wish { color:#f4f5e9; background:rgba(32,45,32,.82); border-color:rgba(244,245,233,.1); }
        .verdant-dark .wish.is-liked { color:#101510; background:#ddf27a; }
        .verdant-dark .product-info h3,
        .verdant-dark .product-buy strong { color:#f4f5e9; }
        .verdant-dark .product-buy button { background:#ddf27a; color:#101510; }
        .verdant-dark .care-list { border-color:rgba(244,245,233,.14); }
        .verdant-dark .care-list a { border-color:rgba(244,245,233,.14); color:#f4f5e9; }
        .verdant-dark .care-list span { color:rgba(244,245,233,.42); }
        .verdant-dark .care-heading .eyebrow { color:#bcd47a; }
        .verdant-dark .newsletter { background:#b9cf54; color:#101510; }
        .verdant-dark .newsletter label { color:rgba(16,21,16,.68); }
        .verdant-dark .newsletter .email-row input { color:#101510; border-color:rgba(16,21,16,.18); }
        .verdant-dark .footer { background:#0c110d; color:#f4f5e9; }
        .verdant-dark .footer-col a { color:rgba(244,245,233,.76); }

        /* Shop page */
        .verdant-dark .verdant-shop-page { background:#101510 !important; color:#f4f5e9 !important; }
        .verdant-dark .verdant-shop-page [class*="text-black"],
        .verdant-dark .verdant-shop-page [class*="text-[#202d20]"],
        .verdant-dark .verdant-shop-page [class*="text-[#52634b]"] { color:#f4f5e9 !important; }
        .verdant-dark .verdant-shop-page .shop-category-panel { background:#141c15; border-color:rgba(244,245,233,.16); }
        .verdant-dark .verdant-shop-page .shop-category-body { background:#141c15; color:#f4f5e9; }
        .verdant-dark .verdant-shop-page .shop-category-card { background:#1b251c; color:#f4f5e9; border-color:rgba(244,245,233,.11); }
        .verdant-dark .verdant-shop-page .shop-category-card.active { border-color:#ddf27a; }
        .verdant-dark .verdant-shop-page .shop-category-copy { background:#1b251c; color:#f4f5e9; }
        .verdant-dark .verdant-shop-page .shop-category-copy strong { color:#f4f5e9; }
        .verdant-dark .verdant-shop-page .shop-category-copy span,
        .verdant-dark .verdant-shop-page .shop-control-note { color:rgba(244,245,233,.62) !important; }
        .verdant-dark .verdant-shop-page .shop-category-body > div:first-child p { color:#bcd47a !important; }
        .verdant-dark .verdant-shop-page .shop-search { background-color:#f4f5e9 !important; color:#101510 !important; border-color:rgba(244,245,233,.22); }
        .verdant-dark .verdant-shop-page .shop-search::placeholder { color:rgba(16,21,16,.42) !important; }
        .verdant-dark .verdant-shop-page .shop-pill { background:#1b251c; color:#f4f5e9; border-color:rgba(244,245,233,.11); }
        .verdant-dark .verdant-shop-page .shop-pill.active { background:#ddf27a; color:#101510; border-color:#ddf27a; }
        .verdant-dark .verdant-shop-page .shop-select { background:#1b251c; color:#f4f5e9; border-color:rgba(244,245,233,.11); }
        .verdant-dark .verdant-shop-page .shop-subcat { background:#1b251c; color:#f4f5e9; border-color:rgba(244,245,233,.11); }
        .verdant-dark .verdant-shop-page .shop-subcat.active { background:#ddf27a; color:#101510; border-color:#ddf27a; }
        .verdant-dark .verdant-shop-page .shop-category-tab { color:#f4f5e9; }
        .verdant-dark .verdant-shop-page .shop-category-tab.active { color:#101510; }
        .verdant-dark .verdant-shop-page section > div > p[class*="text-black"],
        .verdant-dark .verdant-shop-page section > div p[class*="text-black/"] { color:rgba(244,245,233,.68) !important; }
        .verdant-dark .verdant-shop-page .group > div > p[class*="text-black"] { color:rgba(244,245,233,.62) !important; }
        .verdant-dark .verdant-shop-page .group h3,
        .verdant-dark .verdant-shop-page .group strong { color:#f4f5e9 !important; }
        .verdant-dark .verdant-shop-page .group a[class*="bg-[#202d20]"] { color:#f4f5e9 !important; background:#202d20 !important; }
        .verdant-dark .verdant-shop-page .group button { color:inherit; }

        /* Product detail page: override its light utility colors in dark mode. */
        .verdant-dark main[class*="bg-[#f4f5e9]"] { background:#101510 !important; color:#f4f5e9 !important; }
        .verdant-dark main[class*="bg-[#f4f5e9]"] header { background:rgba(16,21,16,.92) !important; color:#f4f5e9 !important; border-color:rgba(244,245,233,.1) !important; }
        .verdant-dark main[class*="bg-[#f4f5e9]"] [class*="text-black/"] { color:rgba(244,245,233,.68) !important; }
        .verdant-dark main[class*="bg-[#f4f5e9]"] [class*="border-black/"] { border-color:rgba(244,245,233,.12) !important; }
        .verdant-dark main[class*="bg-[#f4f5e9]"] [class*="bg-white/"] { background:rgba(32,45,32,.72) !important; }
        .verdant-dark main[class*="bg-[#f4f5e9]"] [class*="border-[#202d20]"] { border-color:#ddf27a !important; }
        .verdant-dark main[class*="bg-[#f4f5e9]"] [class*="text-[#202d20]"] { color:#f4f5e9 !important; }

        /* Favorites page */
        .verdant-dark .verdant-favorites-page { background:#101510 !important; color:#f4f5e9 !important; }
        .verdant-dark .verdant-favorites-links a { background:#182119; border-color:rgba(244,245,233,.14); color:#f4f5e9; }
        .verdant-dark .verdant-favorites-copy,
        .verdant-dark .verdant-favorite-meta small { color:rgba(244,245,233,.62); }
        .verdant-dark .verdant-favorite-image { background:#1c281d; }
        .verdant-dark .verdant-favorite-remove { background:rgba(20,29,21,.9); color:#f4f5e9; }
        .verdant-dark .verdant-favorite-buy button { background:#ddf27a; color:#101510; }
        .verdant-dark .verdant-favorites-empty { border-color:rgba(244,245,233,.16); color:rgba(244,245,233,.62); }

        /* Utility palette */
        .verdant-dark .verdant-utilities { background:rgba(20,29,21,.96); color:#f4f5e9; border-color:rgba(244,245,233,.14); }
        .verdant-dark .verdant-utility-btn:hover { background:rgba(255,255,255,.08); }
        @media (max-width:640px){ .verdant-utilities { right:10px; bottom:10px; } .verdant-utility-btn{width:38px;height:38px;} }
      `}</style>
      <div className="verdant-utilities" aria-label="Site tools">
        <Link href="/favorites" className="verdant-utility-btn" aria-label="Favourites" title="Favourites">
          {heart}
          {favoriteCount > 0 && <span className="verdant-utility-count">{favoriteCount > 9 ? "9+" : favoriteCount}</span>}
        </Link>
        <button type="button" className="verdant-utility-btn" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"} onClick={toggleTheme}>
          {dark ? sun : moon}
        </button>
      </div>
    </>
  );
}
