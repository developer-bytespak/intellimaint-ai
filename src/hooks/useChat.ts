'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chat, Message, MessageDocument, TabType, Photo, Document } from '@/types/chat';
import { mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CONFIG } from '@/constants/config';
import { chatApi } from '@/lib/api/chatApi';

const API_BASE_URL = CONFIG.API_URL || 'http://localhost:8000';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatPage, setChatPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const searchParams = useSearchParams();

  const router = useRouter();

  // Check if mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // lg breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load chat sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setChatPage(1);
        const result = await chatApi.listSessions({ page: 1, limit: 10 });
        setChats(result.chats);
        setHasMoreChats(result.pagination.page < result.pagination.totalPages);
      } catch (err: unknown) {
        console.error('Error loading chat sessions:', err);
        const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(errorMessage || 'Failed to load chat sessions');
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Load more chats for infinite scroll
  const loadMoreChats = useCallback(async () => {
    if (isLoadingMoreChats || !hasMoreChats) return;

    try {
      setIsLoadingMoreChats(true);
      const nextPage = chatPage + 1;
      const result = await chatApi.listSessions({ page: nextPage, limit: 10 });
      
      // Append new chats (avoid duplicates)
      setChats(prev => {
        const existingIds = new Set(prev.map(chat => chat.id));
        const newChats = result.chats.filter(chat => !existingIds.has(chat.id));
        return [...prev, ...newChats];
      });
      
      setChatPage(nextPage);
      setHasMoreChats(result.pagination.page < result.pagination.totalPages);
    } catch (err: unknown) {
      console.error('Error loading more chat sessions:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to load more chat sessions');
    } finally {
      setIsLoadingMoreChats(false);
    }
  }, [chatPage, hasMoreChats, isLoadingMoreChats]);

  // Check URL params and set active chat from URL
  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        // If chat is already loaded, use it
        setActiveChat(chat);
      } else {
        // If chat is not in the list, fetch it (might be a deep link)
        const loadChat = async () => {
          try {
            const fetchedChat = await chatApi.getSession(chatId);
            setActiveChat(fetchedChat);
            // Add to chats list if not already there
            setChats(prev => {
              const exists = prev.find(c => c.id === fetchedChat.id);
              if (!exists) {
                return [fetchedChat, ...prev];
              }
              return prev;
            });
          } catch (err: unknown) {
            console.error('Error loading chat session:', err);
            // If chat doesn't exist or access denied, clear the URL param
            router.push('/chat');
          }
        };
        loadChat();
      }
    } else if (!chatId && activeChat) {
      // If URL param is cleared but we have an active chat, keep it
      // Don't clear activeChat here
    }
  }, [searchParams, chats, router, activeChat]);

  const createNewChat = useCallback(async (skipRedirect = false): Promise<Chat | null> => {
    try {
      setError(null);
      // Remove any existing empty chats (chats with no messages) from local state
      setChats(prev => prev.filter(chat => chat.messages.length > 0));
      
      const newChat = await chatApi.createSession();
      
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      
      if (!skipRedirect) {
        router.push(`/chat?chat=${newChat.id}`);
      }
      setActiveTab('chats');
      return newChat;
    } catch (err: unknown) {
      console.error('Error creating chat session:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to create chat session');
      return null;
    }
  }, [router]);

  const selectChat = useCallback(async (chat: Chat) => {
    try {
      setError(null);
      // Clean up any empty chats when selecting a new chat
      setChats(prev => prev.filter(c => c.messages.length > 0 || c.id === chat.id));
      
      // Fetch full chat session with all messages
      const fullChat = await chatApi.getSession(chat.id);
      
      setActiveChat(fullChat);
      // Update the chat in the list
      setChats(prev => prev.map(c => c.id === fullChat.id ? fullChat : c));
      
      router.push(`/chat?chat=${chat.id}`);
      setActiveTab('chats');
    } catch (err: unknown) {
      console.error('Error selecting chat:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to load chat session');
    }
  }, [router]);

  const sendMessage = useCallback(async (
    content: string,
    images?: string[],
    documents?: MessageDocument[],
    chatOverride?: Chat
  ) => {
    const chatToUse = chatOverride || activeChat;
    if (!chatToUse) {
      // If no active chat, create a new one first
      const newChat = await createNewChat(true);
      if (!newChat) return;
      return sendMessage(content, images, documents, newChat);
    }

    try {
      setError(null);

      // Create message via API (only images are supported)
      const newMessage = await chatApi.createMessage(chatToUse.id, {
        content,
        images,
      });

      // Update local state optimistically
      const updatedChat = {
        ...chatToUse,
        messages: [...chatToUse.messages, newMessage],
        updatedAt: new Date(),
      };

      // Update title if it was auto-generated (first message)
      if (chatToUse.title === 'New Chat' && chatToUse.messages.length === 0) {
        updatedChat.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      }

      setChats(prev => prev.map(chat => 
        chat.id === chatToUse.id ? updatedChat : chat
      ));
      setActiveChat(updatedChat);

      // Simulate AI response (this will be replaced with actual AI service later)
      setTimeout(() => {
        let aiResponse: Message;

        const hasUserImages = images && images.length > 0;
        const hasVoiceMessage = documents && documents.some(doc => doc.type === 'AUDIO');
        const userMessageCount = updatedChat.messages.filter(m => m.role === 'user').length;
        
        const voiceResponse = `Technical Troubleshooting Mode (Advanced Users / Experts)
✔ Check these internal systems:

🔧 Fuse Box & Relays → Replace blown fuses

🔧 Fuel Filters & Injectors → Clogged diesel flow causes failure

🔧 Air Filter → Remove dust, improves combustion

🔧 Starter Motor Relay/Wiring → Use multimeter to test

⚙ ECU / Control Panel Error Reset:

Hold the RESET + STOP buttons together for 10 seconds

Release and restart the generator
✔ If generator shows error again → may indicate sensor failure (oil temp, crankshaft, alternator).`;
        
        const firstResponse = `There are several common reasons why a generator won't start after sitting idle. Let me help you troubleshoot this step by step.

1. **Fuel Issues**: Old or contaminated fuel can cause starting problems. Check if the fuel is fresh (less than 6 months old).

2. **Battery Problems**: If your generator has an electric start, the battery might be dead or weak. Check the battery voltage.

3. **Oil Level**: Ensure the oil level is adequate and not contaminated.

Can you tell me what type of generator you have and how long it's been sitting?`;

        const secondResponse = `For the Honda EU2200i, the most likely culprit is the fuel system. This generator is sensitive to fuel quality. Here's what to check:

1. **Fuel Stabilizer**: Did you add fuel stabilizer before storing it?
2. **Fuel Valve**: Make sure the fuel valve is in the "ON" position
3. **Choke**: Set the choke to "CLOSED" for cold starts
4. **Prime the Carburetor**: Pull the starter cord 3-4 times with the choke closed

Try these steps and let me know what happens when you attempt to start it.`;

        if (hasVoiceMessage) {
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: voiceResponse,
            role: 'assistant',
            timestamp: new Date()
          };
        } else if (userMessageCount < 2) {
          const responseText = userMessageCount === 0 ? firstResponse : secondResponse;
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: responseText,
            role: 'assistant',
            timestamp: new Date(),
            images: hasUserImages ? ['/images/img1.png', '/images/img2.png'] : undefined
          };
        } else {
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: 'I understand your question about generator troubleshooting. Let me help you with that. Can you provide more details about the specific issue you\'re experiencing?',
            role: 'assistant',
            timestamp: new Date()
          };
        }

        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, aiResponse],
          updatedAt: new Date()
        };

        setChats(prev => prev.map(chat => 
          chat.id === chatToUse.id ? finalChat : chat
        ));
        setActiveChat(finalChat);
      }, 1000);
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to send message');
    }
  }, [activeChat, createNewChat]);

  const searchingofSpecificChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      selectChat(chat);
    } else {
      // Try to fetch it
      const loadChat = async () => {
        try {
          const fetchedChat = await chatApi.getSession(chatId);
          setChats(prev => {
            const exists = prev.find(c => c.id === fetchedChat.id);
            if (!exists) {
              return [fetchedChat, ...prev];
            }
            return prev;
          });
          selectChat(fetchedChat);
        } catch (err: unknown) {
          console.error('Error loading chat:', err);
        }
      };
      loadChat();
    }
  }, [chats, selectChat]);

  const cleanupEmptyChats = useCallback(() => {
    setChats(prev => prev.filter(chat => chat.messages.length > 0));
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      setError(null);
      await chatApi.deleteSession(chatId);
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was active, clear the active chat
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        router.push('/chat');
      }
    } catch (err: unknown) {
      console.error('Error deleting chat:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to delete chat session');
    }
  }, [activeChat, router]);

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const textToSpeech = async (text: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/asr/synthesize`, {
        text: text
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'blob', // Important: Get audio as blob
      });

      // Create audio URL from blob and play it
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });

      // Cleanup URL after audio finishes
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      return response.data;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  };

  const photoGroups = getPhotoGroups(photos);

  return {
    chats,
    activeChat,
    activeTab,
    isMobile,
    photoGroups,
    documents,
    isLoading,
    error,
    hasMoreChats,
    isLoadingMoreChats,
    createNewChat,
    selectChat,
    sendMessage,
    setActiveTab,
    searchingofSpecificChat,
    cleanupEmptyChats,
    deleteChat,
    deletePhoto,
    deleteDocument,
    loadMoreChats,
    textToSpeech
  };
}
