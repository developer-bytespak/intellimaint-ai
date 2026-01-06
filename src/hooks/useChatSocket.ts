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

    const socketInstance = io(`${GATEWAY_URL}/chat`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true,
      autoConnect: true,
      forceNew: true,
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

    socketInstance.on('message-chunk', (data: SocketStreamResponse) => {
      console.log('📨 Received chunk:', { 
        done: data.done,
        stopped: data.stopped,
        hasToken: !!data.token,
        tokenLength: data.token?.length,
        hasPartialContent: !!data.partialContent,
        sessionId: data.sessionId,
        messageId: data.messageId
      });

      if (data.done) {
        if (data.stopped) {
          console.log('⏹️ Stream stopped with partial content');
        } else {
          console.log('✅ Stream completed');
        }
        setIsStreaming(false);
        isStreamingRef.current = false;
        
        if (onChunkRef.current) {
          onChunkRef.current(data);
        }
      } else if (data.token) {
        setStreamingText(prev => prev + data.token);
        
        if (onChunkRef.current) {
          onChunkRef.current(data);
        }
      }
    });

    socketInstance.on('message-stopped', (data: { reason: string }) => {
      console.log('⏹️ Stream stopped:', data.reason);
      setIsStreaming(false);
      isStreamingRef.current = false;
      
      if (onStoppedRef.current) {
        onStoppedRef.current(data.reason);
      }
    });

    socketInstance.on('message-error', (data: { error: string }) => {
      console.error('❌ Stream error:', data.error);
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

      console.log('📤 Emitting stream-message:', payload);

      socketRef.current.emit('stream-message', payload, (ack: any) => {
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

      console.log('📤 Emitting stream-message-new:', payload);

      socketRef.current.emit('stream-message-new', payload, (ack: any) => {
        console.log('✅ Emit acknowledged by server:', ack);
      });
    },
    []
  );

  const stopStreaming = useCallback(() => {
    console.log('⏹️ stopStreaming called');

    if (socketRef.current?.connected && isStreamingRef.current) {
      socketRef.current.emit('stop-stream');
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
