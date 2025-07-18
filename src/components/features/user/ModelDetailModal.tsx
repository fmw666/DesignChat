/**
 * @file ModelDetailModal.tsx
 * @description Modal component for displaying detailed information about AI models
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Internal Libraries ---
// --- Components ---
import { Modal } from '@/components/shared/common/Modal';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: {
    type: 'free' | 'pay-per-use' | 'subscription';
    details: string;
  };
  capabilities: {
    imageGeneration: boolean;
    imageEditing: boolean;
    textToImage: boolean;
    imageToImage: boolean;
    inpainting: boolean;
    outpainting: boolean;
  };
  performance: {
    speed: 'fast' | 'medium' | 'slow';
    quality: 'high' | 'medium' | 'low';
    resolution: string;
  };
  requirements: {
    apiKey: boolean;
    apiSecret: boolean;
    systemPrompt: boolean;
  };
  documentation: string;
  examples: string[];
}

interface ModelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
}

// =================================================================================================
// Constants
// =================================================================================================

const MODEL_INFO: Record<string, ModelInfo> = {
  doubao: {
    id: 'doubao',
    name: '豆包',
    description: '字节跳动推出的AI绘画模型，支持多种艺术风格和创作需求，具有强大的图像生成和编辑能力。',
    features: [
      '支持多种艺术风格（写实、动漫、水彩、油画等）',
      '高质量图像生成，分辨率可达1024x1024',
      '智能提示词优化和自动补全',
      '支持图像编辑和风格转换',
      '中文优化，理解中文提示词更准确',
      '快速生成，响应时间短'
    ],
    pricing: {
      type: 'pay-per-use',
      details: '按调用次数计费，具体价格请参考官方文档'
    },
    capabilities: {
      imageGeneration: true,
      imageEditing: true,
      textToImage: true,
      imageToImage: true,
      inpainting: true,
      outpainting: true
    },
    performance: {
      speed: 'fast',
      quality: 'high',
      resolution: '最高1024x1024'
    },
    requirements: {
      apiKey: true,
      apiSecret: true,
      systemPrompt: false
    },
    documentation: 'https://www.doubao.com/docs',
    examples: [
      '一只可爱的熊猫在竹林中玩耍，水彩风格',
      '现代城市夜景，霓虹灯闪烁，写实风格',
      '古风美女，樱花飘落，动漫风格'
    ]
  },
  tongyi: {
    id: 'tongyi',
    name: '通义万相',
    description: '阿里云推出的AI绘画模型，基于先进的深度学习技术，能够生成高质量的艺术作品和创意图像。',
    features: [
      '支持多种艺术风格和创作类型',
      '高质量图像生成，细节丰富',
      '智能构图和色彩搭配',
      '支持多种宽高比设置',
      '批量生成功能',
      '云端处理，无需本地GPU'
    ],
    pricing: {
      type: 'pay-per-use',
      details: '按调用次数计费，新用户有免费额度'
    },
    capabilities: {
      imageGeneration: true,
      imageEditing: true,
      textToImage: true,
      imageToImage: true,
      inpainting: true,
      outpainting: true
    },
    performance: {
      speed: 'medium',
      quality: 'high',
      resolution: '最高1024x1024'
    },
    requirements: {
      apiKey: true,
      apiSecret: true,
      systemPrompt: true
    },
    documentation: 'https://help.aliyun.com/zh/dashscope/',
    examples: [
      '一片樱花林，水彩风格，柔和的粉色和白色',
      '一幅山水画，国画风格，云雾缭绕',
      '科幻城市，未来建筑，霓虹灯效果'
    ]
  }
};

// =================================================================================================
// Component
// =================================================================================================

export const ModelDetailModal: FC<ModelDetailModalProps> = ({ isOpen, onClose, modelId }) => {
  // --- Hooks ---
  const { t } = useTranslation();

  // --- Render Logic ---
  const modelInfo = MODEL_INFO[modelId];
  
  if (!modelInfo) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={''}
      maxWidth="sm"
      closeOnBackdropClick={true}
      zIndex={1000}
    >
      <div className="relative flex flex-col items-center justify-center min-h-[220px] py-10 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900/30 dark:via-gray-900 dark:to-purple-900/30 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
          {modelInfo.name}
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 text-center max-w-md mb-2">
          {modelInfo.description}
        </p>
        {/* 右下角查看文档按钮 */}
        <a
          href={modelInfo.documentation}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed md:absolute right-8 bottom-8 px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition-colors z-50"
          style={{ minWidth: 120, textAlign: 'center' }}
        >
          {t('settings.models.detail.viewDocs')}
        </a>
      </div>
    </Modal>
  )
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ModelDetailModal;
