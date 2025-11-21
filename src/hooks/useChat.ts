'use client';

import { useState, useEffect } from 'react';
import { Chat, Message, MessageDocument, TabType, Photo, Document } from '@/types/chat';
import { mockChats, mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CONFIG } from '@/constants/config';

const API_BASE_URL = CONFIG.API_URL || 'http://localhost:8000';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isMobile, setIsMobile] = useState(false);
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

   // Check URL params and set active chat from URL
   useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setActiveChat(chat);
      }
    }
  }, [searchParams, chats]);

  // Set first chat as active by default
  // useEffect(() => {
  //   if (chats.length > 0 && !activeChat) {
  //     setActiveChat(chats[0]);
  //   }
  // }, [chats, activeChat]);

  const createNewChat = (skipRedirect = false): Chat => {
    // Remove any existing empty chats (chats with no messages)
    setChats(prev => prev.filter(chat => chat.messages.length > 0));
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    if (!skipRedirect) {
      router.push(`/chat?chat=${newChat.id}`);
    }
    setActiveTab('chats');
    return newChat;
  };

  const selectChat = (chat: Chat) => {
    // Clean up any empty chats when selecting a new chat
    setChats(prev => prev.filter(c => c.messages.length > 0 || c.id === chat.id));
    setActiveChat(chat);
    router.push(`/chat?chat=${chat.id}`);
    setActiveTab('chats');
  };

    const sendMessage = async (content: string, images?: string[], documents?: MessageDocument[], chatOverride?: Chat) => {
    const chatToUse = chatOverride || activeChat;
    if (!chatToUse) return;

    const isFirstMessage = chatToUse.messages.length === 0;
    // Count user messages (excluding assistant messages)
    const userMessageCount = chatToUse.messages.filter(m => m.role === 'user').length;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      images: images && images.length > 0 ? images : undefined,
      documents: documents && documents.length > 0 ? documents : undefined
    };

    const updatedChat = {
      ...chatToUse,
      messages: [...chatToUse.messages, newMessage],
      updatedAt: new Date()
    };

    // Update chat title if it's the first message
    if (isFirstMessage) {
      updatedChat.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
    }

    setChats(prev => prev.map(chat => 
      chat.id === chatToUse.id ? updatedChat : chat
    ));
    setActiveChat(updatedChat);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse: Message;

      const hasUserImages = images && images.length > 0;
      // Check if user sent a voice message (AUDIO document)
      const hasVoiceMessage = documents && documents.some(doc => doc.type === 'AUDIO');
      
      // Voice message response (Technical Troubleshooting Mode)
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
      
      // First response (for first user message)
      const firstResponse = `There are several common reasons why a generator won't start after sitting idle. Let me help you troubleshoot this step by step.

1. **Fuel Issues**: Old or contaminated fuel can cause starting problems. Check if the fuel is fresh (less than 6 months old).

2. **Battery Problems**: If your generator has an electric start, the battery might be dead or weak. Check the battery voltage.

3. **Oil Level**: Ensure the oil level is adequate and not contaminated.

Can you tell me what type of generator you have and how long it's been sitting?`;

      // Second response (for second user message)
      const secondResponse = `For the Honda EU2200i, the most likely culprit is the fuel system. This generator is sensitive to fuel quality. Here's what to check:

1. **Fuel Stabilizer**: Did you add fuel stabilizer before storing it?
2. **Fuel Valve**: Make sure the fuel valve is in the "ON" position
3. **Choke**: Set the choke to "CLOSED" for cold starts
4. **Prime the Carburetor**: Pull the starter cord 3-4 times with the choke closed

Try these steps and let me know what happens when you attempt to start it.`;

      // If user sent voice message, use voice response
      if (hasVoiceMessage) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: voiceResponse,
          role: 'assistant',
          timestamp: new Date()
        };
      } else if (userMessageCount < 2) {
        // Determine which response to use based on user message count
        // userMessageCount is 0-based before adding this message, so:
        // - First message: userMessageCount = 0 → use firstResponse
        // - Second message: userMessageCount = 1 → use secondResponse
        const responseText = userMessageCount === 0 ? firstResponse : secondResponse;
        
        // Use first or second response for first two messages
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: responseText,
          role: 'assistant',
          timestamp: new Date(),
          // Only include images if user sent images
          images: hasUserImages ? ['/images/img1.png', '/images/img2.png'] : undefined
        };
      } else {
        // For subsequent messages, use the default response
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
  };

  const searchingofSpecificChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      router.push(`/chat?chat=${chat.id}`);
      setActiveChat(chat);
      setActiveTab('chats');
    }
  };

  const cleanupEmptyChats = () => {
    setChats(prev => prev.filter(chat => chat.messages.length > 0));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // If the deleted chat was active, clear the active chat
    if (activeChat?.id === chatId) {
      setActiveChat(null);
      router.push('/chat');
    }
  };

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
    createNewChat,
    selectChat,
    sendMessage,
    setActiveTab,
    searchingofSpecificChat,
    cleanupEmptyChats,
    deleteChat,
    deletePhoto,
    deleteDocument,
    textToSpeech
  };
}