/**
 * @file ArchivedChatInterface.tsx
 * @description Archived chat interface component with unarchive functionality
 * @author fmw666@github
 */

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// =================================================================================================
// Types
// =================================================================================================

interface ArchivedChatInterfaceProps {
  isUnarchiving: boolean;
  onUnarchiveChat: () => void;
}

// =================================================================================================
// Component
// =================================================================================================

export const ArchivedChatInterface: FC<ArchivedChatInterfaceProps> = ({
  isUnarchiving,
  onUnarchiveChat,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div 
        className="text-center mb-3"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.p 
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {t('chat.archived.description')}
        </motion.p>
      </motion.div>
      <motion.button
        onClick={onUnarchiveChat}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-all duration-200 ease-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 flex items-center gap-2"
        whileHover={{ 
          scale: isUnarchiving ? 1 : 1.02,
          boxShadow: isUnarchiving ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: isUnarchiving ? 1 : 0.98 }}
        disabled={isUnarchiving}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {isUnarchiving ? (
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>{t('chat.archived.unarchiving')}</span>
          </motion.div>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="" className="-ms-0.5 icon">
              <path d="M2.66867 14.1665V8.98677C2.23313 8.72481 1.8817 8.32262 1.69113 7.82075L1.61691 7.59419L1.45578 6.99067C1.12249 5.74681 1.86036 4.46753 3.10422 4.13423L13.9714 1.2231L14.2048 1.17329C15.3713 0.984508 16.5144 1.70556 16.8269 2.87153L16.988 3.47505L17.0388 3.70845C17.2153 4.79724 16.5981 5.86547 15.5671 6.25728L15.3396 6.33149L4.47336 9.24263C4.31482 9.28511 4.15541 9.30996 3.99777 9.3188V14.1665C3.99777 15.1799 4.82027 16.0014 5.83371 16.0014H14.1667C15.1801 16.0013 16.0017 15.1799 16.0017 14.1665V8.33345C16.0017 7.96618 16.2994 7.66841 16.6667 7.66841C17.0339 7.66848 17.3318 7.96622 17.3318 8.33345V14.1665C17.3318 15.9144 15.9146 17.3314 14.1667 17.3315H5.83371C4.08573 17.3315 2.66867 15.9144 2.66867 14.1665ZM11.6667 10.1684L11.8005 10.1821C12.1036 10.2441 12.3318 10.5121 12.3318 10.8334C12.3317 11.1548 12.1035 11.4228 11.8005 11.4848L11.6667 11.4985H8.33371C7.96648 11.4985 7.66873 11.2007 7.66867 10.8334C7.66867 10.4662 7.96644 10.1684 8.33371 10.1684H11.6667ZM15.5417 3.21626C15.4075 2.71539 14.9168 2.40477 14.4157 2.48579L14.3152 2.50727L3.44895 5.41938C2.91466 5.56254 2.59693 6.11166 2.73996 6.64595L2.90207 7.24946L2.93332 7.34712C3.11346 7.82184 3.62765 8.09253 4.12863 7.95845L14.9958 5.04634L15.0935 5.01509C15.5364 4.84669 15.8013 4.3872 15.7253 3.91938L15.7038 3.81977L15.5417 3.21626Z"></path>
            </svg>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.1 }
              }}
            >
              {t('chat.archived.unarchive')}
            </motion.span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}; 