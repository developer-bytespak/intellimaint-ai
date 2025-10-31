'use client';

import { Chat, MessageDocument } from '@/types/chat';
import WelcomeScreen from './WelcomeScreen';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (content: string, images?: string[], documents?: MessageDocument[]) => void;
}

export default function ChatInterface({ activeChat, onSendMessage }: ChatInterfaceProps) {
  if (!activeChat) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full overflow-hidden max-w-full min-w-0">
      <MessageList activeChat={activeChat} />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}

