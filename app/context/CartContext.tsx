 'use client';

import { createContext, useContext, useSyncExternalStore, ReactNode } from 'react';
import type { CartItem } from '@/app/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'cart';
const EMPTY_CART: CartItem[] = [];

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown;
    if (!Array.isArray(value)) return EMPTY_CART;
    return value.filter((item): item is CartItem => (
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).product_id === 'string' &&
      typeof (item as Record<string, unknown>).name === 'string' &&
      typeof (item as Record<string, unknown>).price === 'number' &&
      typeof (item as Record<string, unknown>).quantity === 'number' &&
      typeof (item as Record<string, unknown>).total === 'number'
    ));
  } catch {
    return EMPTY_CART;
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('ebu-cart-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('ebu-cart-change', callback);
  };
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('ebu-cart-change'));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);

  function addItem(newItem: CartItem) {
    const next = [...items];
    const index = next.findIndex((item) => item.product_id === newItem.product_id);
    if (index === -1) {
      next.push(newItem);
    } else {
      const item = next[index];
      const quantity = item.quantity + 1;
      next[index] = { ...item, quantity, total: quantity * item.price };
    }
    writeCart(next);
  }

  function removeItem(productId: string) {
    writeCart(items.filter((item) => item.product_id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      removeItem(productId);
      return;
    }
    writeCart(items.map((item) => item.product_id === productId ? { ...item, quantity, total: quantity * item.price } : item));
  }

  function clearCart() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('ebu-cart-change'));
  }

  const total = items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
