 'use client';

import { useEffect, useMemo, useState } from 'react';
import { Grid3X3, List, Search, X } from 'lucide-react';
import { ProductCard } from '@/app/components/public/ProductCard';
import type { Product } from '@/app/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/catalog/products', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load solutions');
        return response.json() as Promise<{ products?: Product[] }>;
      })
      .then((payload) => {
        if (!cancelled) setProducts(payload.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesQuery = !query || [product.name, product.description, product.category]
        .some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [products, search, category]);

  if (loading) {
    return <div className="site-container grid min-h-[60vh] place-items-center text-sm text-slate-500">Loading solutions...</div>;
  }

  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-midnight sm:text-5xl">Solutions for your operation</h1>
          <p className="mt-3 text-slate-500">Browse the active solutions configured for this tenant. Categories and products are data-driven.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search solutions</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search solutions"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-solar-flare focus:ring-2 focus:ring-orange-100"
            />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Clear search"><X className="h-4 w-4" /></button>}
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', ...categories].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setCategory(value)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold ${category === value ? 'border-solar-flare bg-solar-flare text-white' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                {value === 'all' ? 'All' : value.replace(/[-_]+/g, ' ')}
              </button>
            ))}
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white p-1 sm:flex">
            <button type="button" className={`rounded-lg p-2 ${view === 'grid' ? 'bg-slate-100 text-midnight' : 'text-slate-400'}`} onClick={() => setView('grid')} aria-label="Grid view"><Grid3X3 className="h-4 w-4" /></button>
            <button type="button" className={`rounded-lg p-2 ${view === 'list' ? 'bg-slate-100 text-midnight' : 'text-slate-400'}`} onClick={() => setView('list')} aria-label="List view"><List className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
          <span>{filtered.length} solution{filtered.length === 1 ? '' : 's'}</span>
          {(search || category !== 'all') && <button type="button" onClick={() => { setSearch(''); setCategory('all'); }} className="font-semibold text-solar-flare">Clear filters</button>}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="font-semibold text-midnight">No matching solutions</h2>
            <p className="mt-2 text-sm text-slate-500">Try another category or search term.</p>
          </div>
        ) : (
          <div className={`mt-5 ${view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-3'}`}>
            {filtered.map((product) => <ProductCard key={product.id} product={product} viewMode={view} />)}
          </div>
        )}
      </div>
    </div>
  );
}
