
'use client';

import { useEffect, useState, Suspense } from 'react';
import { Chat, TabType, Photo } from '@/types/chat';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import DocumentsList from '@/components/features/chat/History/DocumentsList';
import PhotosGrid from '@/components/features/chat/History/PhotosGrid';

function RecentHistoryContent() {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const { chats, searchingofSpecificChat, deleteChat, photoGroups, deletePhoto, documents, deleteDocument } = useChat();
  const router = useRouter();
  const searchParams = useSearchParams();

  const addParams = (params: string) => {
    router.push(`/recent-history?recent-history=${params}`);
  };

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

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteDocument = (documentId: string) => {
    deleteDocument(documentId);
  };

  const handleViewDocument = (documentId: string) => {
    console.log('View document:', documentId);
    // Document viewing will be handled by RecentHistory component
  };

  // Handle view photo - find the photo and set it for overlay
  const handleViewPhoto = (photoId: string) => {
    // Find the photo in all photo groups
    for (const group of photoGroups) {
      const photo = group.photos.find(p => p.id === photoId);
      if (photo) {
        setViewingPhoto(photo);
        break;
      }
    }
  };

  // Handle delete photo - show confirmation dialog
  const handleDeletePhoto = (photoId: string) => {
    setPhotoToDelete(photoId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete photo
  const confirmDeletePhoto = () => {
    if (photoToDelete) {
      // If the photo being viewed is deleted, close the overlay
      if (viewingPhoto?.id === photoToDelete) {
        setViewingPhoto(null);
      }
      // Call the delete handler
      deletePhoto(photoToDelete);
      setPhotoToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Cancel delete photo
  const cancelDeletePhoto = () => {
    setPhotoToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Generate image URL for photo
  const getPhotoImageUrl = (photo: Photo, index: number) => {
    if (photo.url && (photo.url.startsWith('http') || photo.url.startsWith('/'))) {
      return photo.url;
    }
    const photoSeed = parseInt(photo.id.replace(/\D/g, '')) || index;
    const imageId = (photoSeed % 1000) + 1;
    return `https://picsum.photos/id/${imageId}/800/800`;
  };

  // Filter photo groups based on search query
  const filteredPhotoGroups = photoGroups.map(group => ({
    ...group,
    photos: group.photos.filter(photo =>
      photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.photos.length > 0);

  return (
    <div className="h-screen bg-[#1f2632] text-white flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-4 py-6 bg-transparent flex-shrink-0">
        <h1 className="text-xl font-bold text-white text-center">Recent History</h1>
      </div>

      {/* Tabs */}
      <div className="flex w-full border-b border-[#2a3441] flex-shrink-0">
        <button
          onClick={() => {
            handleTabChange('chats');
            addParams("chats");
          }}
          className={`flex-1 py-4 rounded-none text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'chats'
              ? 'bg-blue-500/10 text-white border-blue-500'
              : 'text-gray-400 hover:text-white border-transparent'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => {
            handleTabChange('photos');
            addParams("photos");
          }}
          className={`flex-1 py-4 rounded-none text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'photos'
              ? 'bg-blue-500/10 text-white border-blue-500'
              : 'text-gray-400 hover:text-white border-transparent'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => {
            handleTabChange('documents');
            addParams("documents");
          }}
          className={`flex-1 py-4 rounded-none text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'documents'
              ? 'bg-blue-500/10 text-white border-blue-500'
              : 'text-gray-400 hover:text-white border-transparent'
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

      {/* Content - Responsive Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 min-h-0 chat-scrollbar" style={{ paddingBottom: '200px' }}>
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div>
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-gray-400 text-sm font-medium ">Chats</h2>
              <button 
              onClick={() => {
                router.push("/chat?closeSidebar=true");
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
          <div className="pb-4">
            <PhotosGrid
              photoGroups={filteredPhotoGroups}
              onDeletePhoto={handleDeletePhoto}
              onViewPhoto={handleViewPhoto}
            />
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="pb-4">
            <DocumentsList
              documents={filteredDocuments}
              onDeleteDocument={handleDeleteDocument}
              onViewDocument={handleViewDocument}
            />
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

      {/* Photo Overlay - Constrained to menu bar width */}
      {viewingPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxHeight: '90vh' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
              title="Close"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Photo */}
            <div className="p-4">
              <img
                src={getPhotoImageUrl(viewingPhoto, 0)}
                alt={viewingPhoto.filename || 'Photo'}
                className="w-full h-auto max-h-[calc(90vh-180px)] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const photoSeed = parseInt(viewingPhoto.id.replace(/\D/g, '')) || 0;
                  const fallbackId = ((photoSeed + 100) % 1000) + 1;
                  if (!target.dataset.fallbackAttempted) {
                    target.dataset.fallbackAttempted = 'true';
                    target.src = `https://picsum.photos/id/${fallbackId}/800/800`;
                  }
                }}
              />
              {/* Photo Info */}
              <div className="mt-4 relative">
                <div className="text-center">
                  <p className="text-white text-sm font-medium">{viewingPhoto.filename}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {viewingPhoto.date.toLocaleDateString()} • {viewingPhoto.size ? `${(viewingPhoto.size / 1000).toFixed(1)} KB` : ''}
                </p>
                </div>
                {/* Delete Button - Bottom Right after description */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(viewingPhoto.id);
                  }}
                  className="absolute -bottom-1 -right-1 p-2 bg-red-500/90 hover:bg-red-600 rounded-full transition-colors duration-200 shadow-lg"
                  title="Delete photo"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={cancelDeletePhoto}
        >
          <div 
            className="relative bg-[#1f2632] rounded-xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-white text-lg font-semibold mb-2">Delete Photo</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this photo? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeletePhoto}
                  className="px-4 py-2 bg-[#2a3441] hover:bg-[#3a4a5a] text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePhoto}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
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