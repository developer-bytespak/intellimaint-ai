'use client';

import { useState, useEffect } from 'react';
import { Chat, Message, TabType } from '@/types/chat';
import { mockChats, mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Set first chat as active by default
  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0]);
    }
  }, [chats, activeChat]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setActiveTab('chats');
  };

  const selectChat = (chat: Chat) => {
    setActiveChat(chat);
    setActiveTab('chats');
  };

  const sendMessage = (content: string) => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newMessage],
      updatedAt: new Date()
    };

    // Update chat title if it's the first message
    if (activeChat.messages.length === 0) {
      updatedChat.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
    }

    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id ? updatedChat : chat
    ));
    setActiveChat(updatedChat);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your question about generator troubleshooting. Let me help you with that. Can you provide more details about the specific issue you\'re experiencing?',
        role: 'assistant',
        timestamp: new Date()
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiResponse],
        updatedAt: new Date()
      };

      setChats(prev => prev.map(chat => 
        chat.id === updatedChat.id ? finalChat : chat
      ));
      setActiveChat(finalChat);
    }, 1000);
  };

  const photoGroups = getPhotoGroups(mockPhotos);

  return {
    chats,
    activeChat,
    activeTab,
    isMobile,
    photoGroups,
    documents: mockDocuments,
    createNewChat,
    selectChat,
    sendMessage,
    setActiveTab
  };
}