'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat } from '@/types/chat';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (content: string) => void;
}

export default function ChatInterface({ activeChat, onSendMessage }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="px-4 py-3 bg-transparent" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-center">
          <button className="bg-[#2a3441] text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-blue-500 hover:text-white transition-colors duration-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L12 8.5 6.8 9.6L7.7 14z"/>
            </svg>
            Get Subscription
          </button>
        </div>
      </div>

      {/* Messages - Dynamic Height */}
      <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0 chat-scrollbar">
        {activeChat?.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">What seems to be the problem?</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeChat?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#2a3441] text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - Fixed at Bottom */}
      <div className="px-4 py-4 border-t border-[#2a3441]" style={{ flexShrink: 0 }}>
        <form onSubmit={handleSubmit}>
          {/* Input Field with Icons */}
          <div className="bg-[#2a3441] rounded-2xl p-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Intellimaint AI."
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none mb-3 text-base"
            />
            
            {/* Icons Row */}
            <div className="flex justify-between items-center">
              {/* Left Icons Group */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                  title="Document"
                >
                  <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                  title="Camera"
                >
                  <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                  title="Call"
                >
                  <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              </div>

              {/* Right Icons Group */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                  title="Voice"
                >
                  <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                  title="Attachment"
                >
                  <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}