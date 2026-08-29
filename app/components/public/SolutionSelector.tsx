// app/components/public/SolutionSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PainPoint {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  related_product_ids: string[];
}

export function SolutionSelector() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchPainPoints() {
    try {
      const response = await fetch('/api/catalog/pain-points', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to load solutions');
      setPainPoints(result.painPoints || []);
    } catch (error) {
      console.error('Error fetching pain points:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchPainPoints(); }, []);

  function togglePainPoint(id: string) {
    setSelectedPoints(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  }

  function handleGetSolutions() {
    if (selectedPoints.length === 0) {
      router.push('/products');
      return;
    }
    router.push(`/products?pain=${selectedPoints.join(',')}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-solar-flare border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {painPoints.map((point) => {
          const isSelected = selectedPoints.includes(point.id);
          return (
            <button
              key={point.id}
              onClick={() => togglePainPoint(point.id)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-solar-flare bg-solar-flare/5 shadow-md' 
                  : 'border-warm-gray/30 hover:border-ultramarine/50 hover:bg-blue-frost/30'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{point.icon}</span>
                <div>
                  <h3 className={`font-semibold ${isSelected ? 'text-solar-flare' : 'text-midnight'}`}>
                    {point.name}
                  </h3>
                  <p className="text-sm text-warm-gray mt-1">{point.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleGetSolutions}
          className="px-8 py-3 bg-solar-flare text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:bg-solar-flare/90"
        >
          {selectedPoints.length > 0 ? 'Get My Solutions' : 'View All Products'}
        </button>
        {selectedPoints.length > 0 && (
          <button
            onClick={() => setSelectedPoints([])}
            className="px-8 py-3 bg-white border border-warm-gray/30 text-midnight font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {selectedPoints.length > 0 && (
        <p className="text-center text-sm text-warm-gray">
          {selectedPoints.length} challenge{selectedPoints.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}