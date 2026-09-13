"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";

export default function ShopCartToast() {
  const { itemCount } = useCart();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleCartAdd = () => {
      setVisible(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, 2200);
    };

    window.addEventListener("verdant-cart-add", handleCartAdd);
    return () => {
      window.removeEventListener("verdant-cart-add", handleCartAdd);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
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
