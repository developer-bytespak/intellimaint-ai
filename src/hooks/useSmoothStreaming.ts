import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSmoothStreamingOptions {
  baseDelay?: number; // Base delay in ms between characters (default: 20ms)
  minDelay?: number; // Minimum delay when queue is large (default: 5ms)
  maxDelay?: number; // Maximum delay when queue is small (default: 50ms)
  queueThreshold?: number; // Queue length threshold for speed adjustment (default: 50)
  aggressivenessFactor?: number; // How aggressively to speed up (default: 0.1)
}

/**
 * Custom hook for smooth, ChatGPT-like token streaming
 * Implements a producer-consumer queue pattern with adaptive pacing
 */
export function useSmoothStreaming(options: UseSmoothStreamingOptions = {}) {
  const {
    baseDelay = 20,
    minDelay = 5,
    maxDelay = 50,
    queueThreshold = 50,
    aggressivenessFactor = 0.1,
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const queueRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);

  /**
   * Add new tokens to the queue (producer)
   * Splits tokens into individual characters for maximum smoothness
   */
  const addTokens = useCallback((tokens: string) => {
    if (!tokens) return;
    
    // Split tokens into individual characters for character-by-character rendering
    const chars = tokens.split('');
    queueRef.current.push(...chars);
    
    // Start rendering loop if not already running
    if (!isRenderingRef.current) {
      startRenderingLoop();
    }
  }, []);

  /**
   * Calculate adaptive delay based on queue length
   * Formula: delay = baseDelay / (1 + queueLength * aggressivenessFactor)
   * Clamped between minDelay and maxDelay
   */
  const calculateDelay = useCallback((queueLength: number): number => {
    if (queueLength > queueThreshold) {
      // Large queue: speed up (lower delay)
      const calculatedDelay = baseDelay / (1 + queueLength * aggressivenessFactor);
      return Math.max(minDelay, calculatedDelay);
    } else {
      // Small queue: slow down slightly (higher delay) to avoid running out
      const calculatedDelay = baseDelay * (1 + (queueThreshold - queueLength) * 0.05);
      return Math.min(maxDelay, calculatedDelay);
    }
  }, [baseDelay, minDelay, maxDelay, queueThreshold, aggressivenessFactor]);

  /**
   * Rendering loop (consumer)
   * Uses requestAnimationFrame for smooth, frame-synced rendering
   */
  const renderLoop = useCallback((currentTime: DOMHighResTimeStamp) => {
    const queue = queueRef.current;
    
    if (queue.length === 0) {
      // Queue is empty, check again soon
      isRenderingRef.current = false;
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // Calculate adaptive delay based on current queue length
    const delay = calculateDelay(queue.length);
    
    // Check if enough time has passed since last update
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - lastUpdateTimeRef.current;

    if (deltaTime >= delay) {
      // Take one character from queue and add to displayed text
      const char = queue.shift();
      if (char !== undefined) {
        setDisplayedText(prev => prev + char);
        lastUpdateTimeRef.current = currentTime;
      }
    }

    // Continue rendering loop
    isRenderingRef.current = true;
    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [calculateDelay]);

  /**
   * Start the rendering loop
   */
  const startRenderingLoop = useCallback(() => {
    if (!isRenderingRef.current && animationFrameRef.current === null) {
      isRenderingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop]);

  /**
   * Reset the streaming state
   */
  const reset = useCallback(() => {
    setDisplayedText('');
    queueRef.current = [];
    lastUpdateTimeRef.current = 0;
    
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
    lastUpdateTimeRef.current = 0;
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
    queueLength: queueRef.current.length,
  };
}

