'use client';

import { useEffect, useRef, useState } from 'react';
import { Chat } from '@/types/chat';
import { useAudio } from '@/hooks/useAudio';

interface MessageListProps {
  activeChat: Chat | null;
}

export default function MessageList({ activeChat }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const { textToSpeech, currentPlayingId, playAudio, stopAudio } = useAudio();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

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
    <div className="w-full">
      <div className="space-y-4 pb-4">
        {activeChat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Images above the blue bubble (outside frame) */}
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
                        onClick={() => setViewingImage(src)}
                        onError={(e) => {
                          console.error('Failed to load image:', src);
                          e.currentTarget.style.display = 'none';
                        }}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Documents above the blue bubble */}
            {message.documents && message.documents.length > 0 && (
              <div className={`max-w-[85%] sm:max-w-[80%] mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-wrap gap-2">
                  {message.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-[#3a4a5a] bg-[#2a3441] ${doc.type === 'AUDIO' ? 'max-w-[300px]' : 'max-w-[250px] cursor-pointer hover:bg-[#3a4a5a]'} transition-colors`}
                      onClick={doc.type !== 'AUDIO' ? () => window.open(doc.url, '_blank') : undefined}
                      title={doc.type !== 'AUDIO' ? `Click to open ${doc.file.name}` : 'Audio message'}
                    >
                      {doc.type === 'AUDIO' ? (
                        <div className="flex items-center gap-2 w-full">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <audio 
                            controls 
                            src={doc.url}
                            className="flex-1 h-8"
                            style={{ maxWidth: '200px' }}
                          />
                        </div>
                      ) : doc.type === 'PDF' ? (
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {doc.type !== 'AUDIO' && (
                        <span className="text-white text-xs truncate">
                          {doc.file.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Blue bubble with text */}
            <div
              className={`max-w-[85%] sm:max-w-[80%] min-w-0 rounded-xl overflow-hidden ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#2a3441] text-white'
              }`}
            >
              {message.content && (
                <div className="p-3 min-w-0">
                  <p className="text-base whitespace-pre-wrap leading-relaxed break-all" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>{message.content}</p>
                  {/* Timestamp, Copy and Speaker Icon */}
                  <div className={`flex items-center justify-between mt-2 gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <p className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      {message.content && (
                        <button
                          className="opacity-60 hover:opacity-100 transition-opacity"
                          title={copiedMessageId === message.id ? "Copied!" : "Copy text"}
                          onClick={() => handleCopyText(message.content, message.id)}
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
                      {/* Speaker Icon */}
                      {loadingMessageId === message.id ? (
                        <div className="w-[15px] h-[15px] border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
                      ) : currentPlayingId === message.id ? (
                        <button
                          className="opacity-60 hover:opacity-100 transition-opacity"
                          title="Stop audio"
                          onClick={stopAudio}
                        >
                          <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : loadingMessageId ? null : (
                        <button
                          className="opacity-60 hover:opacity-100 transition-opacity"
                          title="Play audio"
                          onClick={() => handleTextToSpeech(message.content, message.id)}
                        >
                          <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Timestamp for image-only or document-only messages (without text) */}
              {(!message.content && ((message.images && message.images.length > 0) || (message.documents && message.documents.length > 0))) && (
                <div className="p-3">
                  <div className={`flex items-center justify-between gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <p className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    {loadingMessageId === message.id ? (
                      <div className="w-[15px] h-[15px] border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
                    ) : currentPlayingId === message.id ? (
                      <button
                        className="opacity-60 hover:opacity-100 transition-opacity"
                        title="Stop audio"
                        onClick={stopAudio}
                      >
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : loadingMessageId ? null : (
                      <button
                        className="opacity-60 hover:opacity-100 transition-opacity"
                        title="Play audio"
                        onClick={() => handleTextToSpeech(message.content || '', message.id)}
                      >
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
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

