// app/components/kyc/IDUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { processKYCImage, checkImageQuality, ImageQualityCheck } from '@/app/lib/utils/image-processor';

interface IDUploaderProps {
  onUpload: (file: File, dataUrl: string) => void;
  label: string;
  description?: string;
  type: 'face_front' | 'face_back' | 'id_front' | 'id_back';
  required?: boolean;
  initialValue?: string;
  showPreview?: boolean;
}

export function IDUploader({
  onUpload,
  label,
  description,
  type,
  required = true,
  initialValue,
  showPreview = true,
}: IDUploaderProps) {
  void type;
  void showPreview;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<ImageQualityCheck | null>(null);
  const [uploadAttempts, setUploadAttempts] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      // Process image (compress, adjust aspect ratio, etc.)
      const result = await processKYCImage(selectedFile);

      if (!result.success) {
        setError(result.message || 'Failed to process image');
        setUploadAttempts(prev => prev + 1);

        // After 2 failed attempts, suggest using a different device
        if (uploadAttempts >= 1) {
          setError(
            result.message || 
            'It looks like your camera might have low resolution. Please ask a colleague or friend with a different phone to take the photo and send it to you, then upload it here.'
          );
        }
        setLoading(false);
        return;
      }

      // Check image quality
      const qualityCheck = await checkImageQuality(result.processedFile || selectedFile);
      setQuality(qualityCheck);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        setFile(result.processedFile || selectedFile);
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const inputEvent = {
        target: { files: [droppedFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(inputEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setQuality(null);
    setError(null);
    setUploadAttempts(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUpload(new File([], ''), '');
  };

  // Get the expected photo example based on type
  const getPhotoExample = () => {
    switch (type) {
      case 'face_front':
        return 'Hold your ID next to your face, showing the FRONT side clearly';
      case 'face_back':
        return 'Hold your ID next to your face, showing the BACK side clearly';
      case 'id_front':
        return 'Take a clear photo of just the FRONT of your ID card';
      case 'id_back':
        return 'Take a clear photo of just the BACK of your ID card';
      default:
        return 'Take a clear photo';
    }
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

      {/* Example Tooltip */}
      <div className="flex items-center gap-2 text-xs text-warm-gray bg-blue-frost/30 px-3 py-2 rounded-lg">
        <span className="text-lg">💡</span>
        <span>{getPhotoExample()}</span>
        <button className="ml-auto text-ultramarine hover:text-ultramarine/80 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Upload Area */}
      <div
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
            <div className="relative">
              <img
                src={preview}
                alt={label}
                className="max-h-48 w-auto mx-auto rounded-lg shadow-sm object-contain"
              />
            </div>
            {quality && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${quality.checks.format.passed ? 'text-ghost-green' : 'text-red-500'}`}>
                  {quality.checks.format.passed ? '✅' : '❌'} Format
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
            )}
            <p className="text-xs text-center text-ghost-green">
              ✓ Photo uploaded successfully
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-sm text-midnight font-medium">Click or drag to upload</p>
            <p className="text-xs text-warm-gray mt-1">JPEG, PNG, or WebP • Max 5MB</p>
            <div className="flex gap-4 mt-2 text-xs text-warm-gray">
              <span>📱 Camera</span>
              <span>📁 File</span>
              <span>📋 Drag & Drop</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg space-y-1">
          <p className="font-medium">⚠️ {error}</p>
          {uploadAttempts >= 2 && (
            <p className="text-red-400">
              Tip: Ask someone with a better camera to take the photo and send it to you.
            </p>
          )}
        </div>
      )}

      {quality && !quality.passed && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
          Some quality issues detected. For best results, retake with better lighting.
        </div>
      )}
    </div>
  );
}