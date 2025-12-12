import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSmoothStreamingOptions {
  baseDelay?: number; // Base delay in ms between characters (default: 8ms for faster feel)
  minDelay?: number; // Minimum delay when queue is large (default: 2ms)
  maxDelay?: number; // Maximum delay when queue is small (default: 15ms)
  batchSize?: number; // Number of characters to render per frame (default: 1)
}

/**
 * Custom hook for smooth, ChatGPT-like token streaming
 * Optimized for consistent character-by-character display
 * 
 * IMPROVEMENTS:
 * - Faster base delay (8ms vs 20ms)
 * - Stops rendering loop when queue is truly empty
 * - Simpler delay calculation (no complex adaptive logic)
 * - Better performance with requestAnimationFrame
 */
export function useSmoothStreaming(options: UseSmoothStreamingOptions = {}) {
  const {
    baseDelay = 8, // Faster default for snappier feel
    minDelay = 2,
    maxDelay = 15,
    batchSize = 1, // Render 1 character at a time
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const queueRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);
  const lastRenderTimeRef = useRef<number>(0);

  /**
   * Add new tokens to the queue (producer)
   * Splits tokens into individual characters for smooth rendering
   */
  const addTokens = useCallback((tokens: string) => {
    if (!tokens || tokens.length === 0) return;
    
    // Split tokens into individual characters
    const chars = tokens.split('');
    queueRef.current.push(...chars);
    
    // Start rendering loop if not already running
    if (!isRenderingRef.current) {
      isRenderingRef.current = true;
      lastRenderTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }
  }, []);

  /**
   * Calculate delay based on queue length
   * Uses simpler linear interpolation for consistent feel
   */
  const calculateDelay = useCallback((queueLength: number): number => {
    if (queueLength === 0) return baseDelay;
    
    // Simple logic: speed up slightly when queue is large
    if (queueLength > 50) {
      return minDelay; // Fast rendering for large queue
    } else if (queueLength > 20) {
      return baseDelay * 0.7; // Slightly faster
    } else if (queueLength > 10) {
      return baseDelay; // Normal speed
    } else {
      // Slow down slightly when queue is small to avoid emptying too fast
      return Math.min(maxDelay, baseDelay * 1.2);
    }
  }, [baseDelay, minDelay, maxDelay]);

  /**
   * Rendering loop (consumer)
   * Uses requestAnimationFrame for frame-synced rendering
   */
  const renderLoop = useCallback((currentTime: number) => {
    const queue = queueRef.current;
    
    // Stop loop if queue is empty
    if (queue.length === 0) {
      isRenderingRef.current = false;
      animationFrameRef.current = null;
      return; // CRITICAL: Stop here, don't schedule another frame
    }

    // Calculate delay based on current queue length
    const delay = calculateDelay(queue.length);
    const deltaTime = currentTime - lastRenderTimeRef.current;

    // Check if enough time has passed
    if (deltaTime >= delay) {
      // Render one or more characters based on batchSize
      const charsToRender: string[] = [];
      for (let i = 0; i < batchSize && queue.length > 0; i++) {
        const char = queue.shift();
        if (char !== undefined) {
          charsToRender.push(char);
        }
      }

      if (charsToRender.length > 0) {
        setDisplayedText(prev => prev + charsToRender.join(''));
        lastRenderTimeRef.current = currentTime;
      }
    }

    // Continue loop only if queue still has items
    if (queue.length > 0) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    } else {
      // Queue is now empty, stop loop
      isRenderingRef.current = false;
      animationFrameRef.current = null;
    }
  }, [calculateDelay, batchSize]);

  /**
   * Reset the streaming state
   */
  const reset = useCallback(() => {
    setDisplayedText('');
    queueRef.current = [];
    lastRenderTimeRef.current = 0;
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isRenderingRef.current = false;
  }, []);

  /**
   * Set the full text immediately (for when streaming completes)
   */
  const setFullText = useCallback((text: string) => {
    // Clear queue and set text immediately
    queueRef.current = [];
    setDisplayedText(text);
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isRenderingRef.current = false;
    lastRenderTimeRef.current = 0;
  }, []);

  /**
   * Force flush remaining queue (useful when streaming ends but queue has items)
   */
  const flush = useCallback(() => {
    if (queueRef.current.length > 0) {
      const remaining = queueRef.current.join('');
      setDisplayedText(prev => prev + remaining);
      queueRef.current = [];
    }
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isRenderingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    addTokens,
    reset,
    setFullText,
    flush,
    queueLength: queueRef.current.length,
    isRendering: isRenderingRef.current,
  };
}