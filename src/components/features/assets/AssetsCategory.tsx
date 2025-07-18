/**
 * @file AssetsCategory.tsx
 * @description Asset category and tag filter panel for asset management UI.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Third-party Libraries ---
import { FolderIcon, PhotoIcon, SparklesIcon, StarIcon, MagnifyingGlassIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Libraries ---
// --- Hooks ---
import { useAssets } from '@/hooks/assets';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface Category {
  id: string;
  name: string;
  icon: typeof FolderIcon;
  count: number;
}

// =================================================================================================
// Constants
// =================================================================================================

const PARAM_TYPE = 'type';

const CATEGORY_MAP: Record<string, string> = {
  text2img: 'text2img',
  img2img: 'img2img',
  favorites: 'favorites',
};

// =================================================================================================
// Component
// =================================================================================================

const AssetsCategory: FC = () => {
  // --- State and Refs ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Hooks ---
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    assets,
    selectedCategory,
    selectedTags,
    isFlatMode,
    isDetailMode,
    isLoading,
    setSelectedCategory,
    setSelectedTags,
    setIsFlatMode,
    setIsDetailMode,
    generateTagsFromAssets,
    calculateCategoryCounts,
    filterAssets,
  } = useAssets();

  // --- Logic and Event Handlers ---
  // 从 URL 参数初始化选中状态
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get(PARAM_TYPE);
    if (categoryParam === null) {
      setSelectedCategory('all');
    } else {
      const found = Object.entries(CATEGORY_MAP).find(([, v]) => v === categoryParam);
      setSelectedCategory(found ? found[0] : 'all');
    }
  }, [location.search, setSelectedCategory]);

  useEffect(() => {
    filterAssets();
  }, [selectedCategory, selectedTags, filterAssets]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    const newPath = '/assets';
    const searchParams = new URLSearchParams(location.search);
    if (CATEGORY_MAP[categoryId]) {
      searchParams.set(PARAM_TYPE, CATEGORY_MAP[categoryId]);
    } else {
      searchParams.delete(PARAM_TYPE);
    }
    const newSearch = searchParams.toString();
    const newUrl = newSearch ? `${newPath}?${newSearch}` : newPath;
    navigate(newUrl, { replace: true });
  }, [location.search, navigate, setSelectedCategory]);

  const handleTagClick = useCallback((tagId: string) => {
    setSelectedTags((prev: string[]) => {
      const newTags = prev.includes(tagId) 
        ? prev.filter((id: string) => id !== tagId) 
        : [...prev, tagId];
      
      return newTags;
    });
  }, [setSelectedTags]);

  // 计算动态数据
  const dynamicCategories = useMemo(() => {
    const counts = calculateCategoryCounts(assets);
    const categories: Category[] = [
      { id: 'all', name: t('assets.category.all'), icon: FolderIcon, count: counts.all || 0 },
      { id: 'text2img', name: t('assets.category.text2img'), icon: SparklesIcon, count: counts.text2img || 0 },
      { id: 'img2img', name: t('assets.category.img2img'), icon: PhotoIcon, count: counts.img2img || 0 },
      { id: 'favorites', name: t('assets.category.favorites'), icon: StarIcon, count: counts.favorites || 0 },
    ];
    return categories;
  }, [assets, calculateCategoryCounts, t]);

  const dynamicTags = useMemo(() => {
    return generateTagsFromAssets(assets);
  }, [assets, generateTagsFromAssets]);

  const filteredTags = useMemo(() => 
    dynamicTags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())), 
    [dynamicTags, searchQuery]
  );

  // --- Render Logic ---
  return (
    <div className="flex flex-col h-full">
      <div className="h-[calc(100%-80px)] overflow-y-auto pl-1 pr-0">
        {/* Title Section */}
        <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            {/* Background Effects */}
            <div className="absolute inset-0 shadow-md bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 dark:shadow-indigo-500/30 rounded-2xl" />
            <div className="relative px-4 py-3 cursor-pointer">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <PhotoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('assets.title')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('assets.description')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Categories */}
        <div className="p-3">
          <div className="space-y-1">
            {dynamicCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ease-out group ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
                whileTap={{ 
                  scale: 0.99,
                  transition: { duration: 0.1 }
                }}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20'
                  }`}>
                    <category.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
        {/* Display Controls */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {/* Compact Section Header */}
          <div className="px-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-3 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{t('assets.display.settings')}</h3>
            </div>
          </div>

          {/* Compact Controls */}
          <div className="space-y-2 px-3">
            {/* Display Mode */}
            <div className="group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('assets.display.mode')}</span>
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 shadow-inner">
                  <motion.div
                    className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] bg-white dark:bg-gray-700 rounded-md shadow-sm transition-all duration-300 ease-out ${
                      isFlatMode ? 'left-[calc(50%-0.5px)]' : 'left-0.5'
                    }`}
                    layout
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                  <div className="relative flex">
                    <motion.button
                      onClick={() => setIsFlatMode(false)}
                      className={`flex items-center justify-center py-1 px-2 text-xs font-medium rounded-md transition-all duration-300 ease-out relative z-10 ${
                        !isFlatMode 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <ViewColumnsIcon className="w-3 h-3 mr-1" />
                      {t('assets.display.card')}
                    </motion.button>
                    <motion.button
                      onClick={() => setIsFlatMode(true)}
                      className={`flex items-center justify-center py-1 px-2 text-xs font-medium rounded-md transition-all duration-300 ease-out relative z-10 ${
                        isFlatMode 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <Squares2X2Icon className="w-3 h-3 mr-1" />
                      {t('assets.display.image')}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Mode */}
            <div className="group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('assets.display.detailMode')}</span>
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 shadow-inner">
                  <motion.div
                    className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] bg-white dark:bg-gray-700 rounded-md shadow-sm transition-all duration-300 ease-out ${
                      isDetailMode ? 'left-[calc(50%-0.5px)]' : 'left-0.5'
                    }`}
                    layout
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                  <div className="relative flex">
                    <motion.button
                      onClick={() => setIsDetailMode(false)}
                      className={`flex items-center justify-center py-1 px-2 text-xs font-medium rounded-md transition-all duration-300 ease-out relative z-10 ${
                        !isDetailMode 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      {t('assets.display.simple')}
                    </motion.button>
                    <motion.button
                      onClick={() => setIsDetailMode(true)}
                      className={`flex items-center justify-center py-1 px-2 text-xs font-medium rounded-md transition-all duration-300 ease-out relative z-10 ${
                        isDetailMode 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t('assets.display.detail')}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tags */}
        <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('assets.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
          <motion.div 
            className="flex flex-wrap gap-2 px-2"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredTags.map((tag) => (
                <motion.button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 ease-out ${
                    selectedTags.includes(tag.id)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                  }}
                  whileTap={{ 
                    scale: 0.97,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  layout
                >
                  {tag.name}
                  <span className={`ml-1 text-xs ${
                    selectedTags.includes(tag.id)
                      ? 'text-white/80'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    ({tag.count})
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredTags.length === 0 && (
            <motion.div 
              className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? t('assets.loading') : t('assets.notFound')}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default AssetsCategory;
