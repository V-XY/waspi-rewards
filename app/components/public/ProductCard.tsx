// app/components/public/ProductCard.tsx
'use client';

import { Product } from '@/app/lib/types';
import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  hrefPrefix?: string;
}

export function ProductCard({ product, viewMode = 'grid', hrefPrefix = '' }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      total: product.price,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
      connectivity: 'Connectivity',
      voice: 'Voice',
      data: 'Data',
      marketing: 'Marketing',
      security: 'Security',
      identity: 'Identity',
    };
    return map[category] || category;
  }

  function getCategoryColor(category: string): string {
    const map: Record<string, string> = {
      connectivity: 'bg-blue-frost text-ultramarine',
      voice: 'bg-ghost-green text-emerald-700',
      data: 'bg-blue-frost text-ultramarine',
      marketing: 'bg-hot-magenta/20 text-hot-magenta',
      security: 'bg-solar-flare/20 text-solar-flare',
      identity: 'bg-warm-gray/20 text-midnight',
    };
    return map[category] || 'bg-gray-100 text-gray-600';
  }

  function getCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      connectivity: '📶',
      voice: '📞',
      data: '📊',
      marketing: '📱',
      security: '🔒',
      identity: '🪪',
    };
    return map[category] || '📦';
  }

  if (viewMode === 'list') {
    return (
      <Link
        href={`${hrefPrefix}/products/${product.id}`}
        className="block bg-white dark:bg-ebony rounded-xl shadow-sm hover:shadow-md transition-all border border-warm-gray/10 dark:border-white/5 p-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-blue-frost/50 dark:bg-midnight/50 rounded-lg flex items-center justify-center text-2xl">
            {getCategoryIcon(product.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(product.category)}`}>
                {getCategoryLabel(product.category)}
              </span>
            </div>
            <h3 className="font-semibold text-midnight dark:text-white truncate">{product.name}</h3>
            <p className="text-xs text-warm-gray dark:text-warm-gray/60 truncate">{product.description}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="font-bold text-midnight dark:text-white">{product.price.toLocaleString()} FCFA</p>
            <button
              onClick={handleAddToCart}
              className={`mt-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                added
                  ? 'bg-ghost-green text-emerald-700 dark:bg-ghost-green/30'
                  : 'bg-solar-flare text-white hover:bg-solar-flare/90'
              }`}
            >
              {added ? '✓ Added' : 'Add'}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`${hrefPrefix}/products/${product.id}`}
      className="block bg-white dark:bg-ebony rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-warm-gray/10 dark:border-white/5 group"
    >
      <div className="h-32 bg-gradient-blue-frost/50 dark:bg-midnight/50 flex items-center justify-center relative">
        <span className="text-4xl opacity-50 group-hover:scale-110 transition-transform duration-300">
          {getCategoryIcon(product.category)}
        </span>
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(product.category)}`}>
          {getCategoryLabel(product.category)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-midnight dark:text-white text-sm line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-warm-gray dark:text-warm-gray/60 mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-midnight dark:text-white">
              {product.price.toLocaleString()} FCFA
            </span>
            <span className="text-xs text-warm-gray dark:text-warm-gray/60 ml-1">
              {product.billing_cycle === 'monthly' ? '/mo' : ''}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              added
                ? 'bg-ghost-green text-emerald-700 dark:bg-ghost-green/30'
                : 'bg-solar-flare text-white hover:bg-solar-flare/90 hover:scale-105'
            }`}
          >
            {added ? '✓ Added' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}