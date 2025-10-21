'use client';

import { useState } from 'react';
import { Chat } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import BottomNavigation from '@/components/features/chat/BottomNavigation';
import TopNavigation from '@/components/features/chat/TopNavigation';
import RecentHistory from '@/components/features/chat/RecentHistory';
import ChatInterface from '@/components/features/chat/ChatInterface';

type NavigationTab = 'chat' | 'history' | 'info' | 'profile';

export default function ChatPage() {
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
    setActiveTab
  } = useChat();

  console.log(activeChat);

  const [currentView, setCurrentView] = useState<NavigationTab>('chat');

  const handleNavigationChange = (tab: NavigationTab) => {
    setCurrentView(tab);
  };

  const handleChatSelect = (chat: Chat) => {
    selectChat(chat);
    if (isMobile) {
      setCurrentView('chat');
    }
  };

  const handleTabChange = (tab: 'chats' | 'photos' | 'documents') => {
    setActiveTab(tab);
  };

  const handleCreateNewChat = () => {
    createNewChat();
    if (isMobile) {
      setCurrentView('chat');
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-[#1f2632] flex flex-col" style={{ height: '100vh' }}>

        {/* Main Content - Dynamic Height */}
        <div className="flex-1 flex flex-col" style={{ minHeight: 0, overflow: 'hidden', paddingBottom: '88px' }}>
          {currentView === 'chat' && (
            <ChatInterface 
              activeChat={activeChat} 
              onSendMessage={sendMessage} 
            />
          )}
          {currentView === 'history' && (
            <RecentHistory
              chats={chats}
              activeChat={activeChat}
              photoGroups={photoGroups}
              documents={documents}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onChatSelect={handleChatSelect}
              onCreateNewChat={handleCreateNewChat}
            />
          )}
          {currentView === 'info' && (
            <div className="flex-1 bg-[#1f2632] text-white flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">App Info</h2>
                <p className="text-gray-400">App information will be displayed here</p>
              </div>
            </div>
          )}
          {currentView === 'profile' && (
            <div className="flex-1 bg-[#1f2632] text-white flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                <p className="text-gray-400">Profile information will be displayed here</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={currentView}
          onTabChange={handleNavigationChange}
        />
      </div>
    );
  }

  // Desktop Layout - Split View
  return (
    <div className="h-screen bg-[#1f2632] overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation onTabChange={handleNavigationChange} />

      {/* Main Content - Split Layout */}
      <div className="flex h-full">
        {/* Left Side - Recent History */}
        <div className="w-80 border-r border-[#2a3441] h-full">
          <RecentHistory
            chats={chats}
            activeChat={activeChat}
            photoGroups={photoGroups}
            documents={documents}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onChatSelect={handleChatSelect}
            onCreateNewChat={handleCreateNewChat}
          />
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 h-full">
          <ChatInterface 
            activeChat={activeChat} 
            onSendMessage={sendMessage} 
          />
        </div>
      </div>

      {/* Desktop Info/Profile Modals */}
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