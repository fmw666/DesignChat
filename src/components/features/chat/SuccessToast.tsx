/**
 * @file SuccessToast.tsx
 * @description Success toast notification component
 * @author fmw666@github
 */

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =================================================================================================
// Types
// =================================================================================================

interface SuccessToastProps {
  show: boolean;
  onHide: () => void;
  message: string;
}

// =================================================================================================
// Component
// =================================================================================================

export const SuccessToast: FC<SuccessToastProps> = ({
  show,
  onHide,
  message,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          onAnimationComplete={() => {
            // 3秒后自动隐藏
            setTimeout(() => onHide(), 3000);
          }}
        >
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
            <motion.div
              className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            >
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <motion.span 
              className="font-medium text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {message}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 