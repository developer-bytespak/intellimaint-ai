'use client';

import { useEffect, useRef } from 'react';
import { Chat } from '@/types/chat';

interface ChatsListProps {
  chats: Chat[];
  activeChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export default function ChatsList({
  chats,
  activeChat,
  onChatSelect,
  onCreateNewChat,
  onDeleteChat,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: ChatsListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-400 text-sm font-medium">Chats</h2>
        <button
          onClick={onCreateNewChat}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
        >
          New Chat
        </button>
      </div>
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              activeChat?.id === chat.id
                ? 'bg-[#3a4a5a] border border-blue-500'
                : 'hover:bg-[#3a4a5a]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">{chat.title}</p>
                {chat.messages.length > 0 && (
                  <p className="text-gray-400 text-xs">
                    {chat.messages[chat.messages.length - 1].content.substring(0, 50)}...
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button 
                  className="p-1 hover:bg-red-500/20 rounded transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                >
                  <svg className="w-5 h-5 text-red-400 hover:text-red-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4 flex justify-center">
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>
      )}
    </div>
  );
}

