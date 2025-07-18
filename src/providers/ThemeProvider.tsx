/**
 * @file ThemeProvider.tsx
 * @description ThemeProvider component, manages global theme and applies theme classes to the root element.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';

// --- Internal Libraries ---
// --- Styles ---
import { useThemeStore } from '@/styles/theme';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

// =================================================================================================
// Component
// =================================================================================================

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  // --------------------------------------------------------------------------------
  // State and Refs
  // --------------------------------------------------------------------------------
  const { theme } = useThemeStore();

  // --------------------------------------------------------------------------------
  // Side Effects
  // --------------------------------------------------------------------------------
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.classList.add('transition-colors', 'duration-200', 'ease-in-out');
  }, [theme]);

  // --------------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------------
  return <>{children}</>;
};
