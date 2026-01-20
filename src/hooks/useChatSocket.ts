'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '@/constants/config';

export interface SocketStreamResponse {
  token?: string;
  done: boolean;
  stopped?: boolean;
  partialContent?: string;
  sessionId?: string;
  messageId?: string;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    cachedTokens?: number;
    totalTokens?: number;
  };
}

interface UseChatSocketOptions {
  userId: string;
  onChunk?: (chunk: SocketStreamResponse) => void;
  onError?: (error: string) => void;
  onStopped?: (reason: string) => void;
}


// Use dedicated GATEWAY_URL for Socket.IO connections (NestJS server)
const GATEWAY_URL = CONFIG.GATEWAY_URL || CONFIG.API_URL || 'http://localhost:3000';

// console.log('NestJS Gateway URL:', GATEWAY_URL);


export function useChatSocket(options: UseChatSocketOptions) {
  const { userId, onChunk, onError, onStopped } = options;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const isStreamingRef = useRef(false);
  const streamingTextRef = useRef('');
  const onChunkRef = useRef(onChunk);
  const onErrorRef = useRef(onError);
  const onStoppedRef = useRef(onStopped);
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef(userId);

  useEffect(() => {
    onChunkRef.current = onChunk;
    onErrorRef.current = onError;
    onStoppedRef.current = onStopped;
  }, [onChunk, onError, onStopped]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    streamingTextRef.current = streamingText;
  }, [streamingText]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    if (!userId) {
      console.warn('⚠️ No userId provided, skipping socket connection');
      return;
    }

    console.log('🔌 Initializing Socket.IO connection to:', `${GATEWAY_URL}/chat`);

    // Ensure only one active connection and avoid duplicate listeners/streams
    if (socketRef.current) {
      try {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      } catch {}
    }

    const socketInstance = io(`${GATEWAY_URL}/chat`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true,
      autoConnect: true,
      // Do not force new connection on every mount; helps prevent duplicates
      forceNew: false,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id);
      console.log('   Transport:', socketInstance.io.engine.transport.name);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('connected', (data) => {
      console.log('✅ Server acknowledgment:', data);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
      setIsStreaming(false);
      isStreamingRef.current = false;
    });

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Socket.IO connection error:', err);
      console.error('   Error message:', err.message);
      const message = err.message || String(err);
      setError(`Connection error: ${message}`);
      setIsConnected(false);
    });

    socketInstance.on('server-ack', (data) => {
      console.log('✅ Server acknowledged event:', data);
    });

    socketInstance.on('pipeline-chunk', (data: any) => {
      console.log('📨 Received pipeline chunk:', { 
        stage: data.stage,
        hasToken: !!data.token,
        tokenLength: data.token?.length,
        done: data.done,
        sessionId: data.sessionId, // Log sessionId
        messageId: data.messageId,
        metadata: !!data.metadata,
      });

      // Handle pipeline stages
      if (data.stage === 'image-analysis') {
        console.log('🖼️ Image analysis stage');
      } else if (data.stage === 'embedding') {
        console.log('🧠 Embedding generated');
      } else if (data.stage === 'retrieval') {
        console.log('📚 Knowledge chunks retrieved:', data.metadata?.chunkCount);
      } else if (data.stage === 'context') {
        console.log('📋 Context prepared');
      } else if (data.stage === 'llm-generation' && data.token) {
        // Append token for LLM response
        setStreamingText(prev => prev + data.token);
        
        if (onChunkRef.current) {
          onChunkRef.current({ token: data.token, done: false } as SocketStreamResponse);
        }
      } else if (data.stage === 'complete') {
        // Stream completed successfully
        console.log('✅ Pipeline completed with messageId:', data.messageId, 'sessionId:', data.sessionId);
        setIsStreaming(false);
        isStreamingRef.current = false;
        
        if (onChunkRef.current) {
          onChunkRef.current({
            done: true,
            sessionId: data.sessionId, // CRITICAL: Pass sessionId for new chat sessions
            messageId: data.messageId,
            tokenUsage: data.tokenUsage,
          } as SocketStreamResponse);
        }
      } else if (data.stage === 'error') {
        // Error occurred in pipeline
        console.error('❌ Pipeline error:', data.errorMessage);
        setError(data.errorMessage || 'Pipeline error');
        setIsStreaming(false);
        isStreamingRef.current = false;
        
        if (onErrorRef.current) {
          onErrorRef.current(data.errorMessage || 'Pipeline error');
        }
      }
    });

    socketInstance.on('pipeline-error', (data: { error: string }) => {
      console.error('❌ Pipeline error event:', data.error);
      setError(data.error);
      setIsStreaming(false);
      isStreamingRef.current = false;
      
      if (onErrorRef.current) {
        onErrorRef.current(data.error);
      }
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Disconnecting socket');
      try {
        socketInstance.removeAllListeners();
      } catch {}
      socketInstance.disconnect();
    };
  }, [userId]);

  const sendMessage = useCallback(
    (sessionId: string, content: string, images?: string[]) => {
      const currentUserId = userIdRef.current;
      console.log('📤 sendMessage called:', { sessionId, contentLength: content?.length, imagesCount: images?.length, userId: currentUserId });

      if (!currentUserId || currentUserId === '') {
        const errorMsg = 'User ID required - user not loaded yet';
        console.error('❌', errorMsg);
        setError(errorMsg);
        return;
      }

      if (!socketRef.current?.connected) {
        const errorMsg = 'Socket not connected';
        console.error('❌', errorMsg);
        setError(errorMsg);
        return;
      }

      if (!sessionId) {
        const errorMsg = 'Session ID required';
        console.error('❌', errorMsg);
        setError(errorMsg);
        return;
      }

      setStreamingText('');
      streamingTextRef.current = '';
      setError(null);
      setIsStreaming(true);
      isStreamingRef.current = true;

      const payload = {
        sessionId,
        content,
        images: images || [],
        userId: currentUserId,
      };

      console.log('📤 Emitting stream-pipeline-message:', payload);

      socketRef.current.emit('stream-pipeline-message', payload, (ack: any) => {
        console.log('✅ Emit acknowledged by server:', ack);
      });
    },
    []
  );

  const sendMessageNew = useCallback(
    (content: string, images?: string[]) => {
      const currentUserId = userIdRef.current;
      console.log('📤 sendMessageNew called:', { contentLength: content?.length, imagesCount: images?.length, userId: currentUserId });

      if (!currentUserId || currentUserId === '') {
        const errorMsg = 'User ID required - user not loaded yet';
        console.error('❌', errorMsg);
        setError(errorMsg);
        return;
      }

      if (!socketRef.current?.connected) {
        const errorMsg = 'Socket not connected';
        console.error('❌', errorMsg);
        setError(errorMsg);
        return;
      }

      setStreamingText('');
      streamingTextRef.current = '';
      setError(null);
      setIsStreaming(true);
      isStreamingRef.current = true;

      const payload = {
        content,
        images: images || [],
        userId: currentUserId,
      };

      console.log('📤 Emitting stream-pipeline-message-new:', payload);

      socketRef.current.emit('stream-pipeline-message-new', payload, (ack: any) => {
        console.log('✅ Emit acknowledged by server:', ack);
      });
    },
    []
  );

  const stopStreaming = useCallback(() => {
    console.log('⏹️ stopStreaming called');

    if (socketRef.current?.connected && isStreamingRef.current) {
      socketRef.current.emit('stop-pipeline');
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, []);

  const resetStreamingText = useCallback(() => {
    setStreamingText('');
    streamingTextRef.current = '';
  }, []);

  return {
    sendMessage,
    sendMessageNew,
    stopStreaming,
    resetStreamingText,
    streamingText,
    isStreaming,
    isConnected,
    error,
    socket: socketRef.current,
  };
}
