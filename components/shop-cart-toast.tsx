"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";

export default function ShopCartToast() {
  const { itemCount } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleCartAdd = () => {
      setVisible(true);
      const timeout = window.setTimeout(() => setVisible(false), 2200);
      return () => window.clearTimeout(timeout);
    };

    window.addEventListener("verdant-cart-add", handleCartAdd);
    return () => window.removeEventListener("verdant-cart-add", handleCartAdd);
  }, []);

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
