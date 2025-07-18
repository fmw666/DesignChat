/**
 * @file imageUtils.ts
 * @description Image utility functions for processing, optimizing, and managing images
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface ImageOptimizationOptions {
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  aspectRatio: number;
}

// =================================================================================================
// Utility Functions
// =================================================================================================

/**
 * 获取图片元数据
 */
export async function getImageMetadata(file: File | Blob): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        aspectRatio: img.width / img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * 优化图片
 */
export async function optimizeImage(
  file: File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    quality = 0.8,
    maxWidth,
    maxHeight,
    format = 'jpeg',
    maintainAspectRatio = true,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      let { width, height } = img;

      // 计算新的尺寸
      if (maxWidth || maxHeight) {
        const aspectRatio = width / height;
        
        if (maxWidth && maxHeight) {
          if (maintainAspectRatio) {
            if (width > height) {
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
            }
          } else {
            width = Math.min(width, maxWidth);
            height = Math.min(height, maxHeight);
          }
        } else if (maxWidth) {
          width = Math.min(width, maxWidth);
          height = maintainAspectRatio ? width / aspectRatio : height;
        } else if (maxHeight) {
          height = Math.min(height, maxHeight);
          width = maintainAspectRatio ? height * aspectRatio : width;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * 将 Base64 转换为 Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * 将 Blob 转换为 Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 检查图片是否有效
 */
export function isValidImage(file: File | Blob): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(
  file: File | Blob,
  size: number = 150
): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
    maintainAspectRatio: true,
  });
}

/**
 * 批量处理图片
 */
export async function batchProcessImages(
  files: (File | Blob)[],
  processor: (file: File | Blob) => Promise<Blob>
): Promise<Blob[]> {
  const results: Blob[] = [];
  
  for (const file of files) {
    try {
      const processed = await processor(file);
      results.push(processed);
    } catch (error) {
      console.error('Failed to process image:', error);
      // 如果处理失败，使用原文件
      results.push(file instanceof File ? file : new File([file], 'image'));
    }
  }
  
  return results;
}

/**
 * 计算文件大小的人类可读格式
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 检查图片尺寸是否在指定范围内
 */
export function isImageSizeValid(
  width: number,
  height: number,
  minWidth: number = 1,
  minHeight: number = 1,
  maxWidth: number = 10000,
  maxHeight: number = 10000
): boolean {
  return width >= minWidth && 
         height >= minHeight && 
         width <= maxWidth && 
         height <= maxHeight;
}

/**
 * 获取图片的 MIME 类型
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}

/**
 * 从文件名获取扩展名
 */
export function getExtensionFromFilename(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
