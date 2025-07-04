/**
 * @file chat.ts
 * @description Shared types for chat functionality
 * @author fmw666@github
 */

// =================================================================================================
// Chat Types
// =================================================================================================

export interface SelectedModel {
  id: string;
  name: string;
  category: string;
  count: number;
}

export interface DesignImage {
  url: string | null;
  alt?: string;
  referenceMessageId: string | null;
  referenceResultId: string | null;
}

export interface SelectedImage {
  id: string | null;
  url: string | null;
  messageId: string | null;
  resultId: string | null;
  isReference: boolean;
} 