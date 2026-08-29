// app/components/kyc/PhotoPreview.tsx
'use client';

import { useState } from 'react';

interface PhotoPreviewProps {
  imageUrl: string;
  label: string;
  onRetake?: () => void;
  onConfirm?: () => void;
  quality?: {
    passed: boolean;
    checks: {
      format: { passed: boolean; message?: string };
      size: { passed: boolean; message?: string };
      resolution: { passed: boolean; message?: string };
      aspectRatio: { passed: boolean; message?: string };
    };
  };
}

export function PhotoPreview({
  imageUrl,
  label,
  onRetake,
  onConfirm,
  quality,
}: PhotoPreviewProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const allQualityPassed = quality?.passed ?? true;

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (onConfirm) onConfirm();
  };

  return (
    <div className="bg-white rounded-xl border border-warm-gray/20 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h4 className="font-medium text-midnight text-sm">{label}</h4>
        {isConfirmed && (
          <span className="text-xs text-ghost-green font-medium">✅ Confirmed</span>
        )}
      </div>

      {/* Image */}
      <div className="p-4">
        <div className="relative bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={label}
            className="w-full max-h-64 object-contain"
          />
        </div>
      </div>

      {/* Quality Checks */}
      {quality && (
        <div className="px-4 pb-2 space-y-1">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className={`flex items-center gap-1 ${quality.checks.format.passed ? 'text-ghost-green' : 'text-red-500'}`}>
              {quality.checks.format.passed ? '✅' : '❌'} Format
              {quality.checks.format.message && (
                <span className="text-warm-gray text-[10px]">({quality.checks.format.message})</span>
              )}
            </div>
            <div className={`flex items-center gap-1 ${quality.checks.size.passed ? 'text-ghost-green' : 'text-red-500'}`}>
              {quality.checks.size.passed ? '✅' : '❌'} Size
            </div>
            <div className={`flex items-center gap-1 ${quality.checks.resolution.passed ? 'text-ghost-green' : 'text-red-500'}`}>
              {quality.checks.resolution.passed ? '✅' : '❌'} Resolution
            </div>
            <div className={`flex items-center gap-1 ${quality.checks.aspectRatio.passed ? 'text-ghost-green' : 'text-yellow-500'}`}>
              {quality.checks.aspectRatio.passed ? '✅' : '⚠️'} Aspect Ratio
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50 flex gap-2">
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex-1 px-4 py-2 border border-warm-gray/30 text-midnight font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            📷 Retake
          </button>
        )}
        {onConfirm && !isConfirmed && (
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-solar-flare text-white font-medium rounded-lg hover:bg-solar-flare/90 transition-colors text-sm"
          >
            ✓ Looks Good
          </button>
        )}
        {isConfirmed && (
          <span className="flex-1 text-center text-sm text-ghost-green font-medium py-2">
            ✓ Confirmed
          </span>
        )}
      </div>

      {!allQualityPassed && (
        <div className="px-4 pb-4">
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
            ⚠️ Some quality issues detected. For best results, retake with better lighting.
          </div>
        </div>
      )}
    </div>
  );
}