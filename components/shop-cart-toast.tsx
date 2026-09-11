"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";

export default function ShopCartToast() {
  const { itemCount } = useCart();
  const [visible, setVisible] = useState(false);
  const previousCount = useRef(itemCount);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      previousCount.current = itemCount;
      return;
    }

    if (itemCount <= previousCount.current) {
      previousCount.current = itemCount;
      return;
    }

    previousCount.current = itemCount;
    setVisible(true);

    const timeout = window.setTimeout(() => setVisible(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [itemCount]);

  return (
    <div
      className={`verdant-cart-toast ${visible ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="verdant-cart-toast-icon" aria-hidden="true">✓</span>
      <span className="verdant-cart-toast-copy">
        <strong>Added to cart</strong>
        <span>Ready when you are.</span>
      </span>
      <span className="verdant-cart-toast-count">{itemCount}</span>
    </div>
  );
}
