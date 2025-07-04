/**
 * @file corsProxy.ts
 * @description CORS 代理工具类，用于解决跨域图片访问问题
 * @author fmw666@github
 */

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface ProxyService {
  name: string;
  url: string;
  transform: (originalUrl: string) => string;
  headers?: Record<string, string>;
}

export interface ProxyResult {
  success: boolean;
  data?: Response;
  error?: string;
  proxyUsed?: string;
}

// =================================================================================================
// Proxy Services Configuration
// =================================================================================================

const PROXY_SERVICES: ProxyService[] = [
  {
    name: 'corsproxy.io',
    url: 'https://corsproxy.io/',
    transform: (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    name: 'allorigins.win',
    url: 'https://api.allorigins.win/',
    transform: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    name: 'cors-anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    transform: (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://cors-anywhere.herokuapp.com'
    }
  },
  {
    name: 'thingproxy',
    url: 'https://thingproxy.freeboard.io/',
    transform: (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
];

// =================================================================================================
// CORS Proxy Class
// =================================================================================================

export class CorsProxy {
  private static instance: CorsProxy;
  private proxyServices: ProxyService[];

  public static getInstance(): CorsProxy {
    if (!CorsProxy.instance) {
      CorsProxy.instance = new CorsProxy();
    }
    return CorsProxy.instance;
  }

  private constructor() {
    this.proxyServices = [...PROXY_SERVICES];
  }

  /**
   * 尝试直接访问 URL
   */
  private async tryDirectAccess(url: string): Promise<Response | null> {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn('直接访问失败:', error);
    }
    
    return null;
  }

  /**
   * 通过代理服务访问 URL
   */
  private async tryProxyAccess(
    url: string, 
    proxyService: ProxyService
  ): Promise<{ response: Response | null, error?: any }> {
    try {
      const proxyUrl = proxyService.transform(url);
      console.log(`尝试使用代理 ${proxyService.name}: ${proxyUrl}`);
      const response = await fetch(proxyUrl, {
        headers: proxyService.headers || {}
      });
      if (response.ok) {
        console.log(`代理 ${proxyService.name} 成功`);
        return { response };
      }
      return { response: null, error: `HTTP ${response.status}` };
    } catch (error) {
      console.warn(`代理 ${proxyService.name} 失败:`, error);
      return { response: null, error };
    }
  }

  /**
   * 获取图片内容，自动处理 CORS 问题
   */
  public async fetchImage(url: string): Promise<ProxyResult> {
    // 首先尝试直接访问
    const directResponse = await this.tryDirectAccess(url);
    if (directResponse) {
      return {
        success: true,
        data: directResponse,
        proxyUsed: 'direct'
      };
    }

    // 如果直接访问失败，尝试所有代理服务
    let lastError = '';
    for (const proxyService of this.proxyServices) {
      const { response, error } = await this.tryProxyAccess(url, proxyService);
      if (response) {
        return {
          success: true,
          data: response,
          proxyUsed: proxyService.name
        };
      }
      if (error) lastError = error?.toString();
    }

    // 所有方法都失败
    return {
      success: false,
      error: '所有访问方法都失败，包括直接访问和所有 CORS 代理。最后错误: ' + lastError
    };
  }

  /**
   * 获取图片作为 Blob
   */
  public async fetchImageAsBlob(url: string): Promise<{ success: boolean; blob?: Blob; error?: string; proxyUsed?: string }> {
    // 先尝试所有代理，直到有一个能成功解析 blob
    for (const proxyService of [null, ...this.proxyServices]) {
      let result: ProxyResult;
      if (proxyService === null) {
        // 直接访问
        const directResponse = await this.tryDirectAccess(url);
        if (!directResponse) continue;
        result = { success: true, data: directResponse, proxyUsed: 'direct' };
      } else {
        const { response } = await this.tryProxyAccess(url, proxyService);
        if (!response) continue;
        result = { success: true, data: response, proxyUsed: proxyService.name };
      }
      try {
        const blob = await result.data!.blob();
        return {
          success: true,
          blob,
          proxyUsed: result.proxyUsed
        };
      } catch (error) {
        // blob 解析失败，继续下一个代理
        continue;
      }
    }
    return {
      success: false,
      error: '所有代理和直接访问都无法正确获取图片内容'
    };
  }

  /**
   * 添加自定义代理服务
   */
  public addProxyService(service: ProxyService): void {
    this.proxyServices.push(service);
  }

  /**
   * 移除代理服务
   */
  public removeProxyService(serviceName: string): void {
    this.proxyServices = this.proxyServices.filter(service => service.name !== serviceName);
  }

  /**
   * 获取当前可用的代理服务列表
   */
  public getProxyServices(): ProxyService[] {
    return [...this.proxyServices];
  }
}

// =================================================================================================
// Export Singleton Instance
// =================================================================================================

export const corsProxy = CorsProxy.getInstance();
