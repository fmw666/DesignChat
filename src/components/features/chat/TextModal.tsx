/**
 * @file TextModal.tsx
 * @description 现代化的文本描述 Modal，支持 markdown 渲染、滚动、响应式、深色模式。
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { FC } from 'react';
import { Modal } from '@/components/shared/common/Modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  text: string;
}

// =================================================================================================
// Component
// =================================================================================================

export const TextModal: FC<TextModalProps> = ({ isOpen, onClose, title = 'Text', text }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="3xl"
      showCloseButton={true}
    >
      <div className='max-h-96 overflow-y-auto'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
            em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
            code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">{children}</code>,
            pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm font-mono overflow-x-auto mb-4">{children}</pre>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
            li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
            h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{children}</h3>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4">{children}</blockquote>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200 transition-colors">{children}</a>,
            hr: () => <hr className="my-6 border-blue-200 dark:border-blue-700" />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </Modal>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default TextModal;
