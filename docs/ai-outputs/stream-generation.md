# 流式批量图片生成功能

## 概述

流式批量图片生成功能允许您在批量生成多张图片时，每生成一张图片就立即返回结果，而不是等所有图片都生成完成后再一次性返回。这提供了更好的用户体验，用户可以实时看到生成进度和结果。

## 功能特点

- ✅ **实时进度反馈**：每生成一张图片就立即返回结果
- ✅ **进度条显示**：实时显示生成进度和百分比
- ✅ **错误处理**：单个图片生成失败不影响其他图片的生成
- ✅ **速率限制**：自动处理API速率限制，确保请求合规
- ✅ **类型安全**：完整的TypeScript类型支持

## 使用方法

### 1. 基本用法

```typescript
import { modelApiManager } from '@/services/api/modelApiManager';
import { DoubaoModel } from '@/services/model/doubaoService';

// 开始流式批量生成
await modelApiManager.generateImageWithDoubaoStream(
  {
    prompt: "一只可爱的小猫在花园里玩耍",
    model: "high_aes_general_v21_L",
    count: 3,
  },
  {
    count: 3,
    // 进度回调：每生成一张图片就调用一次
    onProgress: (result, index, total) => {
      console.log(`第 ${index + 1}/${total} 张图片生成完成:`, result);
      // 在这里可以立即更新UI
    },
    // 完成回调：所有图片都生成完成后调用
    onComplete: (response) => {
      console.log('批量生成完成！', response);
    },
    // 错误回调：如果整个批量过程出错时调用
    onError: (error) => {
      console.error('批量生成出错:', error);
    },
  }
);
```

### 2. 在React组件中使用

```typescript
import React, { useState, useCallback } from 'react';
import { modelApiManager } from '@/services/api/modelApiManager';

const ImageGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setResults([]);
    setProgress({ current: 0, total: 3 });

    try {
      await modelApiManager.generateImageWithDoubaoStream(
        {
          prompt: "一只可爱的小猫",
          model: "high_aes_general_v21_L",
          count: 3,
        },
        {
          count: 3,
          onProgress: (result, index, total) => {
            // 立即更新结果列表
            setResults(prev => [...prev, result]);
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

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? '生成中...' : '开始生成'}
      </button>
      
      {/* 进度条 */}
      {isGenerating && (
        <div>
          <div>进度: {progress.current} / {progress.total}</div>
          <div style={{ width: '100%', backgroundColor: '#eee' }}>
            <div 
              style={{ 
                width: `${(progress.current / progress.total) * 100}%`, 
                backgroundColor: '#007bff',
                height: '20px'
              }} 
            />
          </div>
        </div>
      )}
      
      {/* 结果展示 */}
      <div>
        {results.map((result, index) => (
          <div key={index}>
            {result.success ? (
              <img src={result.imageUrl} alt={`Generated ${index + 1}`} />
            ) : (
              <div>生成失败: {result.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. 使用自定义Hook

```typescript
import { useStreamGeneration } from '@/examples/StreamGenerationExample';

