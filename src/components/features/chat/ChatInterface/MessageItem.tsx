'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import MarkdownRenderer from './MarkdownRenderer';
import { useSmoothStreaming } from '@/hooks/useSmoothStreaming';

interface MessageItemProps {
  message: Message;
  isLastMessage: boolean;
  isSending: boolean;
  copiedMessageId: string | null;
  loadingMessageId: string | null;
  currentPlayingId: string | null;
  onCopyText: (text: string, messageId: string) => void;
  onTextToSpeech: (text: string, messageId: string) => void;
  onStopAudio: () => void;
  formatTime: (date: Date) => string;
  streamingText?: string | null;
  streamingMessageId?: string | null;
  onEditMessage?: (messageId: string) => void;
  onInlineEditSave?: (messageId: string, newContent: string) => void;
  streamedContentRef?: React.MutableRefObject<Map<string, boolean>>; // Check if content was streamed (temp->real ID change)
}

export default function MessageItem({
  message,
  isLastMessage,
  isSending,
  copiedMessageId,
  loadingMessageId,
  currentPlayingId,
  onCopyText,
  onTextToSpeech,
  onStopAudio,
  formatTime,
  streamingText,
  streamingMessageId,
  onEditMessage,
  onInlineEditSave,
  streamedContentRef,
}: MessageItemProps) {
  // Use smooth streaming hook for assistant messages that are currently streaming
  const isCurrentlyStreaming = streamingText !== null && streamingText !== undefined;
  
  // Show loader when waiting for first token (assistant message, isSending, but no streaming text yet)
  const isWaitingForFirstToken = 
    message.role === 'assistant' && 
    isLastMessage && 
    isSending && 
    !isCurrentlyStreaming && 
    (!message.content || message.content.length === 0) &&
    streamingMessageId !== message.id;
  
  const { displayedText, addTokens, reset, setFullText } = useSmoothStreaming({
    instant: true, // 🔥 INSTANT MODE: character-by-character rendering
    batchSize: 5,   // 5 chars per frame (smooth default)
    charDelay: 0,   // no artificial delay between frames
  });
  
  // Track what we've already queued (not just what's displayed)
  // This prevents re-adding tokens when queue empties
  const queuedTextRef = useRef<string>('');
  
  // Track what portion of message.content has been queued (for non-streaming messages)
  const queuedMessageContentRef = useRef<string>('');
  
  // CRITICAL: Track the last content.length we processed to prevent re-processing same content
  const lastProcessedContentLengthRef = useRef<number>(0);
  
  // Track if we're in completion mode (streaming finished, continuing character-by-character)
  const isCompletionModeRef = useRef(false);
  
  // Lock to prevent any new addTokens calls once animation is complete for this message
  const isAnimationLockedRef = useRef(false);
  
  // CRITICAL FIX: Track if we've already set the full content to prevent double animation in production
  // This is separate from isAnimationLockedRef and provides additional safety
  const contentFullySyncedRef = useRef(false);
  
  // Create a stable hash of the message content to identify it across ID changes (temp->real)
  // This allows us to preserve animation state when message.id changes but content is the same
  const messageContentHash = message.content ? 
    `len:${message.content.length}:first${message.content.slice(0, 20).replace(/\s/g, '')}` : '';
  
  // Ref to track which content hash we've animated to prevent re-animation on ID changes
  const animatedContentHashRef = useRef<string>('');

  // Helper function to detect duplicate content
  const hasDuplicateContent = (text: string): boolean => {
    if (!text || text.length < 20) return false;
    
    // Check if a significant portion of the beginning repeats
    for (let prefixLen = Math.min(50, Math.floor(text.length * 0.4)); prefixLen >= 15; prefixLen -= 5) {
      const prefix = text.substring(0, prefixLen).trim();
      if (prefix.length < 15) continue;
      
      const searchStart = Math.max(prefixLen, Math.floor(text.length * 0.3));
      if (text.indexOf(prefix, searchStart) !== -1) {
        return true;
      }
    }
    return false;
  };

  // Handle streaming text updates
  useEffect(() => {
    // Log for debugging production issues
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║ [ANIMATION EFFECT] FIRED
║ Message ID: ${message.id?.slice(0, 12)}
║ Streaming: ${isCurrentlyStreaming} | Locked: ${isAnimationLockedRef.current} | Synced: ${contentFullySyncedRef.current}
║ Content: "${message.content?.slice(0, 40)}..." (${message.content?.length || 0} chars)
║ StreamingText: "${streamingText?.slice(0, 40) || 'null'}..." (${streamingText?.length || 0} chars)
║ Displayed: "${displayedText.slice(0, 40)}..." (${displayedText.length} chars)
║ Queued: ${queuedTextRef.current.length} chars | Completion: ${isCompletionModeRef.current}
╚════════════════════════════════════════════════════════════════╝
    `);
    
    // CRITICAL: If we have message.content and it matches streamingText (streaming completed), treat as fully synced
    if (message.content && streamingText && message.content === streamingText && message.content.length > 0) {
      console.log(`[Animation Effect] 🟢 DETECTED: message.content matches streamingText - streaming complete`);
      contentFullySyncedRef.current = true;
      isAnimationLockedRef.current = true;
      lastProcessedContentLengthRef.current = message.content.length;
      queuedMessageContentRef.current = message.content;
      // Don't return yet - let the other guards catch it
    }
    
    // CRITICAL FIX: Check if this content was streamed (by checking streamedContentRef Map)
    // This prevents re-animation when temp->real ID change creates new component instance
    if (!isCurrentlyStreaming && message.content && streamedContentRef) {
      const contentHash = `len:${message.content.length}:first${message.content.slice(0, 20).replace(/\s/g, '')}`;
      if (streamedContentRef.current.has(contentHash)) {
        console.log(`[Animation Effect] ✅ SKIPPING: Content was just streamed (temp->real ID change detected)`);
        isAnimationLockedRef.current = true;
        animatedContentHashRef.current = messageContentHash;
        queuedMessageContentRef.current = message.content;
        return;
      }
    }
    
    // CRITICAL: Check if this content was already animated (by hash) - prevents re-animation on ID changes
    if (messageContentHash && animatedContentHashRef.current === messageContentHash && !isCurrentlyStreaming) {
      console.log(`[Animation Effect] ✅ SKIPPING: Content hash already animated (ID changed but content same)`);
      isAnimationLockedRef.current = true;
      return;
    }
    
    // CRITICAL GUARD: If animation is locked for this message AND we're not streaming new content, skip entirely
    // This prevents re-animation in production when race conditions occur
    if (isAnimationLockedRef.current && !isCurrentlyStreaming) {
      console.log(`[Animation Effect] LOCKED - skipping effect`);
      return;
    }
    
    if (isCurrentlyStreaming && streamingText !== null) {
      // Unlock animation when streaming starts (new content incoming)
      console.log(`[Animation Effect] STREAMING - received ${streamingText.length} chars, queued=${queuedTextRef.current.length}`);
      isAnimationLockedRef.current = false; // Unlock for new streaming
      contentFullySyncedRef.current = false; // Reset sync flag when new streaming starts
      
      // Use the full streaming text as the source of truth
      const currentFullText = streamingText;
      const alreadyQueuedText = queuedTextRef.current;
      
      // Only add tokens that haven't been queued yet
      // Compare against what we've queued, not what's been displayed
      if (currentFullText.length > alreadyQueuedText.length) {
        // Verify the new text extends what we've already queued
        if (currentFullText.startsWith(alreadyQueuedText) || alreadyQueuedText.length === 0) {
          // Calculate only the new tokens that haven't been queued
          const newTokens = currentFullText.slice(alreadyQueuedText.length);
          
          if (newTokens.length > 0) {
            // Add only the new tokens to the queue
            addTokens(newTokens);
            // Update our tracking of what we've queued
            queuedTextRef.current = currentFullText;
            
            // Mark that streaming has started
            if (!hasStartedStreamingRef.current) {
              hasStartedStreamingRef.current = true;
            }
          }
        } else {
          // Text doesn't extend what we've queued - might be a reset
          // Only reset if it's genuinely different content
          if (!alreadyQueuedText.includes(currentFullText) || currentFullText.length === 0) {
            // Reset and start fresh
            reset();
            queuedTextRef.current = '';
            if (currentFullText.length > 0) {
              addTokens(currentFullText);
              queuedTextRef.current = currentFullText;
            }
            hasStartedStreamingRef.current = true;
          }
          // If it's a duplicate (already queued contains new), ignore it
        }
      } else if (currentFullText.length < alreadyQueuedText.length && currentFullText.length > 0) {
        // Text was reset but there's still content - only reset if we haven't started streaming yet
        // This prevents resetting when transitioning from waiting to streaming
        if (!hasStartedStreamingRef.current) {
          reset();
          queuedTextRef.current = '';
          addTokens(currentFullText);
          queuedTextRef.current = currentFullText;
          hasStartedStreamingRef.current = true;
        }
      } else if (currentFullText.length === 0 && alreadyQueuedText.length > 0) {
        // Complete reset - only do this if we're sure it's a new message
        reset();
        queuedTextRef.current = '';
        hasStartedStreamingRef.current = false;
      }
      // If lengths are equal, don't update (prevents showing duplicate content)
    } else if (!isCurrentlyStreaming && !isWaitingForFirstToken && message.content) {
      // Not streaming anymore and not waiting - sync refs and check if content is complete
      console.log(`
[Animation Effect] COMPLETION BLOCK
- contentFullySyncedRef: ${contentFullySyncedRef.current}
- streaming ended, queuedText=${queuedTextRef.current.length}, content=${message.content.length}, displayed=${displayedText.length}
- lastProcessedLength: ${lastProcessedContentLengthRef.current}
      `);
      
      // CRITICAL FIX: If content length hasn't changed and we already processed it, skip
      if (message.content.length === lastProcessedContentLengthRef.current && lastProcessedContentLengthRef.current > 0) {
        console.log(`[Animation Effect] ✅ SKIP: Same content length (${message.content.length}c) already processed`);
        return;
      }
      
      // CRITICAL FIX: If we've already fully synced content, prevent any further animation
      if (contentFullySyncedRef.current) {
        console.log(`[Animation Effect] ✅ HARD SKIP: Content already marked as fully synced - preventing re-animation`);
        return;
      }
      
      // CRITICAL FIX #1: On first entry to completion mode after streaming, lock immediately
      // This prevents the effect from re-running and trying to add content again
      if (!isCompletionModeRef.current && queuedTextRef.current.length > 0) {
        // We just transitioned from streaming to completion
        // Mark that we've queued this content to prevent re-processing
        console.log(`[Animation Effect] ✅ LOCK: Just exited streaming with queued content. Preventing re-animation.`);
        queuedMessageContentRef.current = message.content;
        lastProcessedContentLengthRef.current = message.content.length; // Track length
        isCompletionModeRef.current = false;
        isAnimationLockedRef.current = true;
        contentFullySyncedRef.current = true; // Mark as fully synced
        return; // EXIT immediately
      }
      
      // CRITICAL FIX #2: Always sync queuedTextRef to queuedMessageContentRef to track what was streamed
      // This prevents re-animation in production when network latency causes race conditions
      if (queuedTextRef.current) {
        queuedMessageContentRef.current = queuedTextRef.current;
      }
      
      const currentDisplayed = displayedText;
      const alreadyQueuedContent = queuedMessageContentRef.current || queuedTextRef.current;
      
      // CRITICAL: If we've already queued/displayed the complete message content during streaming, SKIP
      // This prevents re-adding the same content and causing duplication/replay
      // Check: alreadyQueuedContent matches the entire message.content (or is longer)
      if (alreadyQueuedContent && message.content && 
          alreadyQueuedContent === message.content) {
        // Exact match - content was fully streamed and queued - lock animation
        console.log(`[Animation Effect] ✅ LOCK: Content matches exactly (${alreadyQueuedContent.length} chars)`);
        lastProcessedContentLengthRef.current = message.content.length; // Track length
        animatedContentHashRef.current = messageContentHash; // Store hash to prevent re-animation on ID change
        isAnimationLockedRef.current = true;
        isCompletionModeRef.current = false;
        contentFullySyncedRef.current = true; // Mark as fully synced
        return; // EXIT: Don't process further
      } else if (alreadyQueuedContent && alreadyQueuedContent.length >= message.content.length) {
        // Already queued content is same length or longer - fully processed - lock animation
        console.log(`[Animation Effect] ✅ LOCK: Queued content >= message content (${alreadyQueuedContent.length} vs ${message.content.length})`);
        lastProcessedContentLengthRef.current = message.content.length; // Track length
        animatedContentHashRef.current = messageContentHash; // Store hash to prevent re-animation on ID change
        isAnimationLockedRef.current = true;
        isCompletionModeRef.current = false;
        contentFullySyncedRef.current = true; // Mark as fully synced
        return; // EXIT: Don't process further
      } else if (alreadyQueuedContent && message.content.startsWith(alreadyQueuedContent)) {
        // Content extends what was already queued during streaming
        // Only add the remaining part if there's more content from the server
        if (!isCompletionModeRef.current) {
          isCompletionModeRef.current = true;
        }
        
        const remainingText = message.content.slice(alreadyQueuedContent.length);
        if (remainingText.length > 0 && currentDisplayed.length >= alreadyQueuedContent.length) {
          // Only add remaining if we've already displayed what was streamed
          addTokens(remainingText);
          queuedMessageContentRef.current = message.content;
        } else if (remainingText.length === 0) {
          // No remaining content - already fully queued
          isCompletionModeRef.current = false;
        }
      } else if (!alreadyQueuedContent && currentDisplayed.length < message.content.length) {
        // No streaming happened yet, but we have message content (e.g., from page reload)
        // Animate from current display to full content
        if (!isCompletionModeRef.current) {
          isCompletionModeRef.current = true;
        }
        
        if (message.content.startsWith(currentDisplayed)) {
          const remainingText = message.content.slice(currentDisplayed.length);
          if (remainingText.length > 0) {
            addTokens(remainingText);
            queuedMessageContentRef.current = message.content;
          }
        } else {
          // Content doesn't match - set all immediately
          setFullText(message.content);
          queuedMessageContentRef.current = message.content;
          isCompletionModeRef.current = false;
        }
      } else if (currentDisplayed.length >= message.content.length) {
        // Display is complete - lock animation to prevent replay
        console.log(`[Animation Effect] ✅ LOCK: Display complete (${currentDisplayed.length} >= ${message.content.length})`);
        lastProcessedContentLengthRef.current = message.content.length; // Track length
        animatedContentHashRef.current = messageContentHash; // Store hash to prevent re-animation on ID change
        isAnimationLockedRef.current = true;
        isCompletionModeRef.current = false;
        contentFullySyncedRef.current = true; // Mark as fully synced
        return; // EXIT: Animation is complete, prevent any further processing
      }
    }
  }, [streamingText, isCurrentlyStreaming, isWaitingForFirstToken, message.content, addTokens, reset, setFullText]);

  // Reset when message ID changes (new message)
  // Use a ref to track the previous message ID to avoid unnecessary resets
  const prevMessageIdRef = useRef<string | undefined>(message.id);
  const hasStartedStreamingRef = useRef(false);
  
  useEffect(() => {
    // Handle message ID changes carefully to avoid resetting during temp->real handoff
    if (prevMessageIdRef.current !== message.id) {
      const prevId = prevMessageIdRef.current;
      const newId = message.id;
      
      // Check if this is a temp->real ID transition (not a completely new message)
      // If we're currently streaming or have queued text, preserve it during handoff
      const isIdHandoff = prevId && newId && 
                          prevId.startsWith('temp-') && 
                          !newId.startsWith('temp-') &&
                          (queuedTextRef.current.length > 0 || displayedText.length > 0);
      
      if (isIdHandoff) {
        // This is a temp->real ID handoff during streaming
        // DON'T reset - just update the tracking ref
        prevMessageIdRef.current = newId;
        // Keep streaming state intact
      } else {
        // This is a genuinely new message - reset everything
        prevMessageIdRef.current = newId;
        hasStartedStreamingRef.current = false;
        isCompletionModeRef.current = false;
        isAnimationLockedRef.current = false; // Unlock for new message
        contentFullySyncedRef.current = false; // Reset sync flag for new message
        animatedContentHashRef.current = ''; // Clear hash for new message
        queuedTextRef.current = '';
        queuedMessageContentRef.current = '';
        reset();
      }
    }
    
    // Track when streaming actually starts (first token arrives)
    if (isCurrentlyStreaming && !hasStartedStreamingRef.current) {
      hasStartedStreamingRef.current = true;
      isCompletionModeRef.current = false; // Not in completion mode while actively streaming
    }
  }, [message.id, isCurrentlyStreaming, reset, displayedText]);

  // Determine what to display
  // Always use displayedText if available (for smooth streaming), otherwise fall back to message.content
  // This ensures character-by-character display continues even after streaming completes
  // CRITICAL: During handoff (temp->real ID), prefer displayedText to avoid empty render
  const displayedContent = displayedText || message.content || (isCurrentlyStreaming ? '' : message.content);

  console.log(`
[MessageItem RENDER] id=${message.id?.slice(0, 12)} | role=${message.role} 
- displayedText: ${displayedText.length}c | message.content: ${message.content?.length || 0}c
- Using: "${displayedContent.slice(0, 30)}..." (${displayedContent.length}c)
- isCurrentlyStreaming: ${isCurrentlyStreaming}
  `);

  // Check if this is a stopped user message
  const isStoppedMessage = message.role === 'user' && message.isStopped;
  
  // Hover state for showing edit button
  const [isHovered, setIsHovered] = useState(false);
  // Inline edit state
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineEditValue, setInlineEditValue] = useState('');

  return (
    <div 
      className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images above the blue bubble */}
      {message.images && message.images.length > 0 && (
        <div className={`max-w-[85%] sm:max-w-[80%] mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className="flex flex-wrap gap-2">
            {message.images.map((src, idx) => (
              <div 
                key={idx} 
                className="overflow-hidden rounded-lg border-2 border-[#3a4a5a] bg-[#2a3441]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={src} 
                  alt={`attachment-${idx}`} 
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity block" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message bubble - only show if there's content or images for user, or content/streaming for assistant */}
      {((message.role === 'user' && (displayedContent || (message.images && message.images.length > 0))) ||
        (message.role === 'assistant' && (displayedContent || isCurrentlyStreaming || isWaitingForFirstToken))) && (
        <div
          className={`max-w-[85%] sm:max-w-[80%] min-w-0 rounded-xl overflow-hidden relative group ${
            message.role === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-[#2a3441] text-white'
          }`}
        >
          {/* Top-right edit removed: inline editing will be triggered from the action row below */}
          {/* For assistant messages, only render if there's content or currently streaming to avoid empty bubbles interfering with streaming display */}
          {((message.role === 'assistant' && (displayedContent || isCurrentlyStreaming || isWaitingForFirstToken)) || 
            (message.role === 'user' && displayedContent)) && (
          <div className="p-3 min-w-0">
            {message.role === 'assistant' ? (
              isWaitingForFirstToken ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : (
                <div className="text-base leading-relaxed">
                  <MarkdownRenderer content={displayedContent || ''} />
                </div>
              )
            ) : (
              // User message - support inline edit when stopped
              isInlineEditing ? (
                <div>
                  <textarea
                    value={inlineEditValue}
                    onChange={(e) => setInlineEditValue(e.target.value)}
                    className="w-full min-h-[80px] max-h-64 p-2 rounded-md bg-[#17202a] text-white resize-y"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600"
                      onClick={() => {
                        setIsInlineEditing(false);
                        setInlineEditValue('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={async () => {
                        if (onInlineEditSave) {
                          await onInlineEditSave(message.id, inlineEditValue.trim());
                        }
                        setIsInlineEditing(false);
                        setInlineEditValue('');
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-base whitespace-pre-wrap leading-relaxed break-all" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                  {displayedContent}
                </p>
              )
            )}

            {/* For user messages, show stop UI if stopped */}
            {isStoppedMessage && (
              <div className="mt-2 pt-2 border-t border-blue-400/30">
                <div className="flex items-center gap-2 text-sm text-blue-100/80">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>You stopped this response</span>
                </div>
              </div>
            )}
            
            {/* Timestamp, Copy and Speaker Icon - only show if message has content or is streaming or waiting */}
            {(displayedContent || isCurrentlyStreaming || isWaitingForFirstToken) && (
              <div className={`flex items-center justify-between mt-2 gap-2 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <p className={`text-xs ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
                <div className="flex items-center gap-2">
                  {/* Edit Button - only show for stopped user messages */}
                  {isStoppedMessage && (
                    <button
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      title="Edit message"
                      onClick={() => {
                        // Open inline editor by default
                        setInlineEditValue(message.content || '');
                        setIsInlineEditing(true);
                      }}
                    >
                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {/* Copy Button - only show when not streaming */}
                  {!isCurrentlyStreaming && displayedContent && (
                    <button
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      title={copiedMessageId === message.id ? "Copied!" : "Copy text"}
                      onClick={() => onCopyText(message.content || displayedContent, message.id)}
                    >
                      {copiedMessageId === message.id ? (
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  )}
                  {/* Speaker Icon - only show when not streaming and not assistant messages */}
                  {!isCurrentlyStreaming && message.role === 'assistant' && (
                    <>
                      {loadingMessageId === message.id ? (
                        <div className="w-[15px] h-[15px] border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
                      ) : currentPlayingId === message.id ? (
                        <button
                          className="opacity-60 hover:opacity-100 transition-opacity"
                          title="Stop audio"
                          onClick={onStopAudio}
                        >
                          <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : loadingMessageId ? null : (
                        <button
                          className="opacity-60 hover:opacity-100 transition-opacity"
                          title="Play audio"
                          onClick={() => onTextToSpeech(message.content || displayedContent, message.id)}
                        >
                          <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      )}

    </div>
  );
}

