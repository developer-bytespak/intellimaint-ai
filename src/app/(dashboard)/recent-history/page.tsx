
'use client';

import { useEffect, useState, Suspense } from 'react';
import { Chat, TabType } from '@/types/chat';
import { mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';

function RecentHistoryContent() {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { chats, searchingofSpecificChat, deleteChat } = useChat();
  const router = useRouter();
  const searchParams = useSearchParams();

  const addParams = (params: string) => {
    router.push(`/recent-history?recent-history=${params}`);
  };

  const photoGroups = getPhotoGroups(mockPhotos);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const param = searchParams.get('recent-history');
    if (param === null) {
      router.replace("/recent-history?recent-history=chats");
      return;
    }
    if (param === 'chats') {
      setActiveTab('chats');
    } else if (param === 'photos') {
      setActiveTab('photos');
    } else if (param === 'documents') {
      setActiveTab('documents');
    }
  }, [searchParams, router]);

  const handleChatSelect = (chat: Chat) => {
    // setActiveChat(chat);
    // console.log(chat);
    searchingofSpecificChat(chat.id);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1f2632] text-white">

      {/* Header */}
      <div className="px-4 py-6 bg-transparent">
        <h1 className="text-xl font-bold text-white text-center">Recent History</h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-center px-4 py-4 border-b border-[#2a3441] gap-2">
        <button
          onClick={() => {
            handleTabChange('chats');
            addParams("chats");
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'chats'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => {
            handleTabChange('photos');
            addParams("photos");
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'photos'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => {
            handleTabChange('documents');
            addParams("documents");
          }}
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
      <div className="px-4 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#3a4a5a] text-white placeholder-gray-300 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Content - Responsive Grid */}
      <div className="px-4 h-[calc(100vh-200px)] overflow-y-auto pb-20 chat-scrollbar ">
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div>
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-gray-400 text-sm font-medium ">Chats</h2>
              <button 
              onClick={() => {
                router.push("/chat");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">
                New Chat
              </button>
            </div>
            <div className="space-y-2 ">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
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
                          deleteChat(chat.id);
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
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="pb-6 ">
            <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
            <div className="space-y-6">
              {photoGroups.map((group) => {
                const filteredPhotos = group.photos.filter(photo => 
                  photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                if (filteredPhotos.length === 0) return null;
                
                return (
                  <div key={`${group.month}-${group.year}`}>
                    <h3 className="text-gray-400 text-sm font-medium mb-3">{group.month} {group.year}</h3>
                    {/* Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {filteredPhotos.map((photo) => (
                        <div key={photo.id} className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden group cursor-pointer relative">
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          </div>
                          
                          {/* Hover overlay with action buttons */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement photo viewing logic
                                console.log('View photo:', photo.id);
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
                                // TODO: Implement photo deletion logic
                                console.log('Delete photo:', photo.id);
                              }}
                              className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors duration-200"
                              title="Delete photo"
                            >
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Photo info overlay */}
                          <div className="absolute inset-0 transition-opacity duration-200 flex items-end p-2 pointer-events-none">
                            <p className="text-white text-xs truncate">{photo.filename}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-gray-400 text-sm font-medium mb-4">Documents</h2>
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="p-3 bg-[#2a3441] rounded-xl hover:bg-[#3a4a5a] transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${
                      doc.type === 'PDF' ? 'bg-green-500' :
                      doc.type === 'PPT' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {doc.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-gray-400 text-xs">{doc.date.toLocaleDateString()} - {doc.size}</p>
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

      {/* Chat Detail Modal for Mobile */}
      {activeChat && (
        <div className="fixed inset-0 bg-[#1f2632] z-50 lg:hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a3441]">
            <button
              onClick={() => setActiveChat(null)}
              className="text-white hover:text-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-white">{activeChat.title}</h2>
            <div></div>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {activeChat.messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white ml-4'
                    : 'bg-[#2a3441] text-white mr-4'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1f2632] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <RecentHistoryContent />
    </Suspense>
  );
}