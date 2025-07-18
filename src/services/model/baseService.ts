/**
 * @file baseService.ts
 * @description Base service for all model services
 * @author fmw666@github
 * @date 2025-07-18
 */

// 添加标准响应接口
export interface StandardResponse {
  success: boolean;
  message?: string;
  imageUrl?: string;
  error?: string;
  text?: string;
  createdAt?: string;
}
