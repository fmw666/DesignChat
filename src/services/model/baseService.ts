
// 添加标准响应接口
export interface StandardResponse {
  success: boolean;
  message?: string;
  imageUrl?: string;
  error?: string;
  text?: string;
  createdAt?: string;
}
