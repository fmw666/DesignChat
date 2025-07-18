/**
 * @file storageService.ts
 * @description StorageService singleton for Supabase S3 storage operations, including image upload and URL management.
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

import { supabase } from '@/services/api/supabase';
import { corsProxy } from '@/utils/corsProxy';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface StorageConfig {
  bucketName: string;
  allowedMimeTypes: string[];
  maxFileSize: number; // in bytes
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

export interface StorageError {
  message: string;
  code?: string;
  details?: any;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_CONFIG: StorageConfig = {
  bucketName: 'designchat',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
};

// =================================================================================================
// Class Definition
// =================================================================================================

export class StorageService {
  // --------------------------------------------------------------------------------
  // Singleton Instance
  // --------------------------------------------------------------------------------
  private static instance: StorageService;
  private config: StorageConfig;

  public static getInstance(config?: Partial<StorageConfig>): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(config);
    }
    return StorageService.instance;
  }

  private constructor(config?: Partial<StorageConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // --------------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------------

  /**
   * 生成唯一的文件名
   */
  private generateFileName(originalName: string, mimeType: string): string {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 15);
    const extension = mimeType.split('/')[1] || 'jpg';
    return `${date}_${originalName}_${random}.${extension}`;
  }

  /**
   * 验证文件类型
   */
  private validateFileType(mimeType: string): boolean {
    return this.config.allowedMimeTypes.includes(mimeType);
  }

  /**
   * 验证文件大小
   */
  private validateFileSize(size: number): boolean {
    return size <= this.config.maxFileSize;
  }

  // --------------------------------------------------------------------------------
  // Core Storage Methods
  // --------------------------------------------------------------------------------

  /**
   * 上传图片到 Supabase Storage
   */
  public async uploadImage(
    file: File | Blob,
    fileName?: string,
  ): Promise<UploadResult> {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client is not initialized',
      };
    }

    try {
      // 验证文件类型
      if (!this.validateFileType(file.type)) {
        return {
          success: false,
          error: `不支持的文件类型: ${file.type}`,
        };
      }

      // 验证文件大小
      if (!this.validateFileSize(file.size)) {
        return {
          success: false,
          error: `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // 生成文件名
      const finalFileName = fileName || this.generateFileName('image', file.type);

      // 执行上传
      console.log('Uploading file to Supabase S3 Storage:', finalFileName);
      const { data, error } = await supabase.storage.from(this.config.bucketName).upload(finalFileName, file);
      if (error) {
        throw error;
      }
      console.log('Uploaded file to Supabase S3 Storage:', data);

      // 构建公共访问 URL
      const publicUrl = await this.getPublicUrl(finalFileName);

      return {
        success: true,
        url: publicUrl,
        metadata: {
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      };
    }
  }

  /**
   * 从 URL 下载图片并上传到存储
   */
  public async uploadImageFromUrl(
    imageUrl: string,
    fileName?: string,
  ): Promise<UploadResult> {
    try {
      console.log('开始从 URL 下载图片:', imageUrl);
      
      // 使用 CORS 代理工具获取图片
      const result = await corsProxy.fetchImageAsBlob(imageUrl);
      
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || '无法获取图片内容',
        };
      }

      console.log(`图片获取成功，使用代理: ${result.proxyUsed}`);

      // 创建 File 对象
      const file = new File([result.blob], fileName || 'downloaded-image', {
        type: result.blob.type || 'image/jpeg',
      });

      // 上传到存储
      return await this.uploadImage(file, fileName);
    } catch (error) {
      console.error('Upload from URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '从 URL 上传失败',
      };
    }
  }

  /**
   * 获取文件的公共 URL
   */
  public async getPublicUrl(filePath: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data } = supabase.storage.from(this.config.bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * 删除文件
   */
  public async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { error } = await supabase.storage.from(this.config.bucketName).remove([filePath]);
      if (error) {
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除失败',
      };
    }
  }

  // --------------------------------------------------------------------------------
  // Configuration Methods
  // --------------------------------------------------------------------------------

  /**
   * 更新存储配置
   */
  public updateConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  public getConfig(): StorageConfig {
    return { ...this.config };
  }
}

// =================================================================================================
// Export Singleton Instance
// =================================================================================================

export const storageService = StorageService.getInstance({
  bucketName: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_NAME || 'designchat',
});
