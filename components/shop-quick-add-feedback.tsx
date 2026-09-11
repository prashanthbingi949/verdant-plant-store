"use client";

import { useEffect } from "react";

const BUTTON_SELECTOR = ".verdant-shop-page .group.min-w-0 > .pt-4 > .mt-4 > button";

/** Makes Quick Add feedback explicit and independent of focus/hover state. */
export default function ShopQuickAddFeedback() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>(BUTTON_SELECTOR);
      if (!button || button.disabled) return;

      button.classList.remove("is-quick-added");
      void button.offsetWidth;
      button.classList.add("is-quick-added");
      button.setAttribute("aria-label", "Added to cart");

      window.setTimeout(() => {
        button.classList.remove("is-quick-added");
        button.setAttribute("aria-label", "Add to cart");
      }, 1800);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
