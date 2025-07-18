/**
 * @file index.ts
 * @description Storage service exports
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Exports
// =================================================================================================

export {
  storageService,
  type StorageConfig,
  type UploadResult,
  type StorageError,
} from './storageService';

export {
  getImageMetadata,
  optimizeImage,
  base64ToBlob,
  blobToBase64,
  isValidImage,
  generateThumbnail,
  batchProcessImages,
  formatFileSize,
  isImageSizeValid,
  getMimeTypeFromExtension,
  getExtensionFromFilename,
  type ImageOptimizationOptions,
  type ImageMetadata
} from './imageUtils';
