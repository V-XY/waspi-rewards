export interface ImageValidationResult {
  valid: boolean;
  width: number;
  height: number;
  message?: string;
}

export function validateImage(file: File): Promise<ImageValidationResult> {
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

export function compressImage(file: File, maxWidth = 1024): Promise<Blob> {
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
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}