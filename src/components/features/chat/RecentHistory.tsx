'use client';

import { Chat, PhotoGroup, Document, TabType } from '@/types/chat';

interface RecentHistoryProps {
  chats: Chat[];
  activeChat: Chat | null;
  photoGroups: PhotoGroup[];
  documents: Document[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onChatSelect: (chat: Chat) => void;
  onCreateNewChat: () => void;
}

export default function RecentHistory({
  chats,
  activeChat,
  photoGroups,
  documents,
  activeTab,
  onTabChange,
  onChatSelect,
  onCreateNewChat
}: RecentHistoryProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };


  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-4 bg-transparent flex-shrink-0">
        <h1 className="text-lg font-bold text-center text-white">Recent History</h1>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-4 border-b border-[#2a3441] gap-2 flex-shrink-0">
        <button
          onClick={() => onTabChange('chats')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'chats'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => onTabChange('photos')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'photos'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => onTabChange('documents')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'documents'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Documents
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#3a4a5a] text-white placeholder-gray-300 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Content - Dynamic Height */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0 chat-scrollbar">
        {activeTab === 'chats' && (
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
                      <button className="p-1 hover:bg-[#3a3a3a] rounded">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-[#3a3a3a] rounded">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
            <div className="space-y-6">
              {photoGroups.map((group) => (
                <div key={`${group.month}-${group.year}`}>
                  <h3 className="text-gray-400 text-sm font-medium mb-3">{group.month} {group.year}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {group.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-gray-400 text-sm font-medium mb-4">Documents</h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-[#2a3441] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${
                      doc.type === 'PDF' ? 'bg-green-500' :
                      doc.type === 'PPT' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {doc.type}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{doc.title}</p>
                      <p className="text-gray-400 text-xs">{formatDate(doc.date)} - {doc.size}</p>
                    </div>
                    <button className="p-1 hover:bg-[#3a3a3a] rounded">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
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
