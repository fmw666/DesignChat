/*
豆包AI绘图服务

参考官方文档：https://www.volcengine.com/docs/6791/1279296
核心：
  1. 接口单次调用出图1张，输出4张图的话，强烈建议通过排队，第一秒发出前2张生图请求，第二秒发出后2张生图请求，可在不增购QPS情况下更好的使用服务。
*/

import { StandardResponse } from './baseService';

export type DoubaoModel = 
  | 'doubao-seedream-3-0-t2i-250415'  // 通用3.0-文生图
  | 'high_aes_general_v21_L'  // 通用2.1-文生图
  | 'high_aes_general_v20_L'  // 通用2.0Pro-文生图
  | 'high_aes_general_v20'  // 通用2.0-文生图
  | 'high_aes_general_v14'  // 通用1.4-文生图
  | 't2i_xl_sft'  // 通用XL pro-文生图

export interface DoubaoConfig {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  region: string;
  service: string;
  defaultModel: DoubaoModel;
  host: string;
  arkApiKey: string;
}

export type DoubaoConfigInput = Pick<DoubaoConfig, 'apiKey' | 'apiSecret' | 'arkApiKey'> & Partial<Omit<DoubaoConfig, 'apiKey' | 'apiSecret' | 'arkApiKey'>>;

export interface DoubaoRequest {
  prompt: string;
  model?: DoubaoModel;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  cfgScale?: number;
  imageUrl?: string;  // For img2img tasks
  maskUrl?: string;   // For inpainting tasks
  strength?: number;  // For img2img tasks
}

export interface DoubaoResponse {
  message: 'Success' | 'Failed';
  request_id: string;
  status: number;
  data?: {
    image_urls: string[];
  };
}

export class DoubaoService {
  private config: DoubaoConfig;
  private defaultModel: DoubaoModel;

  constructor(config: DoubaoConfigInput) {
    this.config = {
      endpoint: import.meta.env.DEV ? '/api/doubao' : 'https://visual.volcengineapi.com',
      region: 'cn-north-1',
      service: 'cv',
      host: 'visual.volcengineapi.com',
      defaultModel: 'high_aes_general_v21_L',
      ...config,
      apiKey: import.meta.env.VITE_DOUBAO_API_KEY || '',
      apiSecret: import.meta.env.VITE_DOUBAO_API_SECRET || '',
      arkApiKey: import.meta.env.VITE_DOUBAO_ARK_API_KEY || '',
    };
    console.log('DoubaoService', this.config);
    this.defaultModel = this.config.defaultModel;
  }

  private signStringEncoder(source: string): string {
    return encodeURIComponent(source).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  private async hashSHA256(content: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error in hashSHA256:', error);
      throw error;
    }
  }

  private async hmacSHA256(
    key: string | Uint8Array,
    content: string,
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = key instanceof Uint8Array ? key : encoder.encode(key);
    const contentData = encoder.encode(content);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      contentData
    );

