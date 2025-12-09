'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chat, Message, MessageDocument, TabType, Photo, Document } from '@/types/chat';
import { mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CONFIG } from '@/constants/config';
import { chatApi } from '@/lib/api/chatApi';
import { useUser } from '@/hooks/useUser';

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
  const [isSending, setIsSending] = useState(false);
  const [streamingText, setStreamingText] = useState<{ [messageId: string]: string }>({});
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [hasReceivedFirstToken, setHasReceivedFirstToken] = useState<{ [messageId: string]: boolean }>({});
  const [streamingAbortController, setStreamingAbortController] = useState<AbortController | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  // Track if current stream was aborted to prevent onComplete from running
  const isStreamAbortedRef = useRef<boolean>(false);
  const searchParams = useSearchParams();
  const activeChatRef = useRef<Chat | null>(null);
  const chatsRef = useRef<Chat[]>([]);

  const router = useRouter();
  const { user } = useUser();

  // Keep refs in sync with state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Helper function to detect and clean up stopped messages
  // A stopped message is a user message with no assistant response after it
  const cleanupStoppedMessages = useCallback(async (chat: Chat): Promise<Chat> => {
    if (!chat.id || chat.messages.length === 0) {
      return chat;
    }

    const messages = [...chat.messages];
    const messagesToDelete: string[] = [];

    // Find stopped messages (user messages with no assistant response after them)
    // We only delete messages that are CLEARLY stopped, not just the last message
    // (which could be in progress if the page crashed before response)
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      // Only check user messages
      if (message.role !== 'user') {
        continue;
      }

      // Skip if this is the last message - it might be in progress
      // We only delete if there's clear evidence it was stopped
      if (i === messages.length - 1) {
        // Don't delete - could be in progress
        continue;
      }

      // Check if next message is another user message (no assistant response between)
      // This is clear evidence the previous message was stopped
      const nextMessage = messages[i + 1];
      if (nextMessage && nextMessage.role === 'user') {
        messagesToDelete.push(message.id);
        continue;
      }

      // Check if next message is assistant with empty content (incomplete response)
      // This is clear evidence the response was stopped
      if (nextMessage && nextMessage.role === 'assistant' && (!nextMessage.content || nextMessage.content.trim().length === 0)) {
        messagesToDelete.push(message.id);
        // Also delete the incomplete assistant message
        if (!messagesToDelete.includes(nextMessage.id)) {
          messagesToDelete.push(nextMessage.id);
        }
        continue;
      }
      
      // Check if next message is assistant with content, but user message is the last user message
      // and there's no subsequent user message - this suggests the user stopped it but backend completed
      // We'll delete the assistant message if the user message appears to be stopped
      // (This is a heuristic - if a user message is immediately followed by an assistant message
      // and there's no other user message after, it might have been stopped)
      if (nextMessage && nextMessage.role === 'assistant' && nextMessage.content && nextMessage.content.trim().length > 0) {
        // Check if this is the last user message in the conversation
        const isLastUserMessage = !messages.slice(i + 1).some(msg => msg.role === 'user');
        // If it's the last user message and immediately followed by assistant, 
        // and there are more messages after, it might have been stopped
        // But we need to be careful - only delete if there's clear evidence
        // For now, we'll skip this case to avoid false positives
      }
    }

    // Delete stopped messages from backend
    if (messagesToDelete.length > 0 && chat.id) {
      const deletePromises = messagesToDelete
        .filter(id => !id.startsWith('temp-')) // Only delete real messages, not temp ones
        .map(messageId => 
          chatApi.deleteMessage(chat.id, messageId).catch(error => {
            console.error(`Error deleting stopped message ${messageId}:`, error);
            // Continue even if deletion fails
          })
        );
      
      await Promise.all(deletePromises);
    }

    // Remove stopped messages from frontend state
    const cleanedMessages = messages.filter(msg => !messagesToDelete.includes(msg.id));
    
    return {
      ...chat,
      messages: cleanedMessages,
    };
  }, []);

  // Helper function to convert blob URL or data URL to File
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    if (url.startsWith('data:')) {
      // Data URL (base64)
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } else if (url.startsWith('blob:')) {
      // Blob URL
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } else {
      // Already a permanent URL, return as-is (shouldn't happen but handle it)
      throw new Error('URL is already a permanent URL');
    }
  };

  // Helper function to upload images to storage
  const uploadImages = useCallback(async (imageUrls: string[]): Promise<string[]> => {
    if (!user?.id) {
      throw new Error('User ID not available');
    }

    const uploadPromises = imageUrls.map(async (url, index) => {
      // If it's already a permanent URL (starts with http/https), return as-is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // Convert to File
      const file = await urlToFile(url, `chat-image-${Date.now()}-${index}.jpg`);

      // Upload to storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id!);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url; // Return permanent URL
    });

    return Promise.all(uploadPromises);
  }, [user?.id]);

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
        
        // Clean up stopped messages in all chats
        const cleanedChats = await Promise.all(
          result.chats.map(chat => cleanupStoppedMessages(chat))
        );
        
        setChats(cleanedChats);
        setHasMoreChats(result.pagination.page < result.pagination.totalPages);
      } catch (err: unknown) {
        console.error('Error loading chat sessions:', err);
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        const errorMessage = axiosError?.response?.data?.message;
        
        // Handle 401 - session expired
        if (axiosError?.response?.status === 401) {
          setError('Your session has expired. Please refresh the page to continue.');
          // Keep existing chats in cache so UI doesn't break
          // Don't clear chats - let user see what they had
        } else {
          setError(errorMessage || 'Failed to load chat sessions');
          setChats([]);
        }
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
      
      // Clean up stopped messages in new chats
      const cleanedNewChats = await Promise.all(
        result.chats.map(chat => cleanupStoppedMessages(chat))
      );
      
      // Append new chats (avoid duplicates)
      setChats(prev => {
        const existingIds = new Set(prev.map(chat => chat.id));
        const newChats = cleanedNewChats.filter(chat => !existingIds.has(chat.id));
        return [...prev, ...newChats];
      });
      
      setChatPage(nextPage);
      setHasMoreChats(result.pagination.page < result.pagination.totalPages);
    } catch (err: unknown) {
      console.error('Error loading more chat sessions:', err);
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message;
      
      // Handle 401 - session expired
      if (axiosError?.response?.status === 401) {
        setError('Your session has expired. Please refresh the page to continue.');
      } else {
        setError(errorMessage || 'Failed to load more chat sessions');
      }
    } finally {
      setIsLoadingMoreChats(false);
    }
  }, [chatPage, hasMoreChats, isLoadingMoreChats]);

  // Check URL params and set active chat from URL
  useEffect(() => {
    const chatId = searchParams.get('chat');
    const currentActiveChat = activeChatRef.current;
    const currentChats = chatsRef.current;
    
    if (chatId && chatId !== '') {
      // Only load from URL if there's a valid chat ID (not empty)
      // Don't override if we already have an active chat with empty ID (new chat)
      if (currentActiveChat && (!currentActiveChat.id || currentActiveChat.id === '')) {
        // We have a new chat active, don't override it
        return;
      }
      
      // If activeChat already matches the URL chatId, don't fetch again (prevents flickering)
      if (currentActiveChat?.id === chatId) {
        return;
      }
      
      // Load chat from URL - don't wait for chats list to be populated
      // This ensures messages load on page reload even if chats list is still loading
      const loadChatFromUrl = async () => {
        try {
          // First check if chat is in the cached list
          const cachedChat = currentChats.find(c => c.id === chatId);
          
          // Always fetch full session from API to ensure we have all messages
          // This is especially important on page reload
          const fetchedChat = await chatApi.getSession(chatId);
          
          // Clean up any stopped messages (user messages with no assistant response)
          const cleanedChat = await cleanupStoppedMessages(fetchedChat);
          
          // Update active chat
          setActiveChat(prev => {
            if (prev?.id === chatId) {
              return prev; // Already set, don't override
            }
            return cleanedChat;
          });
          
          // Update or add to chats list
          setChats(prev => {
            const exists = prev.find(c => c.id === cleanedChat.id);
            if (exists) {
              // Update existing chat with full session data
              return prev.map(c => c.id === cleanedChat.id ? cleanedChat : c);
            } else {
              // Add new chat to the list
              return [cleanedChat, ...prev];
            }
          });
        } catch (err: unknown) {
          console.error('Error loading chat session from URL:', err);
          const axiosError = err as { response?: { status?: number } };
          
          // If 401, let the interceptor handle it
          if (axiosError?.response?.status !== 401) {
            // If chat doesn't exist or access denied, clear the URL param
            router.push('/chat');
          }
        }
      };
      
      loadChatFromUrl();
    } else if (!chatId && currentActiveChat && currentActiveChat.id && currentActiveChat.id !== '') {
      // URL has no chat param but we have an active chat with ID
      // This shouldn't happen, but if it does, keep the active chat
    }
    // If no chatId in URL and we have an active chat with no ID, that's fine (new chat)
  }, [searchParams, router]);

  const createNewChat = useCallback((skipRedirect: boolean = false): Chat => {
    // Create local chat state only (no API call, no ID, no URL change)
    // Session will be created when first message is sent
    const newChat: Chat = {
      id: '', // Empty ID - will be set when session is created
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Remove any existing empty chats (chats with no ID or no messages)
    setChats(prev => prev.filter(chat => chat.id && chat.messages.length > 0));
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setActiveTab('chats');
    
    // Clear URL to prevent useEffect from loading old chat
    if (!skipRedirect) {
      router.push('/chat');
    }
    
    return newChat;
  }, [router]);

  const selectChat = useCallback(async (chat: Chat) => {
    try {
      setError(null);
      // Clean up any empty chats when selecting a real chat
      setChats(prev => prev.filter(c => (c.id && c.id !== '') || c.id === chat.id));
      
      // If it's a new chat (no ID), just set it as active without fetching
      if (!chat.id || chat.id === '') {
        setActiveChat(chat);
        setActiveTab('chats');
        return;
      }
      
      // Always fetch full session from API to ensure we have all messages and attachments
      // The listSessions endpoint only returns the last message, so we need full session
      const fullChat = await chatApi.getSession(chat.id);
      
      // Clean up any stopped messages (user messages with no assistant response)
      const cleanedChat = await cleanupStoppedMessages(fullChat);
      
      setActiveChat(cleanedChat);
      setChats(prev => prev.map(c => c.id === cleanedChat.id ? cleanedChat : c));
      router.push(`/chat?chat=${chat.id}`);
      setActiveTab('chats');
    } catch (err: unknown) {
      console.error('Error selecting chat:', err);
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message;
      
      // Handle 401 Unauthorized - token might have expired
      if (axiosError?.response?.status === 401) {
        setError('Your session has expired. Please refresh the page to continue.');
        // Don't redirect automatically - let user decide
      } else {
        setError(errorMessage || 'Failed to load chat session');
      }
    }
  }, [router, chats]);

  const sendMessage = useCallback(async (
    content: string,
    images?: string[],
    documents?: MessageDocument[],
    chatOverride?: Chat,
    editingMessageIdParam?: string | null
  ) => {
    const chatToUse = chatOverride || activeChat;
    if (!chatToUse) {
      // If no active chat, create a new one first (local only)
      const newChat = createNewChat();
      return sendMessage(content, images, documents, newChat, editingMessageIdParam);
    }

    try {
      setError(null);
      setIsSending(true);

      // If editing, remove the old message and any subsequent messages
      let finalChatToUse = chatToUse;
      if (editingMessageIdParam && chatToUse) {
        const messageIndex = chatToUse.messages.findIndex(m => m.id === editingMessageIdParam);
        if (messageIndex !== -1) {
          const messageToDelete = chatToUse.messages[messageIndex];
          
          // Delete from backend if it's a real message (not temp)
          if (chatToUse.id && messageToDelete.id && !messageToDelete.id.startsWith('temp-')) {
            try {
              await chatApi.deleteMessage(chatToUse.id, messageToDelete.id);
            } catch (error) {
              console.error('Error deleting old message:', error);
              // Continue with frontend cleanup even if backend delete fails
            }
          }
          
          const updatedMessages = chatToUse.messages.slice(0, messageIndex);
          const updatedChat = {
            ...chatToUse,
            messages: updatedMessages,
          };
          finalChatToUse = updatedChat;
          setActiveChat(updatedChat);
          setChats(prev => prev.map(chat => 
            chat.id === chatToUse.id ? updatedChat : chat
          ));
        }
        setEditingMessageId(null);
      }

      // Upload images to storage first to get permanent URLs
      let permanentImageUrls: string[] = [];
      if (images && images.length > 0) {
        try {
          permanentImageUrls = await uploadImages(images);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          setError('Failed to upload images. Please try again.');
          throw uploadError;
        }
      }

      // Check if this is a new chat (empty ID means it hasn't been saved to backend yet)
      const isNewChat = !finalChatToUse.id || finalChatToUse.id === '';

      // Create optimistic message for immediate display
      const optimisticMessage: Message = {
        id: `temp-msg-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date(),
        images: permanentImageUrls.length > 0 ? permanentImageUrls : undefined,
        isStopped: false,
      };

      // Update local state optimistically (show message immediately)
      const optimisticChat = {
        ...finalChatToUse,
        messages: [...finalChatToUse.messages, optimisticMessage],
        updatedAt: new Date(),
        title: finalChatToUse.title === 'New Chat' && finalChatToUse.messages.length === 0
          ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
          : finalChatToUse.title,
      };

      setChats(prev => prev.map(chat => 
        chat.id === finalChatToUse.id ? optimisticChat : chat
      ));
      setActiveChat(optimisticChat);

      // Create streaming assistant message placeholder
      const tempAssistantMessageId = `temp-assistant-${Date.now()}`;
      const optimisticAssistantMessage: Message = {
        id: tempAssistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };

      // Add optimistic assistant message
      const chatWithAssistant = {
        ...optimisticChat,
        messages: [...optimisticChat.messages, optimisticAssistantMessage],
      };

      setChats(prev => prev.map(chat => 
        chat.id === finalChatToUse.id ? chatWithAssistant : chat
      ));
      setActiveChat(chatWithAssistant);
      setStreamingText({});
      setHasReceivedFirstToken({});
      // Don't set streamingMessageId yet - wait for first token to show loader
      // setStreamingMessageId(tempAssistantMessageId);

      // Create abort controller for streaming
      const abortController = new AbortController();
      setStreamingAbortController(abortController);
      // Reset abort flag for new stream
      isStreamAbortedRef.current = false;

      // Stream message via SSE
      let finalChat: Chat;
      let actualSessionId: string;
      let actualAssistantMessageId: string | undefined;

      try {
        if (isNewChat) {
          // Stream with new session
          await chatApi.streamMessageWithSession(
            {
              content,
              images: permanentImageUrls.length > 0 ? permanentImageUrls : undefined,
            },
            // onToken
            (token: string, fullText: string, sessionId?: string) => {
              // Check if aborted
              if (abortController.signal.aborted) return;
              
              // Set streamingMessageId on first token to hide loader
              if (!hasReceivedFirstToken[tempAssistantMessageId]) {
                setHasReceivedFirstToken(prev => ({
                  ...prev,
                  [tempAssistantMessageId]: true,
                }));
                setStreamingMessageId(tempAssistantMessageId);
              }
              
              // Only update if the new fullText is actually longer (new content)
              // The MessageItem component handles queue tracking to prevent duplicates
              setStreamingText(prev => {
                const currentText = prev[tempAssistantMessageId] || '';
                
                // Only update if new text is longer (has new content)
                if (fullText.length > currentText.length) {
                  // Verify the new text extends the previous (not a complete replacement)
                  if (fullText.startsWith(currentText) || currentText.length === 0) {
                    return {
                      ...prev,
                      [tempAssistantMessageId]: fullText,
                    };
                  }
                }
                // If same length or shorter, don't update (prevents showing duplicate content)
                return prev;
              });
              if (sessionId) {
                actualSessionId = sessionId;
              }
            },
            // onComplete
            (fullText: string, sessionId: string, messageId?: string) => {
              if (abortController.signal.aborted || isStreamAbortedRef.current) {
                isStreamAbortedRef.current = false; // Reset for next stream
                return;
              }
              
              actualSessionId = sessionId;
              actualAssistantMessageId = messageId;
              setStreamingAbortController(null);
              
              // Update the message in place with the final text immediately
              // This ensures the text stays visible while we fetch the complete chat
              setActiveChat(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === tempAssistantMessageId
                      ? { ...msg, content: fullText }
                      : msg
                  ),
                };
              });
              setChats(prev => prev.map(chat => {
                if (chat.id === finalChatToUse.id || (!chat.id && finalChatToUse.id === '')) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === tempAssistantMessageId
                        ? { ...msg, content: fullText }
                        : msg
                    ),
                  };
                }
                return chat;
              }));
              
              // Keep streaming text visible until we have the complete chat
              // This prevents the restart effect
              setStreamingText(prev => ({
                ...prev,
                [tempAssistantMessageId]: fullText,
              }));
              
              // Then fetch complete chat to get final state (with real message ID)
              chatApi.getSession(sessionId).then((completeChat) => {
                // Find the real message ID in the complete chat
                const realMessage = completeChat.messages.find(msg => 
                  msg.role === 'assistant' && 
                  msg.content === fullText &&
                  msg.id !== tempAssistantMessageId
                );
                const realMessageId = realMessage?.id || actualAssistantMessageId || tempAssistantMessageId;
                
                // If we have a real message ID, update streaming text mapping
                if (realMessageId && realMessageId !== tempAssistantMessageId) {
                  setStreamingText(prev => {
                    const updated = { ...prev };
                    if (updated[tempAssistantMessageId]) {
                      updated[realMessageId] = updated[tempAssistantMessageId];
                      delete updated[tempAssistantMessageId];
                    }
                    return updated;
                  });
                  // Update activeChat to use real message ID before clearing streaming
                  setActiveChat(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      messages: prev.messages.map(msg => 
                        msg.id === tempAssistantMessageId
                          ? { ...msg, id: realMessageId, content: fullText }
                          : msg
                      ),
                    };
                  });
                }
                
                // Clear streaming state after a brief delay to ensure smooth transition
                setTimeout(() => {
                  setStreamingText(prev => {
                    const updated = { ...prev };
                    delete updated[tempAssistantMessageId];
                    if (realMessageId) delete updated[realMessageId];
                    return updated;
                  });
                  setHasReceivedFirstToken(prev => {
                    const updated = { ...prev };
                    delete updated[tempAssistantMessageId];
                    return updated;
                  });
                  setStreamingMessageId(null);
                }, 100);
                
                // Update with complete chat
                setActiveChat(completeChat);
                setChats(prev => {
                  const filtered = prev.filter(chat => !chat.id || chat.id === '');
                  return [completeChat, ...filtered];
                });
                router.push(`/chat?chat=${sessionId}`);
              }).catch(err => {
                console.error('Error fetching complete chat:', err);
                // Even if fetch fails, clear streaming state since we already updated the message
                setStreamingText(prev => {
                  const updated = { ...prev };
                  delete updated[tempAssistantMessageId];
                  return updated;
                });
                setHasReceivedFirstToken(prev => {
                  const updated = { ...prev };
                  delete updated[tempAssistantMessageId];
                  return updated;
                });
                setStreamingMessageId(null);
              });
            },
            // onError
            (error: Error) => {
              // Don't handle error if it was aborted
              if (abortController.signal.aborted || isStreamAbortedRef.current) {
                isStreamAbortedRef.current = false; // Reset for next stream
                return;
              }
              console.error('Stream error:', error);
              setStreamingAbortController(null);
              setStreamingText(prev => {
                const updated = { ...prev };
                delete updated[tempAssistantMessageId];
                return updated;
              });
              setHasReceivedFirstToken(prev => {
                const updated = { ...prev };
                delete updated[tempAssistantMessageId];
                return updated;
              });
              setStreamingMessageId(null);
              setError(error.message || 'Failed to stream message');
              // Revert optimistic update
              setChats(prev => prev.map(chat => 
                chat.id === finalChatToUse.id ? finalChatToUse : chat
              ));
              setActiveChat(finalChatToUse);
            },
            abortController.signal
          );
        } else {
          // Stream in existing session
          await chatApi.streamMessage(
            finalChatToUse.id,
            {
              content,
              images: permanentImageUrls.length > 0 ? permanentImageUrls : undefined,
            },
            // onToken
            (token: string, fullText: string) => {
              // Check if aborted
              if (abortController.signal.aborted) return;
              
              // Set streamingMessageId on first token to hide loader
              if (!hasReceivedFirstToken[tempAssistantMessageId]) {
                setHasReceivedFirstToken(prev => ({
                  ...prev,
                  [tempAssistantMessageId]: true,
                }));
                setStreamingMessageId(tempAssistantMessageId);
              }
              
              // Only update if the new fullText is actually longer (new content)
              // The MessageItem component handles queue tracking to prevent duplicates
              setStreamingText(prev => {
                const currentText = prev[tempAssistantMessageId] || '';
                
                // Only update if new text is longer (has new content)
                if (fullText.length > currentText.length) {
                  // Verify the new text extends the previous (not a complete replacement)
                  if (fullText.startsWith(currentText) || currentText.length === 0) {
                    return {
                      ...prev,
                      [tempAssistantMessageId]: fullText,
                    };
                  }
                }
                // If same length or shorter, don't update (prevents showing duplicate content)
                return prev;
              });
            },
            // onComplete
            (fullText: string, messageId?: string) => {
              if (abortController.signal.aborted || isStreamAbortedRef.current) {
                isStreamAbortedRef.current = false; // Reset for next stream
                return;
              }
              
              actualAssistantMessageId = messageId;
              setStreamingAbortController(null);
              
              // Update the message in place with the final text immediately
              // This ensures the text stays visible while we fetch the complete chat
              setActiveChat(prev => {
                if (!prev || prev.id !== finalChatToUse.id) return prev;
                return {
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === tempAssistantMessageId
                      ? { ...msg, content: fullText }
                      : msg
                  ),
                };
              });
              setChats(prev => prev.map(chat => {
                if (chat.id === finalChatToUse.id) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === tempAssistantMessageId
                        ? { ...msg, content: fullText }
                        : msg
                    ),
                  };
                }
                return chat;
              }));
              
              // Keep streaming text visible until we have the complete chat
              // This prevents the restart effect
              setStreamingText(prev => ({
                ...prev,
                [tempAssistantMessageId]: fullText,
              }));
              
              // Then fetch complete chat to get final state (with real message ID)
              chatApi.getSession(finalChatToUse.id).then((completeChat) => {
                // Find the real message ID in the complete chat
                const realMessage = completeChat.messages.find(msg => 
                  msg.role === 'assistant' && 
                  msg.content === fullText &&
                  msg.id !== tempAssistantMessageId
                );
                const realMessageId = realMessage?.id || actualAssistantMessageId || tempAssistantMessageId;
                
                // If we have a real message ID, update streaming text mapping
                if (realMessageId && realMessageId !== tempAssistantMessageId) {
                  setStreamingText(prev => {
                    const updated = { ...prev };
                    if (updated[tempAssistantMessageId]) {
                      updated[realMessageId] = updated[tempAssistantMessageId];
                      delete updated[tempAssistantMessageId];
                    }
                    return updated;
                  });
                  // Update activeChat to use real message ID before clearing streaming
                  setActiveChat(prev => {
                    if (!prev || prev.id !== finalChatToUse.id) return prev;
                    return {
                      ...prev,
                      messages: prev.messages.map(msg => 
                        msg.id === tempAssistantMessageId
                          ? { ...msg, id: realMessageId, content: fullText }
                          : msg
                      ),
                    };
                  });
                }
                
                // Clear streaming state after a brief delay to ensure smooth transition
                setTimeout(() => {
                  setStreamingText(prev => {
                    const updated = { ...prev };
                    delete updated[tempAssistantMessageId];
                    if (realMessageId) delete updated[realMessageId];
                    return updated;
                  });
                  setHasReceivedFirstToken(prev => {
                    const updated = { ...prev };
                    delete updated[tempAssistantMessageId];
                    return updated;
                  });
                  setStreamingMessageId(null);
                }, 100);
                
                // Update with complete chat
                setActiveChat(completeChat);
                setChats(prev => prev.map(chat => 
                  chat.id === finalChatToUse.id ? completeChat : chat
                ));
              }).catch(err => {
                console.error('Error fetching complete chat:', err);
                // Even if fetch fails, clear streaming state since we already updated the message
                setStreamingText(prev => {
                  const updated = { ...prev };
                  delete updated[tempAssistantMessageId];
                  return updated;
                });
                setHasReceivedFirstToken(prev => {
                  const updated = { ...prev };
                  delete updated[tempAssistantMessageId];
                  return updated;
                });
                setStreamingMessageId(null);
              });
            },
            // onError
            (error: Error) => {
              // Don't handle error if it was aborted
              if (abortController.signal.aborted || isStreamAbortedRef.current) {
                isStreamAbortedRef.current = false; // Reset for next stream
                return;
              }
              console.error('Stream error:', error);
              setStreamingAbortController(null);
              setStreamingText(prev => {
                const updated = { ...prev };
                delete updated[tempAssistantMessageId];
                return updated;
              });
              setStreamingMessageId(null);
              setError(error.message || 'Failed to stream message');
              // Revert optimistic update
              setChats(prev => prev.map(chat => 
                chat.id === finalChatToUse.id ? finalChatToUse : chat
              ));
              setActiveChat(finalChatToUse);
            },
            abortController.signal
          );
        }
      } catch (streamError) {
        console.error('Error starting stream:', streamError);
        setStreamingAbortController(null);
        setStreamingText(prev => {
          const updated = { ...prev };
          delete updated[tempAssistantMessageId];
          return updated;
        });
        setHasReceivedFirstToken(prev => {
          const updated = { ...prev };
          delete updated[tempAssistantMessageId];
          return updated;
        });
        setStreamingMessageId(null);
        setError('Failed to start streaming');
        // Revert optimistic update
        setChats(prev => prev.map(chat => 
          chat.id === finalChatToUse.id ? finalChatToUse : chat
        ));
        setActiveChat(finalChatToUse);
      }

      setIsSending(false);
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message;
      
      // Handle 401 Unauthorized - token might have expired
      if (axiosError?.response?.status === 401) {
        setError('Your session has expired. Please refresh the page and try again.');
        // Optionally redirect to login or refresh token
        if (typeof window !== 'undefined') {
          // You might want to trigger a token refresh here or redirect to login
          console.warn('Authentication failed - session may have expired');
        }
      } else {
        setError(errorMessage || 'Failed to send message');
      }
      
      // Revert optimistic update on error
      if (chatToUse) {
        setChats(prev => prev.map(chat => 
          chat.id === chatToUse.id ? chatToUse : chat
        ));
        setActiveChat(chatToUse);
      }
      setIsSending(false);
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

  const updateChat = useCallback(async (chatId: string, updates: { title?: string; status?: 'active' | 'archived' | 'deleted' }) => {
    try {
      setError(null);
      const updatedChat = await chatApi.updateSession(chatId, updates);
      
      // Update the chat in the list
      setChats(prev => prev.map(chat => chat.id === chatId ? updatedChat : chat));
      
      // Update active chat if it's the one being updated
      if (activeChat?.id === chatId) {
        setActiveChat(updatedChat);
      }
      
      return updatedChat;
    } catch (err: unknown) {
      console.error('Error updating chat:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to update chat session');
      throw err;
    }
  }, [activeChat]);

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

  // Stop streaming response
  const stopStreaming = useCallback(async () => {
    // Mark that stream was aborted to prevent onComplete from running
    isStreamAbortedRef.current = true;
    
    if (streamingAbortController) {
      try {
        streamingAbortController.abort();
      } catch (error) {
        // Ignore abort errors - they're expected when stopping
        console.log('Stream aborted');
      }
      setStreamingAbortController(null);
    }
    
    // Mark the last user message as stopped
    if (activeChat) {
      const messages = [...activeChat.messages];
      // Find the last user message
      let lastUserMessageIndex = -1;
      let lastUserMessageId: string | null = null;
      
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMessageIndex = i;
          lastUserMessageId = messages[i].id;
          break;
        }
      }
      
      // Mark the user message as stopped (don't delete it - user should be able to edit it)
      if (lastUserMessageIndex !== -1) {
        messages[lastUserMessageIndex] = { ...messages[lastUserMessageIndex], isStopped: true };
      }
      
      // Remove any incomplete assistant message
      const filteredMessages = messages.filter(msg => 
        !(msg.role === 'assistant' && (!msg.content || msg.content.length === 0))
      );
      
      const updatedChat = {
        ...activeChat,
        messages: filteredMessages,
      };
      
      setActiveChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === activeChat.id ? updatedChat : chat
      ));
      
      // Clear streaming state
      setStreamingText({});
      setStreamingMessageId(null);
      setHasReceivedFirstToken({});
    }
  }, [streamingAbortController, activeChat]);

  // Start editing a message - returns message data for populating input
  const startEditingMessage = useCallback((messageId: string) => {
    if (!activeChat) return null;
    const message = activeChat.messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      setEditingMessageId(messageId);
      return {
        content: message.content,
        images: message.images,
        documents: message.documents,
      };
    }
    return null;
  }, [activeChat]);

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
    isSending,
    streamingText,
    streamingMessageId,
    createNewChat,
    selectChat,
    sendMessage,
    setActiveTab,
    searchingofSpecificChat,
    cleanupEmptyChats,
    updateChat,
    deleteChat,
    deletePhoto,
    deleteDocument,
    loadMoreChats,
    textToSpeech,
    stopStreaming,
    startEditingMessage,
    editingMessageId,
    setEditingMessageId,
  };
}
