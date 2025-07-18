/**
 * @file theme.ts
 * @description Theme store for managing application theme state (light/dark mode).
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Third-party Libraries ---
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =================================================================================================
// Type Definitions
// =================================================================================================

export type Theme = 'light' | 'dark';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const THEME_STORAGE_KEY = 'theme-storage';
const DEFAULT_THEME: Theme = 'light';

// =================================================================================================
// Store Configuration
// =================================================================================================

/**
 * Theme store for managing application theme state
 * Provides theme switching and persistence functionality
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      
      /**
       * Set the application theme
       * @param theme - Theme to set ('light' or 'dark')
       */
      setTheme: (theme: Theme) => set({ theme }),
      
      /**
       * Toggle between light and dark themes
       */
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: THEME_STORAGE_KEY,
    }
  )
);
