'use client';

import { Chat, MessageDocument } from '@/types/chat';
import { useRef } from 'react';
import WelcomeScreen from './WelcomeScreen';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (content: string, images?: string[], documents?: MessageDocument[], chatOverride?: Chat, editingMessageId?: string | null) => void;
  onSendMessageFromWelcome?: (content: string, images?: string[], documents?: MessageDocument[]) => void;
  isSending?: boolean;
  streamingText?: { [messageId: string]: string };
  streamingMessageId?: string | null;
  stopStreaming?: () => void;
  isRefreshingChatAfterCall?: boolean;
  onEndCall?: () => void | Promise<void>;
  startEditingMessage?: (messageId: string) => { content: string; images?: string[]; documents?: MessageDocument[]; } | null;
  editingMessageId?: string | null;
  setEditingMessageId?: (id: string | null) => void;
  onCloseSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function ChatInterface({ 
  activeChat, 
  onSendMessage, 
  onSendMessageFromWelcome, 
  isSending = false,
  streamingText = {},
  streamingMessageId = null,
  stopStreaming,
  isRefreshingChatAfterCall,
  onEndCall,
  startEditingMessage,
  editingMessageId,
  setEditingMessageId,
  onCloseSidebar,
  isSidebarOpen = false,
}: ChatInterfaceProps) {
  // This would come from useChat, but for now we create a local one that gets passed down
  // In production, we need to pass this from useChat through chat interface
  const streamedContentRef = useRef<Map<string, boolean>>(new Map());
  
  // Always show WelcomeScreen, but pass activeChat so it can show messages when chat exists
  return <WelcomeScreen 
    activeChat={activeChat} 
    onSendMessage={onSendMessageFromWelcome || onSendMessage} 
    isSending={isSending}
    streamingText={streamingText}
    streamingMessageId={streamingMessageId}
    stopStreaming={stopStreaming}
    isRefreshingChatAfterCall={isRefreshingChatAfterCall}
    onEndCall={onEndCall}
    startEditingMessage={startEditingMessage}
    editingMessageId={editingMessageId}
    setEditingMessageId={setEditingMessageId}
    onCloseSidebar={onCloseSidebar}
    streamedContentRef={streamedContentRef}
    isSidebarOpen={isSidebarOpen}
  />;
}

