/**
 * @file clipboard.ts
 * @description Utility functions for clipboard operations
 * @author fmw666@github
 */

// --- Type Definitions ---
export interface CopyToClipboardResult {
  success: boolean;
  error?: string;
}

// --- Constants ---
const FALLBACK_TEXTAREA_STYLES = {
  position: 'fixed',
  left: '-999999px',
  top: '-999999px'
} as const;

// --- Utility Functions ---
/**
 * Copies text to clipboard using modern API with fallback to traditional method
 * @param text - The text to copy to clipboard
 * @returns Promise<CopyToClipboardResult> - Result indicating success or failure
 */
export const copyToClipboard = async (text: string): Promise<CopyToClipboardResult> => {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    }
    
    // Fallback to traditional method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Apply fallback styles
    Object.assign(textArea.style, FALLBACK_TEXTAREA_STYLES);
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      return { success: true };
    } catch (err) {
      textArea.remove();
      console.error('Fallback: Oops, unable to copy', err);
      throw new Error('复制失败');
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};
