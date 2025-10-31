'use client';

import { useEffect, useRef } from 'react';
import { Chat } from '@/types/chat';

interface MessageListProps {
  activeChat: Chat | null;
}

export default function MessageList({ activeChat }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6 md:py-3 min-h-0 chat-scrollbar">
      <div className="space-y-4">
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
                        onClick={() => window.open(src, '_blank')}
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
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#3a4a5a] bg-[#2a3441] max-w-[250px] cursor-pointer hover:bg-[#3a4a5a] transition-colors"
                      onClick={() => window.open(doc.url, '_blank')}
                      title={`Click to open ${doc.file.name}`}
                    >
                      {doc.type === 'PDF' ? (
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      <span className="text-white text-xs truncate">
                        {doc.file.name}
                      </span>
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
                  {/* Timestamp */}
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              )}
              {/* Timestamp for image-only or document-only messages (without text) */}
              {(!message.content && ((message.images && message.images.length > 0) || (message.documents && message.documents.length > 0))) && (
                <div className="p-3 ">
                  <p className={`text-xs ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