const MyComponent: React.FC = () => {
  const { isGenerating, results, progress, startGeneration } = useStreamGeneration();

  const handleGenerate = () => {
    startGeneration("一只可爱的小猫", "high_aes_general_v21_L", 3);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        开始生成
      </button>
      
      {/* 显示结果 */}
      {results.map((result, index) => (
        <div key={index}>
          {result.success && <img src={result.imageUrl} alt={`Generated ${index + 1}`} />}
        </div>
      ))}
    </div>
  );
};
```

## API 参考

### ModelApiManager 方法

#### `generateImageWithDoubaoStream(request, streamRequest)`

- **request**: `DoubaoServiceRequest`
  - `prompt`: 图片生成提示词
  - `model`: 模型名称
  - `count`: 生成数量（可选，默认1）

- **streamRequest**: `StreamGenerationRequest`
  - `count`: 生成数量
  - `onProgress`: 进度回调函数 `(result, index, total) => void`
  - `onComplete`: 完成回调函数 `(response) => void`
  - `onError`: 错误回调函数 `(error) => void`

#### `generateImageWithGPT4oStream(request, streamRequest)`

GPT-4o 模型的流式批量生成方法，参数格式相同。

### 回调函数参数

#### `onProgress(result, index, total)`
- `result`: `StandardResponse` - 单张图片的生成结果
- `index`: `number` - 当前图片的索引（从0开始）
- `total`: `number` - 总图片数量

#### `onComplete(response)`
- `response`: `GenerationResponse` - 包含所有结果的完整响应

#### `onError(error)`
- `error`: `Error` - 错误对象

## 注意事项

1. **速率限制**：系统会自动处理API速率限制，确保请求合规
2. **错误处理**：单个图片生成失败不会影响其他图片的生成
3. **内存管理**：大量图片生成时注意内存使用
4. **网络稳定性**：确保网络连接稳定，避免中断

## 示例文件

- `src/components/features/test/StreamGenerationTest.tsx` - 完整的测试组件
- `src/examples/StreamGenerationExample.tsx` - 使用示例和自定义Hook
- `src/services/api/modelApiManager.ts` - 核心实现

## 更新日志

- **v1.0.0**: 初始版本，支持流式批量图片生成
- 支持豆包和GPT-4o模型
- 完整的进度回调和错误处理
- TypeScript类型支持

## 问题修复

### 问题描述
在聊天界面中，当一个模型选择多个 count 时，第一个图片生成完成后，后面正在加载的 results 会消失，直到下一个 result 出来。

### 根本原因
原有的流式处理逻辑在每次 `onProgress` 回调时都重新设置整个 `results` 数组，导致之前已经完成的图片结果被覆盖。

### 解决方案
1. **初始化占位符**：在开始流式处理前，创建正确数量的占位符，每个都有唯一的ID
2. **索引更新**：在 `onProgress` 中只更新对应索引位置的结果，而不是重新设置整个数组
3. **状态保持**：确保每个结果项的ID在整个过程中保持一致

### 修复代码示例

```typescript
// 修复前：每次都重新设置整个数组
const results: any[] = [];
onProgress: (result, index, total) => {
  results.push(imageResult); // 这会导致数组长度变化
  updatedImages[modelName] = results; // 覆盖整个数组
}

// 修复后：初始化占位符，按索引更新
const results: any[] = Array(count).fill(null).map((_, index) => ({
  id: `img_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
  url: null,
  text: null,
  error: null,
  errorMessage: null,
  isGenerating: true,
  createdAt: null,
}));

onProgress: (result, index, total) => {
  results[index] = { // 只更新对应索引位置
    id: results[index].id, // 保持原有ID
    url: result.imageUrl || null,
    // ... 其他属性
  };
  updatedImages[modelName] = [...results]; // 创建新数组引用
}
```

### 测试验证
提供了更新的测试组件 `StreamChatTest`，可以验证修复效果：
- 显示占位符状态
- 实时更新生成进度
- 保持所有结果项的可见性

## 聊天界面集成

### 改造说明

聊天界面 (`ChatInterface`) 已经集成了流式批量处理功能，替换了原有的批量处理逻辑。主要改动包括：

1. **实时结果更新**：每生成一张图片就立即更新UI显示
2. **进度反馈**：实时显示生成进度和状态
3. **错误隔离**：单个图片生成失败不影响其他图片
4. **状态管理**：正确管理生成状态和计数

### 核心改动

```typescript
// 原有的批量处理逻辑
const updatePromises = currentModels.map(async ({ id, count }) => {
  // 等待所有图片生成完成后再一次性返回
  const response = await modelApiManager.generateImageWithDoubao({ ... });
  return { [modelName]: response.results.map(...) };
});

// 改造后的流式处理逻辑
const updatePromises = currentModels.map(async ({ id, count }) => {
  return new Promise<{ [key: string]: any[] }>((resolve) => {
    const streamRequest = {
      count,
      onProgress: (result, index, total) => {
        // 每生成一张图片就立即更新UI
        const imageResult = { /* 处理结果 */ };
        updateMessageResults(message.id, updatedResults, true);
      },
      onComplete: (response) => {
        resolve({ [modelName]: results });
      },
      onError: (error) => {
        // 处理错误
        resolve({ [modelName]: errorResults });
      },
    };
    
    modelApiManager.generateImageWithDoubaoStream(request, streamRequest);
  });
});
```

### 用户体验改进

1. **即时反馈**：用户可以看到图片一张一张地生成出来
2. **进度可视化**：实时显示生成进度和剩余数量
3. **错误处理**：单个失败不影响整体体验
4. **响应性**：界面保持响应，不会因为批量处理而卡顿

### 测试组件

提供了专门的测试组件 `StreamChatTest` 来验证流式处理功能：

```typescript
import { StreamChatTest } from '@/components/features/test/StreamChatTest';

// 在路由中使用
<Route path="/test/stream-chat" element={<StreamChatTest />} />
```

### 性能优化

1. **并发控制**：自动处理API速率限制
2. **内存管理**：及时释放不需要的资源
3. **错误恢复**：支持部分失败的情况
4. **状态同步**：确保UI状态与实际生成状态一致
