
'use client';

import { useEffect, useState, Suspense } from 'react';
import { Chat, TabType } from '@/types/chat';
import { mockChats, mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';

function RecentHistoryContent() {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { searchingofSpecificChat } = useChat();
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log(mockChats);

  const addParams = (params: string) => {
    router.push(`/recent-history?recent-history=${params}`);
  };

  const photoGroups = getPhotoGroups(mockPhotos);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const param = searchParams.get('recent-history');
    // if (param === null) {
    //   router.replace("/recent-history?recent-history=chats");
    //   return;
    // }
    if (param === 'chats') {
      handleTabChange('chats');
    } else if (param === 'photos') {
      handleTabChange('photos');
    } else if (param === 'documents') {
      handleTabChange('documents');
    }
  }, [searchParams]);

  const handleChatSelect = (chat: Chat) => {
    // setActiveChat(chat);
    // console.log(chat);
    searchingofSpecificChat(chat.id);
  };

  const filteredChats = mockChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPhotos = mockPhotos.filter(photo =>
    photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex px-4 py-4 border-b border-[#2a3441] gap-2">
        <button
          onClick={() => {
            // handleTabChange('chats')
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
            // handleTabChange('photos')
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
            // handleTabChange('documents')
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
      <div className="px-4 h-[calc(100vh-200px)] overflow-y-auto pb-20 chat-scrollbar">
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-400 text-sm font-medium">Chats</h2>
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

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <h2 className="text-gray-400 text-sm font-medium mb-4">Photos</h2>
            <div className="space-y-6">
              {photoGroups.map((group) => (
                <div key={`${group.month}-${group.year}`}>
                  <h3 className="text-gray-400 text-sm font-medium mb-3">{group.month} {group.year}</h3>
                  {/* Responsive Grid: 3 columns on mobile, 4 on tablet, 6 on desktop */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {group.photos
                      .filter(photo => 
                        photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((photo) => (
                      <div key={photo.id} className="aspect-square bg-[#2a3441] rounded-xl overflow-hidden group cursor-pointer">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                        {/* Photo info overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                          <p className="text-white text-xs truncate">{photo.filename}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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