    return new Uint8Array(signature);
  }

  private async genSigningSecretKeyV4(
    secretKey: string,
    date: string,
    region: string,
    service: string,
  ): Promise<Uint8Array> {
    const kDate = await this.hmacSHA256(secretKey, date);
    const kRegion = await this.hmacSHA256(kDate, region);
    const kService = await this.hmacSHA256(kRegion, service);
    return await this.hmacSHA256(kService, 'request');
  }

  private async makeRequest(payload: any): Promise<any> {
    const method = 'POST';
    const action = 'CVProcess';
    const version = '2022-08-31';
    const url = `${this.config.endpoint}?Action=${action}&Version=${version}`;

    const body = JSON.stringify({
      ...payload,
    });
    const xContentSha256 = await this.hashSHA256(body);
    const xDate = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
    const shortXDate = xDate.substring(0, 8);
    const credentialScope = `${shortXDate}/${this.config.region}/${this.config.service}/request`;
    const signHeader = 'host;x-date;x-content-sha256;content-type';
    const contentType = 'application/json';

    const queryString = Array.from(new Map([
      ['Action', action],
      ['Version', version],
    ]).entries())
      .map(
        ([key, value]) =>
          `${this.signStringEncoder(key)}=${this.signStringEncoder(value)}`,
      )
      .join('&');

    const canonicalString = [
      method,
      '/',
      queryString,
      `host:${this.config.host}`,
      `x-date:${xDate}`,
      `x-content-sha256:${xContentSha256}`,
      `content-type:${contentType}`,
      '',
      signHeader,
      xContentSha256,
    ].join('\n');

    const hashCanonicalString = await this.hashSHA256(canonicalString);
    const stringToSign = [
      'HMAC-SHA256',
      xDate,
      credentialScope,
      hashCanonicalString,
    ].join('\n');

    const signKey = await this.genSigningSecretKeyV4(
      this.config.apiSecret,
      shortXDate,
      this.config.region,
      this.config.service,
    );

    const signature = Array.from(await this.hmacSHA256(signKey, stringToSign))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Host': this.config.host,
          'X-Date': xDate,
          'X-Content-Sha256': xContentSha256,
          'Content-Type': contentType,
          'Authorization': `HMAC-SHA256 Credential=${this.config.apiKey}/${credentialScope}, SignedHeaders=${signHeader}, Signature=${signature}`,
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Doubao API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Doubao API request failed:', error);
      throw error;
    }
  }

  async generateImage(request: DoubaoRequest): Promise<StandardResponse> {
    const model = request.model || this.defaultModel;

    // 新增：支持 Ark seedream 3.0
    if (model === 'doubao-seedream-3-0-t2i-250415') {
      try {
        const response = await fetch(import.meta.env.DEV ? '/api/ark' : 'https://ark.cn-beijing.volces.com/api/v3/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.arkApiKey}`,
          },
          body: JSON.stringify({
            model,
            prompt: request.prompt,
            watermark: false
          }),
        });
        const result = await response.json();
        if (response.ok && result?.data?.length > 0) {
          const originalImageUrl = result.data[0].url;
          // 只返回原始图片 URL，不上传到 storage
          return {
            success: true,
            message: '图片生成成功！',
            imageUrl: originalImageUrl,
          };
        }
        return {
          success: false,
          error: result?.message || '未返回图片URL',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
        };
      }
    }

    // 其它模型走原有火山接口
    const payload = {
      req_key: model,
      prompt: request.prompt,
      return_url: true,
    };

    try {
      const response: DoubaoResponse = await this.makeRequest(payload);
      if (response.message === 'Success' && response.data?.image_urls && response.data?.image_urls?.length > 0) {
        const originalImageUrl = response.data.image_urls[0];
        // 只返回原始图片 URL，不上传到 storage
        return {
          success: true,
          message: '图片生成成功！',
          imageUrl: originalImageUrl,
        };
      }
      return {
        success: false,
        error: '未返回图片URL',
      };
    } catch (error) {
      console.error('Doubao API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 测试服务配置是否正确
   * 这个方法会尝试生成一个简单的测试图片来验证服务是否可用
   */
  async testService(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🧪 开始测试 DoubaoService...');
      console.log('📋 配置信息:', {
        endpoint: this.config.endpoint,
        region: this.config.region,
        service: this.config.service,
        host: this.config.host,
        defaultModel: this.config.defaultModel,
        hasApiKey: !!this.config.apiKey,
        hasApiSecret: !!this.config.apiSecret,
      });

      // 检查必需的配置
      if (!this.config.apiKey || !this.config.apiSecret) {
        return {
          success: false,
          message: '❌ API 密钥配置缺失',
          details: {
            hasApiKey: !!this.config.apiKey,
            hasApiSecret: !!this.config.apiSecret,
          }
        };
      }

      // 尝试生成一个简单的测试图片
      const testRequest: DoubaoRequest = {
        prompt: '一只可爱的小猫，高清图片',
        model: this.defaultModel,
      };

      console.log('🎨 尝试生成测试图片...');
      const result = await this.generateImage(testRequest);

      if (result.success) {
        console.log('✅ 测试成功！图片生成成功');
        return {
          success: true,
          message: '✅ DoubaoService 配置正确，可以正常使用！',
          details: {
            imageUrl: result.imageUrl,
            model: testRequest.model,
          }
        };
      } else {
        console.log('❌ 测试失败：', result.error);
        return {
          success: false,
          message: `❌ 图片生成失败: ${result.error}`,
          details: result
        };
      }
    } catch (error) {
      console.error('💥 测试过程中发生错误:', error);
      return {
        success: false,
        message: `💥 测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: error
      };
    }
  }
}
