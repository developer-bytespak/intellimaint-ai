'use client';

import { useState } from 'react';
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

  const [currentView, setCurrentView] = useState<NavigationTab>('chat');

  const handleNavigationChange = (tab: NavigationTab) => {
    setCurrentView(tab);
  };

  const handleChatSelect = (chat: any) => {
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
      <div className="h-screen bg-[#0a0a0a] overflow-hidden">
        {/* Status Bar */}
        <div className="bg-black text-white text-sm px-6 py-3 flex justify-between items-center relative">
          <span className="font-semibold">11:41</span>
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-3 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full"></div>
          <div className="flex items-center gap-1">
            {/* Signal bars */}
            <div className="flex items-end gap-0.5">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-2 bg-white rounded-full"></div>
              <div className="w-1 h-3 bg-white rounded-full"></div>
              <div className="w-1 h-4 bg-white rounded-full"></div>
            </div>
            {/* WiFi icon */}
            <div className="w-4 h-3 ml-1">
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
              </svg>
            </div>
            {/* Battery */}
            <div className="w-6 h-3 border border-white rounded-sm relative ml-1">
              <div className="w-4 h-2 bg-white rounded-sm absolute top-0.5 left-0.5"></div>
              <div className="w-0.5 h-1 bg-white rounded-r-sm absolute right-[-2px] top-1"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full pb-20">
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
            <div className="h-full bg-[#0a0a0a] text-white flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">App Info</h2>
                <p className="text-gray-400">App information will be displayed here</p>
              </div>
            </div>
          )}
          {currentView === 'profile' && (
            <div className="h-full bg-[#0a0a0a] text-white flex items-center justify-center">
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
    <div className="h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation onTabChange={handleNavigationChange} />

      {/* Main Content - Split Layout */}
      <div className="flex h-full pt-16">
        {/* Left Side - Recent History */}
        <div className="w-1/3 border-r border-[#2a2a2a]">
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
        <div className="flex-1">
          <ChatInterface 
            activeChat={activeChat} 
            onSendMessage={sendMessage} 
          />
        </div>
      </div>

      {/* Desktop Info/Profile Modals */}
      {currentView === 'info' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-8 max-w-md w-full mx-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-8 max-w-md w-full mx-4">
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