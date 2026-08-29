// app/lib/utils/image-processor.ts

export interface ImageValidationResult {
  valid: boolean;
  width: number;
  height: number;
  message?: string;
}

export interface ImageProcessingResult {
  success: boolean;
  processedFile?: File;
  message?: string;
  warnings?: string[];
  originalSize?: number;
  compressedSize?: number;
}

export interface ImageQualityCheck {
  passed: boolean;
  checks: {
    format: { passed: boolean; message?: string };
    size: { passed: boolean; message?: string };
    resolution: { passed: boolean; message?: string };
    aspectRatio: { passed: boolean; message?: string };
  };
}

export async function validateImage(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      
      if (width < 400 || height < 300) {
        resolve({
          valid: false,
          width,
          height,
          message: 'Image is too small. Please take a clearer photo and try again.'
        });
      } else if (width > 4000 || height > 4000) {
        resolve({
          valid: true,
          width,
          height,
          message: 'Image is large. It will be compressed for faster upload.'
        });
      } else {
        resolve({ valid: true, width, height });
      }
    };
    
    img.onerror = () => {
      resolve({
        valid: false,
        width: 0,
        height: 0,
        message: 'Failed to load image. Please try another file.'
      });
    };
    
    img.src = url;
  });
}

export async function compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/jpeg', quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function processKYCImage(
  file: File,
  expectedAspectRatio = 1.5
): Promise<ImageProcessingResult> {
  const result: ImageProcessingResult = { 
    success: true, 
    warnings: [],
    originalSize: file.size
  };
  
  // 1. Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    try {
      const converted = await convertToJPEG(file);
      file = converted;
      result.warnings?.push('Converted from ' + file.type + ' to JPEG');
    } catch {
      return {
        success: false,
        message: 'Unsupported file format. Please upload JPEG, PNG, or WebP.'
      };
    }
  }
  
  // 2. Check and compress file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    result.warnings?.push('Compressed from ' + (file.size / 1024 / 1024).toFixed(1) + 'MB');
    const compressed = await compressImage(file, 1024, 0.8);
    file = new File([compressed], file.name, { type: 'image/jpeg' });
    result.compressedSize = file.size;
  }
  
  // 3. Check resolution
  const validation = await validateImage(file);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.message || 'Image resolution too low. Minimum 400px wide.'
    };
  }
  
  // 4. Check and adjust aspect ratio
  const aspectResult = await adjustAspectRatio(file, expectedAspectRatio);
  if (aspectResult.adjusted && aspectResult.file) {
    file = aspectResult.file;
    if (aspectResult.method === 'crop') {
      result.warnings?.push('Auto-cropped to 3:2 aspect ratio');
    } else if (aspectResult.method === 'pad') {
      result.warnings?.push('Slightly adjusted to fit required format');
    }
  }
  
  // 5. Everything passed
  result.processedFile = file;
  return result;
}

async function convertToJPEG(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        canvas.toBlob((blob) => {
          if (blob) {
            const converted = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg'
            });
            resolve(converted);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.9);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function adjustAspectRatio(
  file: File, 
  targetRatio: number
): Promise<{ adjusted: boolean; file?: File; method?: 'crop' | 'pad' }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const actualRatio = img.width / img.height;
        const ratioDiff = Math.abs(actualRatio - targetRatio);
        
        if (ratioDiff > 0.3) {
          // Auto-crop to target aspect ratio
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (actualRatio > targetRatio) {
            width = height * targetRatio;
          } else {
            height = width / targetRatio;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const cropped = new File([blob], file.name, { type: 'image/jpeg' });
              resolve({ adjusted: true, file: cropped, method: 'crop' });
            } else {
              resolve({ adjusted: false });
            }
          }, 'image/jpeg', 0.9);
        } else if (ratioDiff > 0.1) {
          // Minor adjustment - add padding
          const canvas = document.createElement('canvas');
          const maxDim = Math.max(img.width, img.height);
          canvas.width = maxDim;
          canvas.height = maxDim;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, maxDim, maxDim);
            
            const xOffset = (maxDim - img.width) / 2;
            const yOffset = (maxDim - img.height) / 2;
            ctx.drawImage(img, xOffset, yOffset, img.width, img.height);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const padded = new File([blob], file.name, { type: 'image/jpeg' });
              resolve({ adjusted: true, file: padded, method: 'pad' });
            } else {
              resolve({ adjusted: false });
            }
          }, 'image/jpeg', 0.9);
        } else {
          resolve({ adjusted: false });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function checkImageQuality(file: File): Promise<ImageQualityCheck> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    const checks: ImageQualityCheck['checks'] = {
      format: { passed: false },
      size: { passed: false },
      resolution: { passed: false },
      aspectRatio: { passed: false }
    };
    
    img.onload = () => {
      // Format check
      const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      checks.format.passed = allowedFormats.includes(file.type);
      if (!checks.format.passed) {
        checks.format.message = 'Format not supported. Use JPEG, PNG, or WebP.';
      }
      
      // Size check (max 5MB)
      checks.size.passed = file.size <= 5 * 1024 * 1024;
      if (!checks.size.passed) {
        checks.size.message = 'File too large. Maximum 5MB.';
      }
      
      // Resolution check
      checks.resolution.passed = img.width >= 400 && img.height >= 300;
      if (!checks.resolution.passed) {
        checks.resolution.message = 'Resolution too low. Minimum 400px wide.';
      }
      
      // Aspect ratio check (3:2)
      const ratio = img.width / img.height;
      checks.aspectRatio.passed = Math.abs(ratio - 1.5) <= 0.3;
      if (!checks.aspectRatio.passed) {
        checks.aspectRatio.message = 'Aspect ratio not ideal. 3:2 recommended.';
      }
      
      const allPassed = Object.values(checks).every(c => c.passed);
      resolve({ passed: allPassed, checks });
    };
    
    img.onerror = () => {
      resolve({
        passed: false,
        checks: {
          format: { passed: false, message: 'Could not read image.' },
          size: { passed: false, message: 'Could not read image.' },
          resolution: { passed: false, message: 'Could not read image.' },
          aspectRatio: { passed: false, message: 'Could not read image.' }
        }
      });
    };
    
    img.src = url;
  });
}