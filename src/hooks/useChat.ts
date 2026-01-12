'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chat, Message, MessageDocument, TabType, Photo, Document } from '@/types/chat';
import { mockPhotos, mockDocuments, getPhotoGroups } from '@/data/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { chatApi } from '@/lib/api/chatApi';
import { API_BASE } from '@/lib/api/axios';
// SSE imports - COMMENTED OUT (Migrated to Socket.IO)
// import { streamChatMessage, streamChatMessageWithSession } from '@/lib/api/chatApi';
import { useUser } from '@/hooks/useUser';
import { useChatSocket, SocketStreamResponse } from '@/hooks/useChatSocket';

export let chatstate = false

// Use the properly configured API_BASE which already includes /api/v1
const API_BASE_URL = API_BASE.replace(/\/api\/v1\/?$/, ''); // Remove /api/v1 since we'll add it in specific endpoints

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
  const [chatLoadingState, setChatLoadingState] = useState<boolean>(false); // Track loading state per chat
  // Track if current stream was aborted to prevent onComplete from running
  const isStreamAbortedRef = useRef<boolean>(false);
  // Track streaming completion for smooth handoff
  const streamingCompleteRef = useRef<{ [messageId: string]: boolean }>({});
  const searchParams = useSearchParams();
  const activeChatRef = useRef<Chat | null>(null);
  const chatsRef = useRef<Chat[]>([]);
  // console.log('useChat hook initialized, chatstate:',chatstate);

  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  
  // Keep user ref in sync for use in callbacks
  const userRef = useRef(user);
  const isUserLoadingRef = useRef(isUserLoading);
  
  useEffect(() => {
    userRef.current = user;
    isUserLoadingRef.current = isUserLoading;
  }, [user, isUserLoading]);

  // Track current streaming message ID for socket callbacks
  const currentStreamingMessageIdRef = useRef<string | null>(null);

  // Socket.IO hook for streaming - only initialize when user is loaded and valid
  const shouldInitializeSocket = !isUserLoading && !!user?.id;

  // Ref to store streaming result for sendMessage completion (avoid duplicate listeners)
  const streamingResultRef = useRef<{ sessionId?: string; messageId?: string; stopped?: boolean; partialContent?: string } | null>(null);
  const streamingCompleteRef_local = useRef<boolean>(false);

  const socketHook = useChatSocket({
    userId: shouldInitializeSocket && user?.id ? user.id : '', // Only connect with valid userId when ready
    onChunk: useCallback((chunk: SocketStreamResponse) => {
      const tempMessageId = currentStreamingMessageIdRef.current;
      if (!tempMessageId) return;

      if (chunk.done) {
        // Streaming complete - store result for sendMessage to retrieve
        streamingResultRef.current = {
          sessionId: chunk.sessionId,
          messageId: chunk.messageId,
          stopped: chunk.stopped,
          partialContent: chunk.partialContent,
        };
        streamingCompleteRef_local.current = true;
        return;
      }

      if (chunk.token) {
        // Append token to streaming text
        setStreamingText(prev => ({
          ...prev,
          [tempMessageId]: (prev[tempMessageId] || '') + chunk.token,
        }));

        // Set streamingMessageId on first token
        if (!hasReceivedFirstToken[tempMessageId]) {
          setHasReceivedFirstToken(prev => ({
            ...prev,
            [tempMessageId]: true,
          }));
          setStreamingMessageId(tempMessageId);
        }
      }
    }, [hasReceivedFirstToken]),
    onError: useCallback((error: string) => {
      console.error('Socket streaming error:', error);
      setError(error);
      setIsSending(false);
      setStreamingMessageId(null);
    }, []),
    onStopped: useCallback((reason: string) => {
      console.log('Streaming stopped:', reason);
      const tempMessageId = currentStreamingMessageIdRef.current;
      if (tempMessageId) {
        setStreamingText(prev => {
          const updated = { ...prev };
          delete updated[tempMessageId];
          return updated;
        });
      }
      setStreamingMessageId(null);
      setIsSending(false);
    }, []),
  });

  // Keep refs in sync with state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

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
    // Check if user is available - if loading, wait briefly for it to load
    // Use refs to get latest values during the wait
    if (isUserLoadingRef.current || !userRef.current) {
      // Wait for user to load (max 3 seconds)
      let attempts = 0;
      const maxAttempts = 30; // 30 * 100ms = 3 seconds
      while ((isUserLoadingRef.current || !userRef.current) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }
    
    // Get latest user from ref
    const currentUser = userRef.current;
    
    // Final check - if still no user, throw error
    if (!currentUser?.id) {
      console.error('User not available for image upload:', { 
        isUserLoading: isUserLoadingRef.current, 
        user: currentUser 
      });
      throw new Error('User ID not available. Please ensure you are logged in and try again.');
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
      formData.append('userId', currentUser.id!);

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
  }, []); // No dependencies - using refs for user state

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
      // Don't load sessions if user is still loading or not available
      if (isUserLoading || !user?.id) {
        console.log('[useChat] Skipping loadSessions - user not ready:', { isUserLoading, userId: user?.id });
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        setChatPage(1);
        
        console.log('[useChat] Loading chat sessions for user:', user.id);
        
        // Check if this is a page reload
        const isPageReload = sessionStorage.getItem('chatPageReloaded') === 'true';
        
        if (isPageReload && user?.id) {
          // Cleanup stopped messages that were not edited
          try {
            await chatApi.cleanupStoppedMessages();
            console.log('✅ Cleaned up stopped messages on reload');
          } catch (cleanupError) {
            console.error('Failed to cleanup stopped messages:', cleanupError);
          }
          // Clear the flag after cleanup
          sessionStorage.removeItem('chatPageReloaded');
        }
        
        const result = await chatApi.listSessions({ page: 1, limit: 10 });
        
        console.log('[useChat] Loaded sessions:', result.chats.length, 'chats');
        setChats(result.chats);
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
    
    // Set flag for next reload detection
    const handleBeforeUnload = () => {
      sessionStorage.setItem('chatPageReloaded', 'true');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.id, isUserLoading]);

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
    chatstate=true
    // console.log('useChat: Checking URL params for chat ID',chatstate);
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
          
          // Update active chat
          setActiveChat(prev => {
            if (prev?.id === chatId) {
              return prev; // Already set, don't override
            }
            return fetchedChat;
          });
          
          // Update or add to chats list
          setChats(prev => {
            const exists = prev.find(c => c.id === fetchedChat.id);
            if (exists) {
              // Update existing chat with full session data
              return prev.map(c => c.id === fetchedChat.id ? fetchedChat : c);
            } else {
              // Add new chat to the list
              return [fetchedChat, ...prev];
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
      setChatLoadingState(false);
      chatstate=false
      
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
    
    // Remove any existing empty chats (chats with no ID) but keep all chats with IDs
    // This ensures previous chats remain visible when creating a new chat
    setChats(prev => {
      // Filter out only the old empty chats (no ID), keep all chats with real IDs
      const filtered = prev.filter(chat => chat.id && chat.id !== '');
      // Add the new empty chat at the beginning
      return [newChat, ...filtered];
    });
    
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
      // Clean up any empty chats (except the one being selected) when selecting a real chat
      if (chat.id && chat.id !== '') {
        setChats(prev => prev.filter(c => c.id && c.id !== '' || c.id === chat.id));
      }
      
      // If it's a new chat (no ID), just set it as active without fetching
      if (!chat.id || chat.id === '') {
        setActiveChat(chat);
        setActiveTab('chats');
        return;
      }
      
      // Always fetch full session from API to ensure we have all messages and attachments
      // The listSessions endpoint only returns the last message, so we need full session
      const fullChat = await chatApi.getSession(chat.id);
      
      setActiveChat(fullChat);
      setChats(prev => prev.map(c => c.id === fullChat.id ? fullChat : c));
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
    // Wait for user to be loaded before sending
    if (isUserLoading || !user || !user.id) {
      console.error('❌ Cannot send message: User not loaded yet', { isUserLoading, hasUser: !!user, hasUserId: !!user?.id });
      setError('Please wait for user to load...');
      return;
    }

    // Ensure socket is connected before attempting to stream
    if (!socketHook.isConnected) {
      console.error('❌ Cannot send message: Socket not connected');
      setError('Connection not ready. Please wait...');
      return;
    }

    const chatToUse = chatOverride || activeChat;
    if (!chatToUse) {
      // If no active chat, create a new one first (local only)
      const newChat = createNewChat();
      return sendMessage(content, images, documents, newChat, editingMessageIdParam);
    }

    try {
      setError(null);
      setIsSending(true);

      // If editing, update the old message and delete subsequent messages
      let finalChatToUse = chatToUse;
      if (editingMessageIdParam && chatToUse) {
        const messageIndex = chatToUse.messages.findIndex(m => m.id === editingMessageIdParam);
        if (messageIndex !== -1) {
          const messageToEdit = chatToUse.messages[messageIndex];
          
          // Edit on backend if it's a real message (not temp)
          if (chatToUse.id && messageToEdit.id && !messageToEdit.id.startsWith('temp-')) {
            try {
              // Call edit endpoint which will edit the message and delete subsequent ones
              await chatApi.editMessage(chatToUse.id, messageToEdit.id, content);
            } catch (error) {
              console.error('Error editing message:', error);
              // Continue with frontend cleanup even if backend edit fails
            }
          }
          
          // Update the edited message and remove subsequent ones
          const updatedMessages = [
            ...chatToUse.messages.slice(0, messageIndex),
            {
              ...messageToEdit,
              content,
              isStopped: false, // Clear stopped state
            },
          ];
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

      // When editing, the message was already updated above - don't add a new one
      // When sending new message, create optimistic message for immediate display
      let optimisticChat: Chat;
      if (editingMessageIdParam) {
        // Editing - use the already-updated finalChatToUse with the edited message
        optimisticChat = {
          ...finalChatToUse,
          updatedAt: new Date(),
        };
      } else {
        // New message - create optimistic message and append
        const optimisticMessage: Message = {
          id: `temp-msg-${Date.now()}`,
          content,
          role: 'user',
          timestamp: new Date(),
          images: permanentImageUrls.length > 0 ? permanentImageUrls : undefined,
          isStopped: false,
        };

        optimisticChat = {
          ...finalChatToUse,
          messages: [...finalChatToUse.messages, optimisticMessage],
          updatedAt: new Date(),
          title: finalChatToUse.title === 'New Chat' && finalChatToUse.messages.length === 0
            ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
            : finalChatToUse.title,
        };
      }

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

      // Add optimistic assistant message only if not editing
      // When editing, the message is already updated and we'll refetch the chat
      const chatWithAssistant = editingMessageIdParam
        ? optimisticChat
        : {
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

      // Set current streaming message ID for socket callbacks
      currentStreamingMessageIdRef.current = tempAssistantMessageId;

      // Create abort controller for streaming
      const abortController = new AbortController();
      setStreamingAbortController(abortController);
      // Reset abort flag for new stream
      isStreamAbortedRef.current = false;

      // No artificial thinking delay: call API immediately
      // The user can still stop the stream via `stopStreaming()` which will abort
      // the controller and instruct the backend to cancel the request.

      // If editing, refetch the chat to get the updated state from backend
      if (editingMessageIdParam && chatToUse.id) {
        try {
          const refreshedChat = await chatApi.getSession(chatToUse.id);
          setActiveChat(refreshedChat);
          setChats(prev => prev.map(chat => 
            chat.id === chatToUse.id ? refreshedChat : chat
          ));
        } catch (error) {
          console.error('Error refetching chat after edit:', error);
        }
        setIsSending(false);
        setStreamingAbortController(null);
        return;
      }

      // Stream message via Socket.IO
      let actualSessionId: string;
      let actualAssistantMessageId: string | undefined;

      // Reset completion tracking for this message
      streamingCompleteRef_local.current = false;
      streamingResultRef.current = null;

      // Setup promise to wait for streaming completion
      // Note: We rely on onChunk callback to update streamingText AND set streamingResultRef
      // This promise just waits for the done signal via polling
      const streamingPromise = new Promise<{ sessionId?: string; messageId?: string; stopped?: boolean; partialContent?: string }>((resolve, reject) => {
        const maxWaitTime = 120000; // 2 minutes max
        const startTime = Date.now();
        
        // Poll for completion instead of adding listeners (avoids duplicate listeners on socket)
        const pollInterval = setInterval(() => {
          // Check if streaming is marked as complete
          if (streamingCompleteRef_local.current && streamingResultRef.current) {
            clearInterval(pollInterval);
            resolve(streamingResultRef.current);
            return;
          }

          // Timeout after max wait
          if (Date.now() - startTime > maxWaitTime) {
            clearInterval(pollInterval);
            reject(new Error('Streaming timeout - no response from server'));
            return;
          }
        }, 50); // Poll every 50ms

        // Also listen for error on socket (only once to avoid duplicates)
        const errorHandler = (data: { error: string }) => {
          clearInterval(pollInterval);
          socketHook.socket?.off('message-error', errorHandler);
          reject(new Error(data.error));
        };

        socketHook.socket?.once('message-error', errorHandler);
      });

      try {
        // Start socket streaming
        if (isNewChat) {
          socketHook.sendMessageNew(content, permanentImageUrls.length > 0 ? permanentImageUrls : undefined);
        } else {
          socketHook.sendMessage(finalChatToUse.id, content, permanentImageUrls.length > 0 ? permanentImageUrls : undefined);
        }

        // Wait for streaming to complete
        const result = await streamingPromise;
        actualSessionId = result.sessionId || finalChatToUse.id;
        actualAssistantMessageId = result.messageId;

        setStreamingAbortController(null);
        
        // Mark streaming as complete
        streamingCompleteRef.current[tempAssistantMessageId] = true;
        
        // Get final text from streaming state or use partial content from server
        const finalText = result.partialContent || streamingText[tempAssistantMessageId] || '';

        // If stream was stopped, mark both user and assistant messages as stopped
        const wasStopped = result.stopped || false;

        // Update assistant message with final content and stopped flag
        // Also mark the last user message as stopped so it can be edited
        setActiveChat(prev => {
          if (!prev) return prev;
          const lastUserIndex = Math.max(0, prev.messages.length - 2);
          return {
            ...prev,
            messages: prev.messages.map((msg, idx) => {
              // Mark assistant message as stopped
              if (msg.id === tempAssistantMessageId) {
                return { ...msg, content: finalText, isStopped: wasStopped };
              }
              // Mark the last user message as stopped (for edit button)
              if (wasStopped && msg.role === 'user' && idx === lastUserIndex) {
                return { ...msg, isStopped: true };
              }
              return msg;
            }),
          };
        });
        setChats(prev => prev.map(chat => {
          if (chat.id === finalChatToUse.id || (!chat.id && finalChatToUse.id === '')) {
            const lastUserIndexChat = Math.max(0, chat.messages.length - 2);
            return {
              ...chat,
              messages: chat.messages.map((msg, idx) => {
                // Mark assistant message as stopped
                if (msg.id === tempAssistantMessageId) {
                  return { ...msg, content: finalText, isStopped: wasStopped };
                }
                // Mark the last user message as stopped (for edit button)
                if (wasStopped && msg.role === 'user' && idx === lastUserIndexChat) {
                  return { ...msg, isStopped: true };
                }
                return msg;
              }),
            };
          }
          return chat;
        }));
        
        // Fetch complete chat for final state
        try {
          const completeChat = await chatApi.getSession(actualSessionId);
          
          // Find real message ID
          const realMessage = completeChat.messages.find(msg => 
            msg.role === 'assistant' && 
            msg.content === finalText &&
            msg.id !== tempAssistantMessageId
          );
          const realMessageId = realMessage?.id || actualAssistantMessageId || tempAssistantMessageId;
          
          // If stopped, mark the messages in complete chat with isStopped flag
          if (wasStopped) {
            completeChat.messages = completeChat.messages.map((msg, idx) => {
              // Mark assistant message as stopped
              if (msg.id === realMessageId || msg.content === finalText) {
                return { ...msg, isStopped: true };
              }
              // Mark the last user message as stopped (for edit button)
              if (msg.role === 'user' && idx === completeChat.messages.length - 2) {
                return { ...msg, isStopped: true };
              }
              return msg;
            });
          }
          
          // Update with complete chat FIRST
          setActiveChat(completeChat);
          if (isNewChat) {
            setChats(prev => {
              // Remove only the old empty chat (no ID) and add the completed one
              const filtered = prev.filter(chat => chat.id && chat.id !== '');
              return [completeChat, ...filtered];
            });
          } else {
            setChats(prev => prev.map(chat => 
              chat.id === actualSessionId ? completeChat : chat
            ));
          }
          
          // THEN clear streaming state after React has updated
          setTimeout(() => {
            setStreamingText(prev => {
              const updated = { ...prev };
              delete updated[tempAssistantMessageId];
              delete updated[realMessageId];
              return updated;
            });
            setHasReceivedFirstToken(prev => {
              const updated = { ...prev };
              delete updated[tempAssistantMessageId];
              return updated;
            });
            setStreamingMessageId(null);
            streamingCompleteRef.current = {};
            currentStreamingMessageIdRef.current = null;
          }, 200);
          
          if (isNewChat) {
            router.push(`/chat?chat=${actualSessionId}`);
          }
        } catch (err) {
          console.error('Error fetching complete chat:', err);
          // Clear streaming state even on error
          setTimeout(() => {
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
            streamingCompleteRef.current = {};
            currentStreamingMessageIdRef.current = null;
          }, 200);
        }
      } catch (streamError) {
        console.error('Error during streaming:', streamError);
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
        streamingCompleteRef.current = {};
        currentStreamingMessageIdRef.current = null;
        
        const errorMessage = streamError instanceof Error ? streamError.message : 'Failed to stream message';
        setError(errorMessage);
        
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
  }, [activeChat, createNewChat, user, isUserLoading, uploadImages, socketHook]);

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
    // 1) Use Socket.IO to stop streaming on backend (aborts Gemini request immediately)
    socketHook.stopStreaming();
    
    // 2) Immediately abort local controller and flip UI
    isStreamAbortedRef.current = true;
    
    if (streamingAbortController) {
      try {
        streamingAbortController.abort();
      } catch (error) {
        console.log('Stream aborted');
      }
      setStreamingAbortController(null);
    }
    
    // 3) Immediately clear streaming state and flip UI to allow editing
    setStreamingText({});
    setStreamingMessageId(null);
    setHasReceivedFirstToken({});
    setIsSending(false);
    currentStreamingMessageIdRef.current = null;
    
    // 4) Mark the last user message as stopped
    if (activeChat) {
      const messages = [...activeChat.messages];
      // Find the last user message
      let lastUserMessageIndex = -1;
      
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMessageIndex = i;
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
      // DEBUG: Log messages after stopping stream to verify isStopped flag
      try {
        // eslint-disable-next-line no-console
        console.log('stopStreaming: updated messages', updatedChat.messages.map(m => ({ id: m.id, role: m.role, isStopped: m.isStopped }))); 
      } catch (e) {
        // ignore
      }
    }
  }, [streamingAbortController, activeChat, socketHook]);

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

  const refreshChatFromUrl = useCallback(async () => {
    const chatId = searchParams.get('chat');
    if (!chatId) return null;

    try {
      setError(null);
      const refreshedChat = await chatApi.getSession(chatId);

      setActiveChat(refreshedChat);
      setChats(prev => {
        const existingIndex = prev.findIndex(c => c.id === chatId);
        if (existingIndex === -1) return [refreshedChat, ...prev];

        const next = [...prev];
        next[existingIndex] = refreshedChat;
        return next;
      });

      return refreshedChat;
    } catch (err: unknown) {
      console.error('Error refreshing chat session:', err);
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message;

      if (axiosError?.response?.status === 401) {
        setError('Your session has expired. Please refresh the page to continue.');
      } else {
        setError(errorMessage || 'Failed to refresh chat session');
      }

      return null;
    }
  }, [searchParams]);

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
    isSocketConnected: socketHook.isConnected, // Socket.IO connection status
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
    refreshChatFromUrl,
    startEditingMessage,
    editingMessageId,
    setEditingMessageId,
    chatLoadingState,
  };
}
