/**
 * @file ImageViewer.tsx
 * @description ImageViewer component, provides a full-screen image viewer with zoom and pan functionality.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, useState, useRef, useCallback, useEffect, useSyncExternalStore, useId } from 'react';
import { createPortal } from 'react-dom';

// 2. Third-party Libraries
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// 3. Internal Utils
import { modalStackStore } from '@/components/shared/common/Modal/modalStack';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ImageViewerProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

// =================================================================================================
// Constants
// =================================================================================================

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;

// =================================================================================================
// Component
// =================================================================================================

export const ImageViewer: FC<ImageViewerProps> = ({ src, alt = '', onClose }) => {
  // --- State and Refs ---
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragging = useRef(false);
  const lastPos = useRef<Position>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // --- Hooks ---
  const id = useId();
  const numericId = useRef(parseInt(id.replace(/:/g, ''), 36)); 
  const stack = useSyncExternalStore(modalStackStore.subscribe, modalStackStore.getSnapshot);
  const zIndex = 1000 + stack.indexOf(numericId.current) * 1 + 1;
  const isTopModal = stack.length > 0 && stack[stack.length - 1] === numericId.current;

  // --- Logic and Event Handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    lastPos.current = { 
      x: e.clientX - offset.x, 
      y: e.clientY - offset.y 
    };
  }, [offset]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    
    const newOffset = {
      x: e.clientX - lastPos.current.x,
      y: e.clientY - lastPos.current.y,
    };
    
    setOffset(newOffset);
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isTopModal) {
      onClose();
    }
  }, [onClose, isTopModal]);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // --- Side Effects ---
  useEffect(() => {
    const currentId = numericId.current;
    modalStackStore.push(currentId);
    return () => {
      modalStackStore.pop(currentId);
    };
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragging.current) handleMouseMove(e);
    };

    const handleGlobalMouseUp = () => {
      if (dragging.current) handleMouseUp();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleWheelEvent = (e: WheelEvent) => {
      handleWheel(e);
    };

    imageElement.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      imageElement.removeEventListener('wheel', handleWheelEvent);
    };
  }, [handleWheel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Reset view when image changes
  useEffect(() => {
    resetView();
  }, [src, resetView]);

  // --- Render Logic ---
  const viewer = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/90"
      style={{ pointerEvents: 'auto', zIndex }}
    >
      {/* Content container */}
      <div className="relative flex max-h-full max-w-full flex-col items-center justify-center">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="fixed right-4 top-4 z-10 rounded-full bg-white/80 p-2 hover:bg-white"
          aria-label="Close image viewer"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>

        {/* Image area */}
        <motion.img
          ref={imageRef}
          src={src}
          alt={alt}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            maxWidth: '90vw',
            maxHeight: '80vh',
            userSelect: 'none',
          }}
          className="select-none rounded-xl shadow-2xl"
          onMouseDown={handleMouseDown}
          draggable={false}
          onError={(e) => {
            console.error('Failed to load image:', src);
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Scale percentage indicator */}
        <div className="fixed bottom-4 right-4 z-10 rounded bg-white/80 px-3 py-1 text-sm text-gray-700 shadow">
          {Math.round(scale * 100)}%
        </div>

        {/* Reset button */}
        <button
          onClick={resetView}
          className="fixed bottom-4 left-4 z-10 rounded bg-white/80 px-3 py-1 text-sm text-gray-700 shadow hover:bg-white"
          aria-label="Reset zoom and position"
        >
          Reset
        </button>
      </div>
    </motion.div>
  );

  return createPortal(viewer, document.body);
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ImageViewer;
