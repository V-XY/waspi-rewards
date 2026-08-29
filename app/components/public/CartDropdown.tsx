// app/components/public/CartDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label="Shopping cart"
        aria-expanded={isOpen}
      >
        <ShoppingCart className="w-5 h-5 text-midnight dark:text-white" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-solar-flare text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-slow">
            {itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-ebony rounded-xl shadow-2xl border border-warm-gray/10 dark:border-white/5 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-warm-gray/10 dark:border-white/5 flex justify-between items-center">
            <h3 className="font-semibold text-midnight dark:text-white">
              Your Cart
              <span className="text-xs text-warm-gray dark:text-warm-gray/60 ml-2">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-warm-gray" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">🛒</span>
                <p className="text-warm-gray dark:text-warm-gray/60">Your cart is empty</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 text-sm text-solar-flare hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-midnight dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-solar-flare font-semibold">
                      {item.price.toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-midnight dark:text-white" />
                    </button>
                    <span className="w-6 text-center text-sm text-midnight dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-midnight dark:text-white" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4 text-warm-gray hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-warm-gray/10 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-warm-gray dark:text-warm-gray/60">Subtotal</span>
                <span className="text-lg font-bold text-midnight dark:text-white">
                  {total.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-solar-flare text-white font-medium rounded-lg hover:bg-solar-flare/90 transition-colors text-sm"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 border border-warm-gray/30 dark:border-white/10 text-midnight dark:text-white font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
                >
                  View Cart
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}