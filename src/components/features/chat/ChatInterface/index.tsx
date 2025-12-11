'use client';

import { Chat, MessageDocument } from '@/types/chat';
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
  startEditingMessage?: (messageId: string) => { content: string; images?: string[]; documents?: MessageDocument[]; } | null;
  editingMessageId?: string | null;
  setEditingMessageId?: (id: string | null) => void;
}

export default function ChatInterface({ 
  activeChat, 
  onSendMessage, 
  onSendMessageFromWelcome, 
  isSending = false,
  streamingText = {},
  streamingMessageId = null,
  stopStreaming,
  startEditingMessage,
  editingMessageId,
  setEditingMessageId,
}: ChatInterfaceProps) {
  // Always show WelcomeScreen, but pass activeChat so it can show messages when chat exists
  return <WelcomeScreen 
    activeChat={activeChat} 
    onSendMessage={onSendMessageFromWelcome || onSendMessage} 
    isSending={isSending}
    streamingText={streamingText}
    streamingMessageId={streamingMessageId}
    stopStreaming={stopStreaming}
    startEditingMessage={startEditingMessage}
    editingMessageId={editingMessageId}
    setEditingMessageId={setEditingMessageId}
  />;
}

