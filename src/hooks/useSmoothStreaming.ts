import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSmoothStreamingOptions {
  instant?: boolean; // If true, render character-by-character immediately
  charDelay?: number; // Delay between characters in ms (default: 0 for instant)
  batchSize?: number; // Characters to render per frame (default: 5 for smooth flow)
}

/**
 * Smooth streaming hook with instant character-by-character rendering
 * - Uses requestAnimationFrame for smooth 60fps rendering
 * - No artificial delays - processes queue as fast as possible
 * - Renders multiple characters per frame for smooth visual flow
 * - Much smoother than setTimeout/throttling approaches
 */
export function useSmoothStreaming(options: UseSmoothStreamingOptions = {}) {
  const { 
    instant = true, 
    charDelay = 0, // 0ms = instant rendering
    batchSize = 5   // Render 5 chars per frame for smooth flow (increase if too slow)
  } = options;

  const [displayedText, setDisplayedText] = useState('');

  // Queue of characters waiting to be rendered
  const queueRef = useRef<string[]>([]);
  
  // RAF (requestAnimationFrame) handle
  const rafRef = useRef<number | null>(null);
  
  // Track if rendering loop is active
  const isRenderingRef = useRef(false);
  
  // Last render time (for delay calculation)
  const lastRenderRef = useRef<number>(0);

  /**
   * Rendering loop using requestAnimationFrame
   * Processes queue at 60fps for smooth character-by-character display
   */
  const renderLoop = useCallback((timestamp: number) => {
    const queue = queueRef.current;
    
    // Stop if queue is empty
    if (queue.length === 0) {
      isRenderingRef.current = false;
      rafRef.current = null;
      return;
    }

    // Check if enough time has passed (for optional delay)
    const timeSinceLastRender = timestamp - lastRenderRef.current;
    if (charDelay > 0 && timeSinceLastRender < charDelay) {
      // Not enough time passed, schedule next frame
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // Render a batch of characters for smooth flow
    const charsToRender: string[] = [];
    const charsThisFrame = Math.min(batchSize, queue.length);
    
    for (let i = 0; i < charsThisFrame; i++) {
      const char = queue.shift();
      if (char !== undefined) {
        charsToRender.push(char);
      }
    }

    if (charsToRender.length > 0) {
      setDisplayedText(prev => prev + charsToRender.join(''));
      lastRenderRef.current = timestamp;
    }

    // Continue loop if queue still has items
    if (queue.length > 0) {
      rafRef.current = requestAnimationFrame(renderLoop);
    } else {
      isRenderingRef.current = false;
      rafRef.current = null;
    }
  }, [charDelay, batchSize]);

  /**
   * Start the rendering loop if not already running
   */
  const startRenderLoop = useCallback(() => {
    if (isRenderingRef.current) return;
    
    isRenderingRef.current = true;
    lastRenderRef.current = performance.now();
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  /**
   * Stop the rendering loop
   */
  const stopRenderLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isRenderingRef.current = false;
  }, []);

  /**
   * Add tokens to the queue
   * In instant mode with batchSize, this creates smooth character-by-character flow
   */
  const addTokens = useCallback((tokens: string) => {
    if (!tokens || tokens.length === 0) return;

    if (!instant) {
      // Non-instant mode: display immediately (legacy behavior)
      setDisplayedText(prev => prev + tokens);
      return;
    }

    // Instant mode: queue characters and render smoothly
    // Split into individual characters for character-by-character display
    const chars = tokens.split('');
    queueRef.current.push(...chars);
    
    // Start rendering loop if not already running
    startRenderLoop();
  }, [instant, startRenderLoop]);

  /**
   * Reset everything
   */
  const reset = useCallback(() => {
    stopRenderLoop();
    queueRef.current = [];
    setDisplayedText('');
    lastRenderRef.current = 0;
  }, [stopRenderLoop]);

  /**
   * Set full text immediately (bypass queue)
   */
  const setFullText = useCallback((text: string) => {
    stopRenderLoop();
    queueRef.current = [];
    setDisplayedText(text);
    lastRenderRef.current = 0;
  }, [stopRenderLoop]);

  /**
   * Force flush entire queue immediately
   */
  const flush = useCallback(() => {
    if (queueRef.current.length > 0) {
      const remaining = queueRef.current.join('');
      setDisplayedText(prev => prev + remaining);
      queueRef.current = [];
    }
    stopRenderLoop();
  }, [stopRenderLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRenderLoop();
    };
  }, [stopRenderLoop]);

  return {
    displayedText,
    addTokens,
    reset,
    setFullText,
    flush,
    // Debug helpers
    queueLength: queueRef.current.length,
    isRendering: isRenderingRef.current,
  };
}