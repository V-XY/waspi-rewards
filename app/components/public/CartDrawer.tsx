// app/components/public/CartDrawer.tsx
'use client';

import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleCheckout() {
    setIsOpen(false);
    router.push('/checkout');
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-solar-flare text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-solar-flare/90 flex items-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {itemCount > 0 && (
          <span className="bg-white text-solar-flare w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold text-midnight">Your Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🛒</span>
                <p className="text-warm-gray">Your cart is empty</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-solar-flare font-medium hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-midnight">{item.name}</h4>
                      <p className="text-sm text-warm-gray">{item.price.toLocaleString()} FCFA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-midnight">{item.total.toLocaleString()} FCFA</p>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Subtotal</span>
                <span className="font-medium">{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Delivery</span>
                <span className="font-medium text-ghost-green">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4">
                <span>Total</span>
                <span className="text-solar-flare">{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-solar-flare text-white font-semibold py-3 rounded-lg hover:bg-solar-flare/90 transition-colors"
                >
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="px-4 py-3 bg-white border border-gray-200 text-warm-gray rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}