// app/components/kyc/SignatureCanvas.tsx
'use client';

import { useRef, useState, useEffect } from 'react';

interface SignatureCanvasProps {
  onSignature: (dataUrl: string) => void;
  clearable?: boolean;
  label?: string;
  required?: boolean;
  initialValue?: string;
}

export function SignatureCanvas({
  onSignature,
  clearable = true,
  label = 'Sign Here',
  required = true,
  initialValue,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  // Load initial signature if provided
  useEffect(() => {
    if (initialValue && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          setHasSignature(true);
        }
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const getCanvasContext = (): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx;
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    setLastX(x);
    setLastY(y);

    // Start a new path
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0B1121';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastX(x);
    setLastY(y);
    setHasSignature(true);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);

    // Save signature
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignature(dataUrl);
    }
  };

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignature('');
  };

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0B1121';
      }

      // Restore signature if it exists
      if (initialValue) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
          }
        };
        img.src = initialValue;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initialValue]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-midnight">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {clearable && hasSignature && (
          <button
            onClick={clearCanvas}
            className="text-xs text-warm-gray hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative border-2 border-dashed border-warm-gray/30 rounded-lg overflow-hidden bg-white hover:border-solar-flare/50 transition-colors">
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-warm-gray/50">
            <span className="text-2xl mb-1">✍️</span>
            <span className="text-sm">Sign here</span>
          </div>
        )}
      </div>

      <p className="text-xs text-warm-gray">
        Use your mouse or finger to draw your signature
      </p>
    </div>
  );
}