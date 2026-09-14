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
  image_url?: string | null;
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
const STORAGE_KEY = "verdant-cart-v2";
const LEGACY_STORAGE_KEY = "verdant-cart-v1";
const CART_ADD_EVENT = "verdant-cart-add-v2";
const MAX_ITEM_QUANTITY = 99;

function normalizeQuantity(value: unknown, recoverOversized = false) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0) return 1;
  if (recoverOversized && quantity > MAX_ITEM_QUANTITY) return 1;
  return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));
}

function normalizeStoredCart(value: unknown, recoverOversized = false): CartItem[] {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .filter((item): item is CartItem => Boolean(item) && typeof item === "object" && typeof (item as CartItem).id === "string")
    .map((item) => ({
      ...item,
      quantity: normalizeQuantity(item.quantity, recoverOversized),
    }));

  return normalized.reduce<CartItem[]>((items, item) => {
    const existing = items.find((entry) => entry.id === item.id);
    if (!existing) return [...items, item];
    return items.map((entry) =>
      entry.id === item.id
        ? { ...entry, ...item, quantity: Math.min(MAX_ITEM_QUANTITY, entry.quantity + item.quantity) }
        : entry,
    );
  }, []);
}

function addOrIncrementCartItem(current: CartItem[], item: Omit<CartItem, "quantity">, quantity = 1) {
  const safeQuantity = normalizeQuantity(quantity);
  const existing = current.find((entry) => entry.id === item.id);
  if (existing) {
    return current.map((entry) =>
      entry.id === item.id
        ? { ...entry, ...item, quantity: Math.min(MAX_ITEM_QUANTITY, entry.quantity + safeQuantity) }
        : entry,
    );
  }
  return [...current, { ...item, quantity: safeQuantity }];
}

function readStoredCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeStoredCart(JSON.parse(stored));

    // One-time migration from v1. The old cart provider could duplicate
    // persisted quantities during React Strict Mode initialization. Treat
    // impossible quantities from that broken store as a single item, then
    // move the cleaned cart to v2.
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return [];

    const migrated = normalizeStoredCart(JSON.parse(legacy), true);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    return [];
  }
}

function emitCartAdd(item: { id: string; name: string; quantity: number; source?: string }) {
  window.dispatchEvent(new CustomEvent(CART_ADD_EVENT, {
    detail: { ...item, source: item.source || "explicit-add" },
  }));
}

export { CART_ADD_EVENT };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize exactly once from storage. The previous reducer-style merge
    // could run twice under React Strict Mode and double every stored quantity.
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("verdant-cart-change", { detail: { items } }));
  }, [items, ready]);

  // Discovery is global and the recommendation buttons sit above the catalogue.
  // Keep a DOM-level fallback so those buttons still use the shared cart.
  useEffect(() => {
    const handleDiscoveryAdd = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as Element | null;
      const button = target?.closest<HTMLButtonElement>(".vd-wow-product-actions button");
      if (!button) return;

      const card = button.closest<HTMLElement>(".vd-wow-product");
      const productLink = card?.querySelector<HTMLAnchorElement>('a[href^="/shop/"]');
      const href = productLink?.getAttribute("href") || "";
      const slug = href.startsWith("/shop/") ? href.slice("/shop/".length).split(/[?#]/)[0] : "";
      const name = card?.querySelector<HTMLElement>("h4")?.textContent?.trim() || "Verdant plant";
      const category = card?.querySelector<HTMLElement>(".vd-wow-product-copy p")?.textContent?.trim() || "Plants";
      const priceText = card?.querySelector<HTMLElement>(".vd-wow-product-copy strong")?.textContent || "0";
      const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;
      const image = card?.querySelector<HTMLImageElement>(".vd-wow-product-media img")?.getAttribute("src") || null;

      if (!slug || !price) return;

      event.preventDefault();
      event.stopPropagation();

      const item: Omit<CartItem, "quantity"> = {
        id: slug,
        name,
        price,
        tone: "moss",
        size: "Standard",
        category,
        image_url: image,
      };

      setItems((current) => addOrIncrementCartItem(current, item, 1));
      emitCartAdd({ id: slug, name, quantity: 1, source: "discovery" });

      const originalLabel = button.textContent || "Add +";
      button.textContent = "Added ✓";
      window.setTimeout(() => {
        if (button.isConnected) button.textContent = originalLabel;
      }, 1100);
    };

    document.addEventListener("click", handleDiscoveryAdd, true);
    return () => document.removeEventListener("click", handleDiscoveryAdd, true);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + normalizeQuantity(item.quantity), 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * normalizeQuantity(item.quantity), 0);
    const delivery = subtotal === 0 || subtotal >= 1499 ? 0 : 79;
    return {
      items,
      addItem: (item, quantity = 1) => {
        const safeQuantity = normalizeQuantity(quantity);
        setItems((current) => addOrIncrementCartItem(current, item, safeQuantity));
        emitCartAdd({ id: item.id, name: item.name, quantity: safeQuantity, source: "explicit-add" });
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      updateQuantity: (id, quantity) => {
        const safeQuantity = normalizeQuantity(quantity);
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.id !== id)
            : current.map((item) => (item.id === id ? { ...item, quantity: safeQuantity } : item)),
        );
      },
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
