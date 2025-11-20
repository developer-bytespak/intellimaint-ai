'use client';

import { useState, Suspense } from 'react';
import { Chat, MessageDocument } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { TopNavigation } from '@/components/features/chat/Navigation';
import RecentHistory from '@/components/features/chat/History/RecentHistory';
import ChatInterface from '@/components/features/chat/ChatInterface';

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
    deleteChat
  } = useChat();

  const [currentView, setCurrentView] = useState<NavigationTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    if (isMobile) {
      setCurrentView('chat');
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessageFromWelcome = (content: string, images?: string[], documents?: MessageDocument[]) => {
    // Create new chat first if no active chat (without redirect)
    if (!activeChat) {
      // Create new chat without redirecting
      createNewChat(true); // Pass true to skip redirect
      // Wait a bit for state to update, then send message
      setTimeout(() => {
        sendMessage(content, images, documents);
      }, 100);
    } else {
      sendMessage(content, images, documents);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    console.log('Delete photo:', photoId);
  };

  const handleViewPhoto = (photoId: string) => {
    console.log('View photo:', photoId);
  };

  const handleDeleteDocument = (documentId: string) => {
    console.log('Delete document:', documentId);
  };

  const handleViewDocument = (documentId: string) => {
    console.log('View document:', documentId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Responsive Layout - Works for both mobile and desktop
  return (
    <div className="h-screen bg-[#1f2632] flex overflow-hidden max-w-full">
      {/* Backdrop - Close sidebar when clicking outside */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop only */}
      {!isMobile && (
        <div className={`fixed left-0 top-0 bottom-0 w-80 bg-[#1f2632] border-r border-[#2a3441] z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3441]">
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
          
          <div className="h-full overflow-hidden">
            <RecentHistory
              chats={chats}
              activeChat={activeChat}
              photoGroups={photoGroups}
              documents={documents}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onChatSelect={handleChatSelect}
              onCreateNewChat={handleCreateNewChat}
              onDeleteChat={deleteChat}
              onDeletePhoto={handleDeletePhoto}
              onViewPhoto={handleViewPhoto}
              onDeleteDocument={handleDeleteDocument}
              onViewDocument={handleViewDocument}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - Shifts when sidebar opens (desktop only) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 max-w-full overflow-hidden ${
        !isMobile && isSidebarOpen ? 'ml-80' : 'ml-0'
      }`}>
        {/* Top Header - Desktop only */}
        {!isMobile && (
          <div className="flex-shrink-0 bg-[#1f2632] border-b border-[#2a3441]">
            <div className="flex items-center justify-between px-4 py-3">
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
              
              <button className="bg-[#2a3441] text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 hover:text-white transition-colors duration-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L12 8.5 6.8 9.6L7.7 14z"/>
                </svg>
                <span className="hidden sm:inline">Get Subscription</span>
                <span className="sm:hidden">Subscribe</span>
              </button>
              
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