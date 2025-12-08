'use client';

import { Chat, MessageDocument } from '@/types/chat';
import WelcomeScreen from './WelcomeScreen';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (content: string, images?: string[], documents?: MessageDocument[]) => void;
  onSendMessageFromWelcome?: (content: string, images?: string[], documents?: MessageDocument[]) => void;
  updateMessageUrls?: (chatId: string, messageId: string, images?: string[], documents?: MessageDocument[]) => void;
}

export default function ChatInterface({ activeChat, onSendMessage, onSendMessageFromWelcome, updateMessageUrls }: ChatInterfaceProps) {
  // Always show WelcomeScreen, but pass activeChat so it can show messages when chat exists
  return <WelcomeScreen activeChat={activeChat} onSendMessage={onSendMessageFromWelcome || onSendMessage} updateMessageUrls={updateMessageUrls} />;
}