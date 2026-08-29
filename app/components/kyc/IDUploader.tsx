// app/components/kyc/IDUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { processKYCImage } from '@/app/lib/utils/image-processor';

interface IDUploaderProps {
  onUpload: (file: File, dataUrl: string) => void;
  label: string;
  description?: string;
  type: 'face_front' | 'face_back' | 'id_front' | 'id_back';
  required?: boolean;
  initialValue?: string;
}

export function IDUploader({
  onUpload,
  label,
  description,
  type,
  required = true,
  initialValue,
}: IDUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadAttempts, setUploadAttempts] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await processKYCImage(selectedFile);

      if (!result.success) {
        setError(result.message || 'Failed to process image');
        setUploadAttempts(prev => prev + 1);

        if (uploadAttempts >= 1) {
          setError(
            result.message || 
            'It looks like your camera might have low resolution. Please ask a colleague or friend with a different phone to take the photo and send it to you, then upload it here.'
          );
        }
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onUpload(result.processedFile || selectedFile, dataUrl);
        setError(null);
        setLoading(false);
      };
      reader.readAsDataURL(result.processedFile || selectedFile);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      console.error('ID Upload error:', err);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreview(null);
    setError(null);
    setUploadAttempts(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUpload(new File([], ''), '');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <label className="text-sm font-medium text-midnight">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-xs text-warm-gray mt-0.5">{description}</p>
          )}
        </div>
        {preview && (
          <button
            onClick={clearImage}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div
        onClick={triggerFileInput}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${preview 
            ? 'border-ghost-green bg-ghost-green/5' 
            : error 
              ? 'border-red-300 bg-red-50' 
              : 'border-warm-gray/30 hover:border-solar-flare/50 bg-white'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-solar-flare border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-warm-gray mt-2">Processing image...</p>
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt={label}
              className="max-h-48 w-auto mx-auto rounded-lg shadow-sm object-contain"
            />
            <p className="text-xs text-center text-ghost-green">
              ✓ Photo uploaded successfully
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-sm text-midnight font-medium">Click to upload</p>
            <p className="text-xs text-warm-gray mt-1">JPEG, PNG, or WebP • Max 5MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}