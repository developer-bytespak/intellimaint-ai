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
  
  const { displayedText, addTokens, reset, setFullText, queueLength } = useSmoothStreaming({
    baseDelay: 15, // Slightly faster base delay for smoother feel
    minDelay: 3, // Very fast when queue is large
    maxDelay: 40, // Slower when queue is small
    queueThreshold: 50,
    aggressivenessFactor: 0.12,
  });
  
  // Track what we've already queued (not just what's displayed)
  // This prevents re-adding tokens when queue empties
  const queuedTextRef = useRef<string>('');
  
  // Track what portion of message.content has been queued (for non-streaming messages)
  const queuedMessageContentRef = useRef<string>('');

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
    if (isCurrentlyStreaming && streamingText !== null) {
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
      // Not streaming anymore and not waiting - ensure we continue character-by-character display
      // Check if we need to continue streaming remaining characters
      const alreadyQueuedContent = queuedMessageContentRef.current;
      
      // Only add content that hasn't been queued yet
      if (message.content.length > alreadyQueuedContent.length) {
        // Verify the new content extends what we've already queued
        if (message.content.startsWith(alreadyQueuedContent) || alreadyQueuedContent.length === 0) {
          const remainingText = message.content.slice(alreadyQueuedContent.length);
          if (remainingText.length > 0) {
            addTokens(remainingText);
            queuedMessageContentRef.current = message.content;
          }
        } else {
          // Content changed (shouldn't happen, but handle it)
          reset();
          queuedMessageContentRef.current = '';
          if (message.content.length > 0) {
            addTokens(message.content);
            queuedMessageContentRef.current = message.content;
          }
        }
      }
      // If displayedText is already complete or longer, let the smooth streaming hook continue
      // Don't call setFullText here - let the queue finish naturally for smooth character-by-character display
    }
  }, [streamingText, isCurrentlyStreaming, isWaitingForFirstToken, message.content, displayedText, addTokens, reset, setFullText]);

  // Reset when message ID changes (new message)
  // Use a ref to track the previous message ID to avoid unnecessary resets
  const prevMessageIdRef = useRef<string | undefined>(message.id);
  const hasStartedStreamingRef = useRef(false);
  
  useEffect(() => {
    // Only reset if message ID actually changed (new message)
    if (prevMessageIdRef.current !== message.id) {
      prevMessageIdRef.current = message.id;
      hasStartedStreamingRef.current = false;
      queuedTextRef.current = ''; // Reset queued text tracking
      queuedMessageContentRef.current = ''; // Reset message content tracking
      reset();
    }
    
    // Track when streaming actually starts (first token arrives)
    if (isCurrentlyStreaming && !hasStartedStreamingRef.current) {
      hasStartedStreamingRef.current = true;
    }
  }, [message.id, isCurrentlyStreaming, reset]);

  // Determine what to display
  // Always use displayedText if available (for smooth streaming), otherwise fall back to message.content
  // This ensures character-by-character display continues even after streaming completes
  const displayedContent = displayedText || (isCurrentlyStreaming ? '' : message.content);

  // Check if this is a stopped user message
  const isStoppedMessage = message.role === 'user' && message.isStopped;
  
  // Hover state for showing edit button
  const [isHovered, setIsHovered] = useState(false);

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

      {/* Message bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] min-w-0 rounded-xl overflow-hidden relative group ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-[#2a3441] text-white'
        }`}
      >
        {/* Edit button on hover for stopped messages */}
        {isStoppedMessage && onEditMessage && (
          <button
            onClick={() => onEditMessage(message.id)}
            className={`absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all z-10 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title="Edit message"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {/* For assistant messages, only render if there's content or currently streaming to avoid empty bubbles interfering with streaming display */}
        {((message.role === 'assistant' && (displayedContent || isCurrentlyStreaming || isWaitingForFirstToken)) || 
          (message.role === 'user' && (displayedContent || displayedContent === ''))) && (
          <div className="p-3 min-w-0">
            {message.role === 'assistant' ? (
              <>
                {isWaitingForFirstToken ? (
                  // Show loader while waiting for first token
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
                )}
              </>
            ) : (
              <p className="text-base whitespace-pre-wrap leading-relaxed break-all" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                {displayedContent}
              </p>
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
                  {isStoppedMessage && onEditMessage && (
                    <button
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      title="Edit message"
                      onClick={() => onEditMessage(message.id)}
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

    </div>
  );
}

