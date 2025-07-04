/**
 * @file StorageTestComponent.tsx
 * @description Storage 功能测试组件，用于在浏览器中测试文件上传
 * @author AI Assistant
 */

import React, { useState, useRef } from 'react';
import { storageService } from '@/services/storage';

interface TestResult {
  type: 'success' | 'error' | 'info';
  message: string;
  data?: any;
  timestamp: Date;
}

export const StorageTestComponent: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addResult = (type: TestResult['type'], message: string, data?: any) => {
    setResults(prev => [...prev, {
      type,
      message,
      data,
      timestamp: new Date(),
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      addResult('info', `已选择文件: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addResult('error', '请先选择一个文件');
      return;
    }

    setIsLoading(true);
    addResult('info', '开始上传文件...');

    try {
      const result = await storageService.uploadImage(selectedFile);

      if (result.success) {
        addResult('success', '文件上传成功!', {
          url: result.url,
          metadata: result.metadata,
        });

        // 测试获取公共 URL
        if (result.url) {
          addResult('info', `公共访问 URL: ${result.url}`);
        }
      } else {
        addResult('error', `文件上传失败: ${result.error}`);
      }

    } catch (error) {
      addResult('error', `上传过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🧪 Storage 服务测试工具
        </h1>

        {/* 文件上传测试 */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-800">文件上传测试</h2>
          
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '上传中...' : '上传文件'}
            </button>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">已选择文件:</h3>
              <div className="text-sm text-gray-600">
                <p><strong>文件名:</strong> {selectedFile.name}</p>
                <p><strong>文件大小:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                <p><strong>文件类型:</strong> {selectedFile.type}</p>
              </div>
            </div>
          )}
        </div>

        {/* 功能测试按钮 */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-800">功能测试</h2>
          
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ⚙️ 配置测试
            </button>
            
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              ⚠️ 错误处理测试
            </button>
            
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🧪 完整测试
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑️ 清除结果
            </button>
          </div>
        </div>

        {/* 测试结果 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">测试结果</h2>
          
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无测试结果，请运行测试...
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : result.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{result.message}</p>
                      {result.data && (
                        <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageTestComponent; 