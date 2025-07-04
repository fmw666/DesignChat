import { StandardResponse } from './baseService';

export interface GPT4oRequest {
  prompt: string;
  model?: string;
  stream?: boolean;
  onContent?: (content: { type: 'text' | 'image', content: string }) => void;
}

export interface GPT4oStreamChunk {
  id: string;
  object: string;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string | null;
    delta: {
      role?: string;
      content: string;
    };
  }>;
}

export class GPT4oService {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GPT4oService 需要有效的 API 密钥');
    }
    this.apiKey = apiKey;
    this.endpoint = 'https://api.piapi.ai/v1/chat/completions';
  }

  async generateImage(request: GPT4oRequest): Promise<StandardResponse> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'gpt-4o-image',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: request.prompt
                }
              ]
            }
          ],
          stream: request.stream || false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `GPT-4 API error: ${response.status} ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let imageUrl = '';
      let textContent = '';
      let lastContent = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed: GPT4oStreamChunk = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                // 处理图片URL
                if (content.includes('https://storage.theapi.app/image/')) {
                  const imageMatch = content.match(/https:\/\/storage\.theapi\.app\/image\/[^)]+/);
                  if (imageMatch) {
                    imageUrl = imageMatch[0];
                    request.onContent?.({ type: 'image', content: imageUrl });
                  }
                }
                // 处理文本内容
                if (content.trim() && !content.includes('https://storage.theapi.app/image/')) {
                  if (content.includes('\n')) {
                    textContent += content;
                  } else {
                    if (lastContent.endsWith('\n') || content.startsWith('\n')) {
                      textContent += content;
                    } else {
                      textContent += content;
                    }
                  }
                  lastContent = content;
                  request.onContent?.({ type: 'text', content });
                }
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      if (imageUrl) {
        // 只返回原始图片 URL，不上传到 storage
        return {
          success: true,
          message: '图片生成成功！',
          imageUrl,
          text: textContent || undefined,
        };
      }

      if (textContent) {
        return {
          success: false,
          error: '未返回图片URL',
          text: textContent,
        };
      }

      throw new Error('未返回图片URL');
    } catch (error) {
      console.error('GPT-4 API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }
}
