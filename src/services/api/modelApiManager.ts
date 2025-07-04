/**
 * @file modelApiManager.ts
 * @description Service manager for handling multiple AI service requests with rate limiting and concurrency control
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
// No core library imports needed

// 2. Internal Services
import { AuthMiddleware } from '@/services/auth/authMiddleware';
import { modelManager, type ModelGroupType } from '@/services/model';
import type { StandardResponse, DoubaoRequest, GPT4oRequest } from '@/services/model';
import { DoubaoService } from '@/services/model/doubaoService';
import { GPT4oService } from '@/services/model/gpt4oService';
import type { ModelConfig } from '@/services/model/modelService';
import { storageService } from '@/services/storage';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface GPT4oServiceRequest extends GPT4oRequest {
  count?: number;
}

interface DoubaoServiceRequest extends DoubaoRequest {
  count?: number;
}

interface GenerationResponse {
  results: StandardResponse[];
  metadata?: {
    totalRequested: number;
    successful: number;
    failed: number;
  };
}

// 流式处理回调函数类型
export type StreamCallback = (result: StandardResponse, index: number, total: number) => void;

// 流式处理请求接口
interface StreamGenerationRequest {
  count?: number;
  onProgress?: StreamCallback;
  onComplete?: (response: GenerationResponse) => void;
  onError?: (error: Error) => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const POLLING_INTERVAL = 100; // milliseconds
const DEFAULT_COUNT = 1;

// =================================================================================================
// Service Manager Class
// =================================================================================================

export class ModelApiManager {
  // --- Private Properties ---
  private static instance: ModelApiManager;
  private activeRequests: Map<ModelGroupType, number>;
  private lastRequestTime: Map<ModelGroupType, number>;
  private authMiddleware: AuthMiddleware;

  // --- Constructor ---
  private constructor() {
    this.activeRequests = new Map();
    this.lastRequestTime = new Map();
    this.authMiddleware = AuthMiddleware.getInstance();

    this.initializeCounters();
  }

  // --- Public Static Methods ---
  public static getInstance(): ModelApiManager {
    if (!ModelApiManager.instance) {
      ModelApiManager.instance = new ModelApiManager();
    }
    return ModelApiManager.instance;
  }

  // --- Private Methods ---
  private initializeCounters(): void {
    Object.keys(modelManager.getAllGroupConfigs()).forEach((group: string) => {
      this.activeRequests.set(group as ModelGroupType, 0);
      this.lastRequestTime.set(group as ModelGroupType, 0);
    });
  }

  private async waitForServiceAvailability(group: ModelGroupType): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const activeCount = this.activeRequests.get(group) || 0;
      const lastRequest = this.lastRequestTime.get(group) || 0;
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequest;
      const modelConfig = modelManager.getModelConfigByGroup(group);

      if (activeCount < modelConfig.maxConcurrent && 
          timeSinceLastRequest >= modelConfig.cooldownMs) {
        break;
      }

      // Wait for a short time before checking again
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    }
  }

  private async executeRequest<T>(
    group: ModelGroupType,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // First perform authentication check
    const isAuthenticated = await this.authMiddleware.checkAuth();
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }

    await this.waitForServiceAvailability(group);

    // Update counters
    this.activeRequests.set(group, (this.activeRequests.get(group) || 0) + 1);
    this.lastRequestTime.set(group, Date.now());

    try {
      const result = await requestFn();
      return result;
    } finally {
      // Decrease active requests count
      this.activeRequests.set(group, (this.activeRequests.get(group) || 0) - 1);
    }
  }

  // 统一图片上传到 storage
  private async uploadToStorageIfNeeded(result: StandardResponse): Promise<StandardResponse> {
    if (result.success && result.imageUrl) {
      try {
        const uploadResult = await storageService.uploadImageFromUrl(result.imageUrl);
        if (uploadResult.success && uploadResult.url) {
          return { ...result, imageUrl: uploadResult.url, message: (result.message || '') + '（已保存到存储）' };
        }
        // 上传失败，保留原始链接
        return { ...result, message: (result.message || '') + '（存储上传失败，使用原始链接）' };
      } catch (e) {
        return { ...result, message: (result.message || '') + '（存储上传异常，使用原始链接）' };
      }
    }
    return result;
  }

  private async generateMultipleImages(
    group: ModelGroupType,
    request: GPT4oServiceRequest | DoubaoServiceRequest,
    generateFn: (req: any) => Promise<any>
  ): Promise<GenerationResponse> {
    const count = request.count || DEFAULT_COUNT;
    const errors: Error[] = [];
    const results: StandardResponse[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const result: StandardResponse = await this.executeRequest(group, () => generateFn(request));
        // 统一上传到 storage
        const finalResult = await this.uploadToStorageIfNeeded(result);
        results.push({
          ...finalResult,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        errors.push(error as Error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`Some image generations failed: ${errors.length} errors`);
    }

    return {
      results: results,
      metadata: {
        totalRequested: count,
        successful: results.filter(r => r.success).length,
        failed: errors.length
      }
    };
  }

  // 流式批量处理方法
  private async generateMultipleImagesStream(
    group: ModelGroupType,
    request: GPT4oServiceRequest | DoubaoServiceRequest,
    generateFn: (req: any) => Promise<any>,
    streamRequest: StreamGenerationRequest
  ): Promise<void> {
    const count = streamRequest.count || request.count || DEFAULT_COUNT;
    const errors: Error[] = [];
    const results: StandardResponse[] = [];

    try {
      for (let i = 0; i < count; i++) {
        try {
          const result: StandardResponse = await this.executeRequest(group, () => generateFn(request));
          // 统一上传到 storage
          const finalResult = await this.uploadToStorageIfNeeded(result);
          const resultWithTimestamp = {
            ...finalResult,
            createdAt: new Date().toISOString(),
          };
          results.push(resultWithTimestamp);
          
          // 立即通过回调函数返回当前结果
          streamRequest.onProgress?.(resultWithTimestamp, i, count);
          
        } catch (error) {
          const errorResult = {
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
            createdAt: new Date().toISOString(),
          };
          
          errors.push(error as Error);
          results.push(errorResult);
          
          // 立即通过回调函数返回错误结果
          streamRequest.onProgress?.(errorResult, i, count);
        }
      }

      if (errors.length > 0) {
        console.warn(`Some image generations failed: ${errors.length} errors`);
      }

      const finalResponse: GenerationResponse = {
        results: results,
        metadata: {
          totalRequested: count,
          successful: results.filter(r => r.success).length,
          failed: errors.length
        }
      };

      // 调用完成回调
      streamRequest.onComplete?.(finalResponse);
      
    } catch (error) {
      // 调用错误回调
      streamRequest.onError?.(error as Error);
    }
  }

  // --- Public Methods ---
  public async generateImageWithGPT4o(request: GPT4oServiceRequest, modelConfig?: ModelConfig): Promise<GenerationResponse> {
    return this.generateMultipleImages('openai', request, (req) => {
      if (!modelConfig || !modelConfig.config_json?.api_key) {
        throw new Error('GPT4o 服务需要有效的 API 密钥配置');
      }
      
      const gpt4oService = new GPT4oService(modelConfig.config_json.api_key);
      return gpt4oService.generateImage({
        prompt: req.prompt,
      });
    });
  }

  public async generateImageWithDoubao(request: DoubaoServiceRequest, modelConfig?: ModelConfig): Promise<GenerationResponse> {
    return this.generateMultipleImages('doubao', request, (req) => {
      if (!modelConfig || !modelConfig.config_json?.api_key || !modelConfig.config_json?.api_secret) {
        throw new Error('Doubao 服务需要有效的 API 密钥和密钥配置');
      }
      
      const doubaoService = new DoubaoService({
        apiKey: modelConfig.config_json.api_key,
        apiSecret: modelConfig.config_json.api_secret,
        arkApiKey: modelConfig.config_json.ark_api_key
      });
      return doubaoService.generateImage({
        prompt: req.prompt,
        model: req.model,
      });
    });
  }

  public async generateImageWithGPT4oStream(
    request: GPT4oServiceRequest, 
    streamRequest: StreamGenerationRequest,
    modelConfig?: ModelConfig
  ): Promise<void> {
    return this.generateMultipleImagesStream('openai', request, (req) => {
      if (!modelConfig || !modelConfig.config_json?.api_key) {
        throw new Error('GPT4o 服务需要有效的 API 密钥配置');
      }
      
      const gpt4oService = new GPT4oService(modelConfig.config_json.api_key);
      return gpt4oService.generateImage({
        prompt: req.prompt,
      });
    }, streamRequest);
  }

  public async generateImageWithDoubaoStream(
    request: DoubaoServiceRequest, 
    streamRequest: StreamGenerationRequest,
    modelConfig?: ModelConfig
  ): Promise<void> {
    console.log('generateImageWithDoubaoStream', modelConfig);
    return this.generateMultipleImagesStream('doubao', request, (req) => {
      if (!modelConfig || !modelConfig.config_json?.api_key || !modelConfig.config_json?.api_secret) {
        throw new Error('Doubao 服务需要有效的 API 密钥和密钥配置');
      }
      
      const doubaoService = new DoubaoService({
        apiKey: modelConfig.config_json.api_key,
        apiSecret: modelConfig.config_json.api_secret,
        arkApiKey: modelConfig.config_json.ark_api_key
      });
      return doubaoService.generateImage({
        prompt: req.prompt,
        model: req.model,
      });
    }, streamRequest);
  }

  /**
   * 统一的流式图片生成方法
   * 根据模型组自动路由到对应的服务
   */
  public async generateImageStream(
    modelId: string,
    request: { prompt: string; count?: number },
    streamRequest: StreamGenerationRequest,
    modelConfig?: ModelConfig
  ): Promise<void> {
    // 检查模型状态
    const modelStatus = modelManager.getModelStatus(modelId);
    if (!modelStatus.available) {
      streamRequest.onError?.(new Error(modelStatus.error || '模型不可用'));
      return;
    }

    const model = modelStatus.model!;
    const group = model.group;

    // 根据模型组路由到对应的服务
    switch (group) {
      case 'openai':
        return this.generateImageWithGPT4oStream(
          { 
            prompt: request.prompt,
            count: request.count
          },
          streamRequest,
          modelConfig
        );
      
      case 'doubao':
        return this.generateImageWithDoubaoStream(
          { 
            prompt: request.prompt,
            model: modelId as any, // 类型断言，因为 DoubaoModel 是具体的模型 ID
            count: request.count
          },
          streamRequest,
          modelConfig
        );
      
      case 'cogview':
        // TODO: 实现 CogView 服务
        streamRequest.onError?.(new Error(`暂不支持 ${model.category} 模型组`));
        return;
      
      case 'tongyi':
        // TODO: 实现万相服务
        streamRequest.onError?.(new Error(`暂不支持 ${model.category} 模型组`));
        return;
      
      case 'jimeng':
        // TODO: 实现即梦服务
        streamRequest.onError?.(new Error(`暂不支持 ${model.category} 模型组`));
        return;
      
      default:
        streamRequest.onError?.(new Error(`不支持的模型组: ${group}`));
        return;
    }
  }

  /**
   * 统一的图片生成方法（非流式）
   * 根据模型组自动路由到对应的服务
   */
  public async generateImage(
    modelId: string,
    request: { prompt: string; count?: number },
    modelConfig?: ModelConfig
  ): Promise<GenerationResponse> {
    // 检查模型状态
    const modelStatus = modelManager.getModelStatus(modelId);
    if (!modelStatus.available) {
      throw new Error(modelStatus.error || '模型不可用');
    }

    const model = modelStatus.model!;
    const group = model.group;

    // 根据模型组路由到对应的服务
    switch (group) {
      case 'openai':
        return this.generateImageWithGPT4o({
          prompt: request.prompt,
          count: request.count
        }, modelConfig);
      
      case 'doubao':
        return this.generateImageWithDoubao({
          prompt: request.prompt,
          model: modelId as any, // 类型断言
          count: request.count
        }, modelConfig);
      
      case 'cogview':
        throw new Error(`暂不支持 ${model.category} 模型组`);
      
      case 'tongyi':
        throw new Error(`暂不支持 ${model.category} 模型组`);
      
      case 'jimeng':
        throw new Error(`暂不支持 ${model.category} 模型组`);
      
      default:
        throw new Error(`不支持的模型组: ${group}`);
    }
  }

  public getActiveRequests(group: ModelGroupType): number {
    return this.activeRequests.get(group) || 0;
  }

  public getLastRequestTime(group: ModelGroupType): number {
    return this.lastRequestTime.get(group) || 0;
  }
}

// =================================================================================================
// Singleton Export
// =================================================================================================

export const modelApiManager = ModelApiManager.getInstance();
