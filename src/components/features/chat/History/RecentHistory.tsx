'use client';

import { useState } from 'react';
import { Chat, PhotoGroup, Document, TabType } from '@/types/chat';
import ChatsList from './ChatsList';
import PhotosGrid from './PhotosGrid';
import DocumentsList from './DocumentsList';

interface RecentHistoryProps {
  chats: Chat[];
  activeChat: Chat | null;
  photoGroups: PhotoGroup[];
  documents: Document[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onChatSelect: (chat: Chat) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photoId: string) => void;
  onDeleteDocument: (documentId: string) => void;
  onViewDocument: (documentId: string) => void;
}

export default function RecentHistory({
  chats,
  activeChat,
  photoGroups,
  documents,
  activeTab,
  onTabChange,
  onChatSelect,
  onCreateNewChat,
  onDeleteChat,
  onDeletePhoto,
  onViewPhoto,
  onDeleteDocument,
  onViewDocument
}: RecentHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.messages.length > 0 && chat.messages[chat.messages.length - 1].content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter photo groups based on search query
  const filteredPhotoGroups = photoGroups.map(group => ({
    ...group,
    photos: group.photos.filter(photo =>
      photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.photos.length > 0);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-[#3a4a5a] text-white placeholder-gray-300 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Content - Dynamic Height */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 min-h-0 chat-scrollbar" style={{ paddingBottom: '40px' }}>
        {activeTab === 'chats' && (
          <div className="pb-4">
            <ChatsList
              chats={filteredChats}
              activeChat={activeChat}
              onChatSelect={onChatSelect}
              onCreateNewChat={onCreateNewChat}
              onDeleteChat={onDeleteChat}
            />
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="pb-4">
            <PhotosGrid
              photoGroups={filteredPhotoGroups}
              onDeletePhoto={onDeletePhoto}
              onViewPhoto={onViewPhoto}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="pb-4">
            <DocumentsList
              documents={filteredDocuments}
              onDeleteDocument={onDeleteDocument}
              onViewDocument={onViewDocument}
            />
          </div>
        )}
      </div>
    </div>
  );
}

