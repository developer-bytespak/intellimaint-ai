'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat } from '@/types/chat';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (content: string) => void;
}

export default function ChatInterface({ activeChat, onSendMessage }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [showPinMenu, setShowPinMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPinMenu && !(event.target as Element).closest('.pin-dropdown')) {
        setShowPinMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPinMenu]);

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

   // If no active chat, show welcome screen
   if (!activeChat) {
    return (
      <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-[calc(100vh-110px)] md:overflow-y-hidden overflow-y-auto items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl text-center space-y-4 sm:space-y-6">
          {/* Logo or Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome to IntelliMaint AI</h1>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 sm:mt-8">
            <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-white font-semibold mb-1">Fast Response</h3>
              <p className="text-gray-400 text-sm">Get instant AI-powered answers</p>
            </div>
            <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-white font-semibold mb-1">Expert Knowledge</h3>
              <p className="text-gray-400 text-sm">Access comprehensive maintenance data</p>
            </div>
            <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-white font-semibold mb-1">24/7 Available</h3>
              <p className="text-gray-400 text-sm">Always here when you need help</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full overflow-hidden">
      {/* Messages - Responsive scrolling */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 min-h-0 chat-scrollbar">
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
                  className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-xl ${
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
      <div className="flex-shrink-0 px-3 sm:px-4 md:mb-0 mb-20 py-3 sm:py-4 border-t border-[#2a3441] bg-[#1f2632]">
        <form onSubmit={handleSubmit}
        className=''
        >
          {/* Input Field with Icons */}
          <div className="bg-[#2a3441] rounded-2xl flex px-3 sm:px-4 py-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Intellimaint AI."
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base"
            />
            
            {/* Icons Row */}
            <div className="flex justify-between items-center">
              {/* Left Icons Group */}
              <div className="flex items-center gap-2">
                {/* Pin Button with Dropdown */}
                <div className="relative pin-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowPinMenu(!showPinMenu)}
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                    title="More Options"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  </button>
                  
                  {/* Pin Dropdown Menu */}
                  {showPinMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-[#1f2632] border border-[#3a4a5a] rounded-lg shadow-lg p-2 z-50">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] rounded-lg transition-all duration-200"
                          onClick={() => setShowPinMenu(false)}
                          title="Call"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] rounded-lg transition-all duration-200"
                          onClick={() => setShowPinMenu(false)}
                          title="Camera"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] rounded-lg transition-all duration-200"
                          onClick={() => setShowPinMenu(false)}
                          title="Gallery"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] rounded-lg transition-all duration-200"
                          onClick={() => setShowPinMenu(false)}
                          title="Document"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}