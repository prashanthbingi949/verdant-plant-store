"use client";

import { useEffect } from "react";

/** Keeps the circular quick-add control visually in sync with its React label. */
export default function ShopQuickAddFeedback() {
  useEffect(() => {
    const update = () => {
      const buttons = document.querySelectorAll<HTMLElement>(
        ".verdant-shop-page .group.min-w-0 > .pt-4 > .mt-4 > button"
      );

      buttons.forEach((button) => {
        const isAdded = button.textContent?.includes("Added") ?? false;
        button.classList.toggle("is-quick-added", isAdded);
        button.setAttribute(
          "aria-label",
          isAdded ? "Added to cart" : "Add to cart"
        );
      });
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
