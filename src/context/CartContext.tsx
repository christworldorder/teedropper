"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  color?: string;
  size: string;
  variantId: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string, color: string | undefined, size: string) => void;
  updateQuantity: (productId: string, color: string | undefined, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "teedropper_cart";
const MAX_QTY = 25;

function itemKey(productId: string, color: string | undefined, size: string) {
  return `${productId}|${color ?? ""}|${size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, hydrated]);

  const addToCart = useCallback((incoming: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = incoming.quantity ?? 1;
    setItems((prev) => {
      const key = itemKey(incoming.productId, incoming.color, incoming.size);
      const existing = prev.find((i) => itemKey(i.productId, i.color, i.size) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.color, i.size) === key
            ? { ...i, quantity: Math.min(i.quantity + qty, MAX_QTY) }
            : i
        );
      }
      return [...prev, { ...incoming, quantity: Math.min(qty, MAX_QTY) }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, color: string | undefined, size: string) => {
    const key = itemKey(productId, color, size);
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.color, i.size) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, color: string | undefined, size: string, quantity: number) => {
    const key = itemKey(productId, color, size);
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => itemKey(i.productId, i.color, i.size) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.color, i.size) === key ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        drawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
