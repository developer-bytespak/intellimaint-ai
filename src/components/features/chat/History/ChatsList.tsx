'use client';

import { useEffect, useRef, useState } from 'react';
import { Chat } from '@/types/chat';

interface ChatsListProps {
  chats: Chat[];
  activeChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateChat?: (chatId: string, updates: { title?: string }) => Promise<Chat | void>;
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
  onUpdateChat,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: ChatsListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

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
            onClick={() => !editingChatId && onChatSelect(chat)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              activeChat?.id === chat.id
                ? 'bg-[#3a4a5a] border border-blue-500'
                : 'hover:bg-[#3a4a5a]'
            } ${editingChatId === chat.id ? '' : 'cursor-pointer'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingChatId === chat.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={async () => {
                      if (onUpdateChat && editTitle.trim() && editTitle !== chat.title) {
                        try {
                          await onUpdateChat(chat.id, { title: editTitle.trim() });
                        } catch (error) {
                          // Error handling is done in the hook
                        }
                      }
                      setEditingChatId(null);
                      setEditTitle('');
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (onUpdateChat && editTitle.trim() && editTitle !== chat.title) {
                          try {
                            await onUpdateChat(chat.id, { title: editTitle.trim() });
                          } catch (error) {
                            // Error handling is done in the hook
                          }
                        }
                        setEditingChatId(null);
                        setEditTitle('');
                      } else if (e.key === 'Escape') {
                        setEditingChatId(null);
                        setEditTitle('');
                      }
                    }}
                    className="w-full bg-[#2a3441] text-white text-sm font-medium mb-1 px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-sm font-medium mb-1">{chat.title}</p>
                )}
                {chat.messages.length > 0 && (
                  <p className="text-gray-400 text-xs">
                    {chat.messages[chat.messages.length - 1].content.substring(0, 50)}...
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                {onUpdateChat && editingChatId !== chat.id && (
                  <button 
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat.id);
                      setEditTitle(chat.title);
                      // Focus input after state update
                      setTimeout(() => {
                        editInputRef.current?.focus();
                        editInputRef.current?.select();
                      }, 0);
                    }}
                    title="Rename chat"
                  >
                    <svg className="w-5 h-5 text-blue-400 hover:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button 
                  className="p-1 hover:bg-red-500/20 rounded transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete chat"
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

