'use client';

import { Chat, PhotoGroup } from '@/types/chat';

interface SidebarProps {
  chats: Chat[];
  activeChat: Chat | null;
  photoGroups: PhotoGroup[];
  onChatSelect: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photoId: string) => void;
}

export default function Sidebar({
  chats,
  activeChat,
  photoGroups,
  onChatSelect,
  onDeleteChat,
  onDeletePhoto,
  onViewPhoto
}: SidebarProps) {
  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-4 bg-transparent flex-shrink-0">
        <h1 className="text-lg font-bold text-center text-white">Chats</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats"
            className="w-full bg-[#3a4a5a] text-white placeholder-gray-300 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0 chat-scrollbar">
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

        {/* Photos Section */}
        {photoGroups.length > 0 && (
          <div className="mt-6">
            <h2 className="text-gray-400 text-sm font-medium mb-4">Recent Photos</h2>
            <div className="space-y-4">
              {photoGroups.slice(0, 2).map((group) => (
                <div key={`${group.month}-${group.year}`}>
                  <h3 className="text-gray-400 text-xs font-medium mb-2">{group.month} {group.year}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {group.photos.slice(0, 6).map((photo) => (
                      <div 
                        key={photo.id} 
                        className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden relative group cursor-pointer"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                        
                        {/* Hover overlay with action buttons */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewPhoto(photo.id);
                            }}
                            className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors duration-200"
                            title="View photo"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePhoto(photo.id);
                            }}
                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors duration-200"
                            title="Delete photo"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

