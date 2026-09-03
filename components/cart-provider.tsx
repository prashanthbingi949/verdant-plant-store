"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  tone: "moss" | "sage" | "lime";
  size: string;
  category: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  delivery: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "verdant-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal === 0 || subtotal >= 1499 ? 0 : 79;
    return {
      items,
      addItem: (item, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.id === item.id);
          if (existing) {
            return current.map((entry) =>
              entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
            );
          }
          return [...current, { ...item, quantity }];
        });
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      updateQuantity: (id, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.id !== id)
            : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
        ),
      clearCart: () => setItems([]),
      itemCount,
      subtotal,
      delivery,
      total: subtotal + delivery,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
