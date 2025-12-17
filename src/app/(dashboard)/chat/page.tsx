'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { Chat, MessageDocument, Document } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { useUser } from '@/hooks/useUser';
import { useDocuments, useRepository } from '@/hooks/useRepository';
import { TopNavigation } from '@/components/features/chat/Navigation';
import RecentHistory from '@/components/features/chat/History/RecentHistory';
import ChatInterface from '@/components/features/chat/ChatInterface';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';


type NavigationTab = 'chat' | 'history' | 'info' | 'profile';

function ChatPageContent() {
  const {
    chats,
    activeChat,
    activeTab,
    isMobile,
    photoGroups,
    documents,
    createNewChat,
    selectChat,
    sendMessage,
    setActiveTab,
    updateChat,
    deleteChat,
    deletePhoto,
    deleteDocument,
    loadMoreChats,
    hasMoreChats,
    isLoadingMoreChats,
    isLoading,
    isSending,
    streamingText,
    streamingMessageId,
    stopStreaming,
    startEditingMessage,
    editingMessageId,
    setEditingMessageId,
  } = useChat();
  
  

  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<NavigationTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [allRepositoryDocuments, setAllRepositoryDocuments] = useState<Document[]>([]);
  const [hasMoreDocuments, setHasMoreDocuments] = useState(true);

  const { deleteDocument: deleteRepositoryDocument } = useRepository();
  
  // Fetch repository documents with pagination (10 per page)
  const { data: repositoryDocumentsData, isLoading: isLoadingRepositoryDocuments } = useDocuments(repositoryPage, 10);
  const { logout } = useUser();
  
  // Transform and accumulate repository documents
  useEffect(() => {
    if (!repositoryDocumentsData?.documents) return;
    
    const newDocuments = repositoryDocumentsData.documents
      .filter(doc => doc.status === 'ready') // Only show ready documents (all are PDFs since upload enforces PDF-only)
      .map((repoDoc) => {
        // Format file size
        const formatFileSize = (bytes: number): string => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        };

        return {
          id: repoDoc.id,
          title: repoDoc.fileName,
          type: 'PDF' as const,
          size: formatFileSize(repoDoc.fileSize),
          date: new Date(repoDoc.uploadedAt),
          url: repoDoc.fileUrl,
        };
      });

    if (repositoryPage === 1) {
      // First page - replace all documents
      setAllRepositoryDocuments(newDocuments);
    } else {
      // Subsequent pages - append new documents (avoid duplicates)
      setAllRepositoryDocuments(prev => {
        const existingIds = new Set(prev.map(doc => doc.id));
        const newDocs = newDocuments.filter(doc => !existingIds.has(doc.id));
        return [...prev, ...newDocs];
      });
    }

    // Check if there are more pages
    const pagination = repositoryDocumentsData.pagination;
    setHasMoreDocuments(pagination && pagination.page < pagination.totalPages);
  }, [repositoryDocumentsData, repositoryPage]);

  // Load more documents function
  const loadMoreDocuments = () => {
    if (!isLoadingRepositoryDocuments && hasMoreDocuments) {
      setRepositoryPage(prev => prev + 1);
    }
  };

  // Close sidebar if coming from recent-history page with closeSidebar parameter
  useEffect(() => {
    const closeSidebar = searchParams.get('closeSidebar');
    if (closeSidebar === 'true') {
      setIsSidebarOpen(false);
      // Create new chat when coming from recent-history
      if (!activeChat) {
        createNewChat();
      }
    }
  }, [searchParams, createNewChat, activeChat]);

  const handleChatSelect = (chat: Chat) => {
    selectChat(chat);
    if (isMobile) {
      setCurrentView('chat');
      setIsSidebarOpen(false);
    }
  };

  const handleTabChange = (tab: 'chats' | 'photos' | 'documents') => {
    setActiveTab(tab);
  };

  const handleCreateNewChat = () => {
    createNewChat();
    // Close sidebar on both mobile and desktop when creating new chat
    setCurrentView('chat');
    setIsSidebarOpen(false);
  };

 

  const handleSendMessageFromWelcome = (content: string, images?: string[], documents?: MessageDocument[]) => {
    // Create new chat first if no active chat (without redirect)
    if (!activeChat) {
      // Create new chat without redirecting and get the new chat object
      const newChat = createNewChat(true); // Pass true to skip redirect
      // Use the new chat directly to send message immediately
      sendMessage(content, images, documents, newChat);
    } else {
      sendMessage(content, images, documents);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(photoId);
  };

  const handleViewPhoto = (photoId: string) => {
    console.log('View photo:', photoId);
  };

  const handleLogout = async () => {
    try {
      const result = await logout.mutateAsync();
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    // Check if it's a repository document
    const repoDoc = allRepositoryDocuments.find(doc => doc.id === documentId);
    if (repoDoc) {
      // Delete repository document
      try {
        await deleteRepositoryDocument.mutateAsync(documentId);
        // Remove from local state
        setAllRepositoryDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error('Failed to delete repository document:', error);
      }
      return;
    }
    
    // Otherwise, it's a chat document - use existing logic
    deleteDocument(documentId);
  };

  const handleViewDocument = (documentId: string) => {
    // Find the document in repository documents or chat documents
    const repoDoc = allRepositoryDocuments.find(doc => doc.id === documentId);
    const chatDoc = documents.find(doc => doc.id === documentId);
    const doc = repoDoc || chatDoc;
    
    if (doc) {
      // Open document in new tab
      if (doc.url && doc.url.startsWith('http')) {
        window.open(doc.url, '_blank');
      } else {
        // For chat documents without URL, use existing logic
        console.log('View document:', documentId);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMainContentClick = (e: React.MouseEvent) => {
    if (!isSidebarOpen) return;

    const target = e.target as HTMLElement | null;
    if (!target) {
      setIsSidebarOpen(false);
      return;
    }

    // Don't close the sidebar when clicking on interactive elements inside the main content
    // such as buttons, links, inputs, textareas, svgs, or dropdowns (pin-dropdown)
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('svg') ||
      target.closest('.pin-dropdown') ||
      target.closest('.no-sidebar-close')
    ) {
      return;
    }

    setIsSidebarOpen(false);
  };

  // Responsive Layout - Works for both mobile and desktop
  return (
    <div className="h-screen bg-[#1f2632] flex overflow-hidden max-w-full">
      {/* Compact mobile subscription CTA */}
      {isMobile && (
        <div className="fixed top-3 right-3 z-50">
          <Link href={ROUTES.SUBSCRIPTION} className="bg-[#2a3441] text-white p-2 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L12 8.5 6.8 9.6L7.7 14z" />
            </svg>
          </Link>
        </div>
      )}
      {/* Backdrop - Close sidebar when clicking outside (Mobile only) */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop only */}
      {!isMobile && (
        <div className={`fixed left-0 top-0 bottom-0 w-80 bg-[#1f2632] border-r border-[#2a3441] z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3441] flex-shrink-0">
            <h2 className="text-lg font-bold text-white">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2a3441] text-white hover:bg-[#3a4a5a] transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden min-h-0">
              <RecentHistory

                chats={chats}
                activeChat={activeChat}
                photoGroups={photoGroups}
                documents={allRepositoryDocuments.length > 0 ? allRepositoryDocuments : documents}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onChatSelect={handleChatSelect}
                onCreateNewChat={handleCreateNewChat}
                onUpdateChat={updateChat}
                onDeleteChat={deleteChat}
                onDeletePhoto={handleDeletePhoto}
                onViewPhoto={handleViewPhoto}
                onDeleteDocument={handleDeleteDocument}
                onViewDocument={handleViewDocument}
                onLoadMoreDocuments={loadMoreDocuments}
                hasMoreDocuments={hasMoreDocuments}
                isLoadingDocuments={isLoadingRepositoryDocuments}
                onLoadMoreChats={loadMoreChats}
                hasMoreChats={hasMoreChats}
                isLoadingChats={isLoadingMoreChats || isLoading}
                
              />
            </div>
            {/* Logout Button at bottom of sidebar */}
            <div className="flex-shrink-0 border-t border-[#2a3441] bg-[#1f2632]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-none bg-[#2a3441] hover:bg-red-600/20 text-white transition-colors duration-200 border-0"
              >
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H9" />
                </svg>
                <span className="text-sm font-medium">{logout?.isPending ? 'Logging out...' : 'Logout'}</span>
                {logout?.isError && (
                  <span className="text-xs text-red-500">Error during logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Shifts when sidebar opens (desktop only) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 max-w-full overflow-hidden relative ${
        !isMobile && isSidebarOpen ? 'ml-80' : 'ml-0'
      }`} onClick={handleMainContentClick}>
        {/* Top Header - Desktop only */}
        {!isMobile && (
          <div className="flex-shrink-0 bg-[#1f2632] border-b border-[#2a3441]">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center w-8 h-8 text-white hover:bg-[#3a4a5a] transition-all duration-200 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                {isSidebarOpen && <div className="w-8"></div>}
                
                {/* IntelliMaint AI Logo and Name - Only show when chat has messages */}
                {activeChat && activeChat.messages.length > 0 && (
                  <button
                    onClick={handleCreateNewChat}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    title="Start new chat"
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="/Intelliment LOgo.png" 
                        alt="IntelliMaint AI Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h1 className="text-lg font-semibold text-white">IntelliMaint AI</h1>
                  </button>
                )}
              </div>
              
              <Link href={ROUTES.SUBSCRIPTION} className="bg-[#2a3441] text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 hover:text-white transition-colors duration-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L12 8.5 6.8 9.6L7.7 14z"/>
                </svg>
                <span className="hidden sm:inline">Get Subscription</span>
                <span className="sm:hidden">Subscribe</span>
              </Link>
              
              <div className="w-8"></div>
            </div>
          </div>
        )}

        {/* Top Navigation - Only on desktop */}
        {!isMobile && <TopNavigation />}

        {/* Center Component - Responsive Content */}
        <div className="flex-1 overflow-hidden max-w-full min-w-0">
          {currentView === 'chat' && (
            <ChatInterface 
              activeChat={activeChat} 
              onSendMessage={sendMessage}
              onSendMessageFromWelcome={handleSendMessageFromWelcome}
              isSending={isSending}
              streamingText={streamingText}
              streamingMessageId={streamingMessageId}
              stopStreaming={stopStreaming}
              startEditingMessage={startEditingMessage}
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
            />
          )}
        </div>
      </div>

      {/* Info/Profile Modals */}
      {currentView === 'info' && (
        <div className="fixed inset-0 bg-[#1f2632] bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#2a3441] rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">App Info</h2>
              <p className="text-gray-400 mb-6">App information will be displayed here</p>
              <button
                onClick={() => setCurrentView('chat')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'profile' && (
        <div className="fixed inset-0 bg-[#1f2632] bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#2a3441] rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
              <p className="text-gray-400 mb-6">Profile information will be displayed here</p>
              <button
                onClick={() => setCurrentView('chat')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#1f2632] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}