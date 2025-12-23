'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Chat } from '@/types/chat';
import { useAudio } from '@/hooks/useAudio';
import MessageItem from './MessageItem';

interface MessageListProps {
  activeChat: Chat | null;
  isSending?: boolean;
  streamingText?: { [messageId: string]: string };
  streamingMessageId?: string | null;
  onEditMessage?: (messageId: string) => void;
  onInlineEditSave?: (messageId: string, newContent: string) => void;
}

export default function MessageList({ 
  activeChat, 
  isSending = false, 
  streamingText = {}, 
  streamingMessageId = null,
  onEditMessage,
  onInlineEditSave,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const { textToSpeech, currentPlayingId, playAudio, stopAudio } = useAudio();

  // Check if user is near bottom of scroll (helper function for initial check)
  const checkIfNearBottom = () => {
    const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;
      let parent = element.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const scrollableContainer = findScrollableParent(messagesContainerRef.current);
    if (!scrollableContainer) {
      setIsUserNearBottom(true); // Default to true if can't find container
      return;
    }

    const threshold = 100;
    const isNearBottom = 
      scrollableContainer.scrollHeight - scrollableContainer.scrollTop - scrollableContainer.clientHeight < threshold;
    setIsUserNearBottom(isNearBottom);
  };

  // Scroll to bottom smoothly if user is near bottom
  // Memoize to prevent dependency array issues
  const scrollToBottom = useCallback(() => {
    if (isUserNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isUserNearBottom]);

  // Listen for scroll events to track user position
  // Find the scrollable parent container
  useEffect(() => {
    // Find the scrollable parent (the div with overflow-y-auto in WelcomeScreen)
    const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;
      let parent = element.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const scrollableContainer = findScrollableParent(messagesContainerRef.current);
    
    if (!scrollableContainer) {
      // Fallback: use the container itself if no scrollable parent found
      checkIfNearBottom();
      return;
    }

    const handleScroll = () => {
      const threshold = 100;
      const isNearBottom = 
        scrollableContainer.scrollHeight - scrollableContainer.scrollTop - scrollableContainer.clientHeight < threshold;
      setIsUserNearBottom(isNearBottom);
    };

    scrollableContainer.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      scrollableContainer.removeEventListener('scroll', handleScroll);
    };
  }, [activeChat?.messages]);

  // Auto-scroll when messages are added
  useEffect(() => {
    const lastMessage = activeChat?.messages[activeChat.messages.length - 1];
    const isUserMessage = lastMessage?.role === 'user';
    
    // Always scroll for user messages, conditional scroll for assistant messages
    if (isUserMessage || (isUserNearBottom && lastMessage?.role === 'assistant')) {
      scrollToBottom();
    }
  }, [activeChat?.messages.length, isSending, isUserNearBottom]);

  // During streaming, scroll smoothly as text arrives
  // Use streamingText length or keys to track changes without causing dependency array size issues
  const streamingTextLength = streamingMessageId ? (streamingText[streamingMessageId]?.length || 0) : 0;
  
  useEffect(() => {
    if (!streamingMessageId || !isUserNearBottom) return;

    // Scroll during streaming when new tokens arrive
    scrollToBottom();
  }, [streamingTextLength, streamingMessageId, isUserNearBottom, scrollToBottom]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!activeChat || activeChat.messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-lg">What seems to be the problem?</p>
      </div>
    );
  }

  const handleCopyText = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleTextToSpeech = async (text: string, messageId: string) => {
    try {
      // Stop currently playing audio if any
      if (currentPlayingId) {
        stopAudio();
      }

      // Set loading state for this message
      setLoadingMessageId(messageId);

      // Call the mutation
      textToSpeech.mutate(text, {
        onSuccess: (data) => {
          console.log('data', data);
          playAudio(data, messageId);
          setLoadingMessageId(null);
        },
        onError: (error) => {
          if (error instanceof Error && error.message === 'SYNTHESIS_CANCELLED') {
            setLoadingMessageId(null);
            return;
          }
          console.error('Error playing audio:', error);
          setLoadingMessageId(null);
          alert('Error playing audio');
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setLoadingMessageId(null);
    }
  };

  return (
    <div className="w-full" ref={messagesContainerRef}>
      <div className="space-y-4 pb-4">
        {activeChat.messages.map((message, index) => {
          const isLastMessage = index === activeChat.messages.length - 1;
          // Get streaming text for this message if it's currently streaming
          const messageStreamingText = streamingMessageId === message.id 
            ? streamingText[message.id] || null
            : null;
          const isCurrentlyStreaming = streamingMessageId === message.id && messageStreamingText !== null;
          
          return (
            <MessageItem
              key={message.id}
              message={message}
              isLastMessage={isLastMessage}
              isSending={isSending}
              copiedMessageId={copiedMessageId}
              loadingMessageId={loadingMessageId}
              currentPlayingId={currentPlayingId}
              onCopyText={handleCopyText}
              onTextToSpeech={handleTextToSpeech}
              onStopAudio={stopAudio}
              formatTime={formatTime}
              streamingText={messageStreamingText}
              streamingMessageId={streamingMessageId}
              onEditMessage={onEditMessage}
              onInlineEditSave={onInlineEditSave}
            />
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Overlay */}
      {viewingImage && (
        <div 
          className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
            title="Close"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <img
            src={viewingImage}
            alt="Full size image"
            className="max-w-[85%] max-h-[75vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error('Failed to load image:', viewingImage);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}

