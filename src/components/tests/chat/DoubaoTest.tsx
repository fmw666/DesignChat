/**
 * @file DoubaoTest.tsx
 * @description 豆包文生图模型测试组件，支持模型选择、提示词输入、图片生成与缓存。
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';

// --- Third-party Libraries ---
import { SparklesIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// --- Internal Libraries ---
// --- Services ---
import type { DoubaoModel } from '@/services/model';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface CachedContent {
  prompt: string;
  model: DoubaoModel;
  images: string[];
  timestamp: number;
}

interface DoubaoResult {
  success: boolean;
  message: string;
  imageUrl?: string;
  images?: string[];
}

// =================================================================================================
// Constants
// =================================================================================================

const MODEL_NAMES: Record<DoubaoModel, string> = {
  'doubao-seedream-3-0-t2i-250415': '豆包3.0-文生图',
  high_aes_general_v21_L: '通用2.1-文生图',
  high_aes_general_v20_L: '通用2.0Pro-文生图',
  high_aes_general_v20: '通用2.0-文生图',
  high_aes_general_v14: '通用1.4-文生图',
  t2i_xl_sft: '通用XL pro-文生图',
};

const DEMO_PROMPTS: string[] = [
  '一只可爱的熊猫在竹林中玩耍，水彩风格',
  '一片樱花林，水彩风格，柔和的粉色和白色',
  '一幅山水画，国画风格，云雾缭绕',
  '未来城市，赛博朋克风格，霓虹灯光',
];

const CACHE_KEY = 'doubao_test_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

// =================================================================================================
// Component
// =================================================================================================

const DoubaoTest: FC = () => {
  // --- State and Refs ---
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<DoubaoModel>('high_aes_general_v21_L');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DoubaoResult | null>(null);

  // --- Logic and Event Handlers ---
  const saveToCache = useCallback((prompt: string, model: DoubaoModel, images: string[]) => {
    const cacheData: CachedContent = {
      prompt,
      model,
      images,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  }, []);

  const handleTest = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response: any = 'todo';
      // const response = await doubaoService.generateImage({ prompt, model: selectedModel });
      if (response?.imageUrl) {
        const imageUrl = response.imageUrl;
        setResult({
          success: true,
          message: '图片生成成功！',
          imageUrl,
          images: [imageUrl],
        });
        saveToCache(prompt, selectedModel, [imageUrl]);
      } else {
        setResult({
          success: false,
          message: '图片生成失败：未返回图片URL',
        });
      }
    } catch (error) {
      console.error('豆包服务测试失败:', error);
      setResult({
        success: false,
        message: `图片生成失败：${error instanceof Error ? error.message : '未知错误'}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedModel, saveToCache]);

  const handleDemoClick = useCallback((demoPrompt: string) => {
    setPrompt(demoPrompt);
  }, []);

  // --- Side Effects ---
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data: CachedContent = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          setPrompt(data.prompt);
          setSelectedModel(data.model);
          setResult({
            success: true,
            message: '从缓存加载成功',
            imageUrl: data.images[0],
            images: data.images,
          });
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (e) {
        console.error('Error loading cache:', e);
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }, []);

  // --- Render Logic ---
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">模型选择</h2>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value as DoubaoModel)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          {Object.entries(MODEL_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">提示词</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              输入提示词
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="输入测试提示词..."
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">示例提示词</label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PROMPTS.map((demoPrompt, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoClick(demoPrompt)}
                  className="p-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {demoPrompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTest}
          disabled={!prompt.trim() || isLoading}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              开始生成
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`bg-white rounded-lg shadow-sm p-6 ${
            result.success ? 'border border-green-200' : 'border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <SparklesIcon className="h-5 w-5 text-green-500" />
            ) : (
              <PhotoIcon className="h-5 w-5 text-red-500" />
            )}
            <h2 className="text-lg font-medium text-gray-900">生成结果</h2>
          </div>

          <p
            className={`text-sm font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {result.message}
          </p>

          {result.images && result.images.length > 0 && (
            <div className="mt-4 space-y-4">
              {result.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`生成的图片 ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default DoubaoTest;
