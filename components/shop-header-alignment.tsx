"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STYLE_ID = "verdant-shop-header-alignment";

export default function ShopHeaderAlignment() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/shop") return;

    const existing = document.getElementById(STYLE_ID);
    if (existing) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Keep the Shop navigation centered while the cart + favourites form one right-side action cluster. */
      .verdant-shop-page > header > div { position: relative; }
      .verdant-shop-page > header > div > nav {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
      }
      .verdant-shop-page > header > div > a[href="/cart"] {
        margin-left: auto;
        margin-right: 56px;
      }

      /* The favourites control is rendered globally on Shop; align it to the same max-width container. */
      .verdant-top-favorites {
        top: 16px !important;
        right: max(20px, calc((100vw - 1280px) / 2)) !important;
      }

      @media (max-width: 760px) {
        .verdant-shop-page > header > div > nav { display: none; }
        .verdant-shop-page > header > div > a[href="/cart"] {
          margin-right: 56px;
        }
        .verdant-top-favorites {
          top: 16px !important;
          right: 20px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, [pathname]);

  return null;
}
