/**
 * @file demoStore.ts
 * @description Demo store for managing records and filtering.
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Third-party Libraries
import { create } from 'zustand';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface Record {
  id: string;
  name: string;
}

export interface DemoState {
  // --- State ---
  records: Record[];
  isLoading: boolean;
  isInitialized: boolean;

  // --- State Setters ---
  setRecords: (records: Record[] | ((prev: Record[]) => Record[])) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;

  // --- Operations ---
  initialize: () => Promise<void>;
  refreshRecords: () => Promise<void>;
  filterRecords: () => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_RECORDS: Record[] = [];
const DEFAULT_IS_INITIALIZED = false;
const DEFAULT_IS_LOADING = false;

// =================================================================================================
// Store Configuration
// =================================================================================================

/**
 * Demo store for managing demo records and filtering
 * Provides demo CRUD operations, filtering, and state persistence
 */
export const useDemoStore = create<DemoState>((set, get) => ({
  // --- Initial State ---
  records: DEFAULT_RECORDS,
  isLoading: DEFAULT_IS_LOADING,
  isInitialized: DEFAULT_IS_INITIALIZED,

  // --- State Setters ---
  setRecords: (records) => {
    const newRecords = typeof records === 'function' ? records(get().records) : records;
    set({ records: newRecords });
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),

  // --- Operations ---
  /**
   * Initializes the demo store and loads the user's demo records.
   *
   * @function initialize
   * @description
   * 1. 检查 store 是否已初始化或正在加载，避免重复请求。
   * 2. 设置加载状态为 true，发起异步请求加载数据。
   * 3. 数据加载成功后，更新 records、isLoading、isInitialized 状态。
   * 4. 捕获并处理异常，保证状态一致性，输出错误日志。
   *
   * @returns {Promise<void>} 无返回值，异步执行。
   *
   * @example
   *   // 组件挂载时初始化
   *   useEffect(() => {
   *     useDemoStore.getState().initialize();
   *   }, []);
   */
  initialize: async () => {
    if (get().isInitialized || get().isLoading) return;

    try {
      set(state => ({
        ...state,
        isLoading: true,
      }));

      // TODO: use service to load records
      await new Promise(resolve => setTimeout(resolve, 1000));
      const records: Record[] = [];

      set(state => ({
        ...state,
        records,
        isLoading: false,
        isInitialized: true,
      }));
    } catch (error) {
      console.error('[DemoStore] Error initializing records:', error);
      set(state => ({
        ...state,
        records: [],
        isLoading: false,
        isInitialized: true,
      }));
    }
  },

  /**
   * Refresh records data from database
   *
   * @function refreshRecords
   * @description
   * 1. 设置加载状态为 true，发起异步请求刷新数据。
   * 2. 数据刷新成功后，更新 records、isLoading 状态。
   * 3. 捕获并处理异常，保证状态一致性，输出错误日志。
   *
   * @returns {Promise<void>} 无返回值，异步执行。
   */
  refreshRecords: async () => {
    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      const records: Record[] = [];

      set(state => ({
        ...state,
        records,
        isLoading: false
      }));
    } catch (error) {
      console.error('[DemoStore] Error refreshing records:', error);
      set(state => ({
        ...state,
        isLoading: false
      }));
    }
  },

  /**
   * Filter records based on current state
   *
   * @function filterRecords
   * @description
   * 1. 获取当前 records 状态。
   * 2. 根据当前状态过滤 records。
   * 3. 更新 records 状态。
   */
  filterRecords: () => {
    const { records } = get();
    // TODO: filter records based on current state
    set(state => ({
      ...state,
      records: records.filter(record => record.id === '1'),
    }));
  },

}));
