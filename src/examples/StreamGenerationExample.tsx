/**
 * @file StreamGenerationExample.tsx
 * @description 流式批量图片生成使用示例
 * @author fmw666@github
 */

import { useState, useCallback } from 'react';
import { modelApiManager } from '@/services/api';
import type { DoubaoModel, StandardResponse } from '@/services/model';

/**
 * 流式批量生成图片示例
 * 每生成一张图片就立即返回结果，而不是等所有图片都生成完成后再一次性返回
 */
export const streamGenerationExample = async () => {
  const prompt = "一只可爱的小猫在花园里玩耍";
  const model: DoubaoModel = 'high_aes_general_v21_L';
  const count = 3;

  console.log('开始流式批量生成图片...');

  try {
    await modelApiManager.generateImageWithDoubaoStream(
      {
        prompt,
        model,
        count,
      },
      {
        count,
        // 进度回调：每生成一张图片就调用一次
        onProgress: (result, index, total) => {
          console.log(`✅ 第 ${index + 1}/${total} 张图片生成完成:`, {
            success: result.success,
            imageUrl: result.imageUrl,
            error: result.error,
            timestamp: result.createdAt,
          });

          // 在这里可以立即更新UI，显示刚生成的图片
          // 例如：更新图片列表、显示进度条等
        },

        // 完成回调：所有图片都生成完成后调用
        onComplete: (response) => {
          console.log('🎉 批量生成完成！', {
            totalRequested: response.metadata?.totalRequested,
            successful: response.metadata?.successful,
            failed: response.metadata?.failed,
          });

          // 在这里可以执行完成后的操作
          // 例如：显示完成提示、保存结果等
        },

        // 错误回调：如果整个批量过程出错时调用
        onError: (error) => {
          console.error('❌ 批量生成出错:', error);
          
          // 在这里可以处理错误
          // 例如：显示错误提示、重试机制等
        },
      }
    );

  } catch (error) {
    console.error('流式生成失败:', error);
  }
};

/**
 * 在React组件中使用流式批量生成的示例
 */
export const useStreamGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<StandardResponse[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const startGeneration = useCallback(async (
    prompt: string, 
    model: DoubaoModel, 
    count: number
  ) => {
    setIsGenerating(true);
    setResults([]);
    setProgress({ current: 0, total: count });

    try {
      await modelApiManager.generateImageWithDoubaoStream(
        { prompt, model, count },
        {
          count,
          onProgress: (result, index, total) => {
            // 立即更新结果列表
            setResults((prev: StandardResponse[]) => [...prev, result]);
            setProgress({ current: index + 1, total });
          },
          onComplete: (response) => {
            setIsGenerating(false);
            console.log('生成完成:', response);
          },
          onError: (error) => {
            setIsGenerating(false);
            console.error('生成出错:', error);
          },
        }
      );
    } catch (error) {
      setIsGenerating(false);
      console.error('启动生成失败:', error);
    }
  }, []);

  return {
    isGenerating,
    results,
    progress,
    startGeneration,
  };
};

/**
 * 使用示例：
 * 
 * // 1. 简单调用
 * await streamGenerationExample();
 * 
 * // 2. 在React组件中使用
 * const { isGenerating, results, progress, startGeneration } = useStreamGeneration();
 * 
 * const handleGenerate = () => {
 *   startGeneration("一只可爱的小猫", "high_aes_general_v21_L", 3);
 * };
 * 
 * // 3. 在组件中显示结果
 * {results.map((result, index) => (
 *   <div key={index}>
 *     {result.success ? (
 *       <img src={result.imageUrl} alt={`Generated ${index + 1}`} />
 *     ) : (
 *       <div>生成失败: {result.error}</div>
 *     )}
 *   </div>
 * ))}
 */
