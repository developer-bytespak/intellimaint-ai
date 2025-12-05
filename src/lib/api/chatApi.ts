import baseURL from './axios';
import { Chat, Message } from '@/types/chat';

// API Response Types
interface ApiChatSession {
  id: string;
  title: string | null;
  status: string;
  equipmentContext: string[];
  createdAt: string;
  updatedAt: string;
  messages: ApiChatMessage[];
}

interface ApiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  attachments?: ApiMessageAttachment[];
}

interface ApiMessageAttachment {
  id: string;
  attachmentType: 'image' | 'document';
  fileUrl: string;
  fileName: string | null;
  metadata: Record<string, unknown>;
}

interface ListSessionsResponse {
  sessions: ApiChatSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateSessionDto {
  title?: string;
  equipmentContext?: string[];
}

interface UpdateSessionDto {
  title?: string;
  status?: 'active' | 'archived' | 'deleted';
  equipmentContext?: string[];
}

interface CreateMessageDto {
  content: string;
  images?: string[];
}

// Transform API response to frontend Chat type
function transformSessionToChat(session: ApiChatSession): Chat {
  return {
    id: session.id,
    title: session.title || 'New Chat',
    messages: session.messages.map(transformMessageToMessage),
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
  };
}

// Transform API response to frontend Message type
function transformMessageToMessage(message: ApiChatMessage): Message {
  const images: string[] = [];

  if (message.attachments) {
    message.attachments.forEach((attachment) => {
      if (attachment.attachmentType === 'image') {
        images.push(attachment.fileUrl);
      }
      // Only images are supported, documents are not allowed
    });
  }

  return {
    id: message.id,
    content: message.content,
    role: message.role === 'system' ? 'assistant' : message.role,
    timestamp: new Date(message.createdAt),
    images: images.length > 0 ? images : undefined,
  };
}

export const chatApi = {
  // Create a new chat session
  createSession: async (dto?: CreateSessionDto): Promise<Chat> => {
    const response = await baseURL.post<{ data: ApiChatSession }>('/chat/sessions', dto || {});
    return transformSessionToChat(response.data.data);
  },

  // List all chat sessions for the current user
  listSessions: async (query?: { page?: number; limit?: number; status?: string }): Promise<{
    chats: Chat[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await baseURL.get<{ data: ListSessionsResponse }>('/chat/sessions', {
      params: query,
    });
    return {
      chats: response.data.data.sessions.map(transformSessionToChat),
      pagination: response.data.data.pagination,
    };
  },

  // Get a specific chat session with all messages
  getSession: async (sessionId: string): Promise<Chat> => {
    const response = await baseURL.get<{ data: ApiChatSession }>(`/chat/sessions/${sessionId}`);
    return transformSessionToChat(response.data.data);
  },

  // Update a chat session
  updateSession: async (sessionId: string, dto: UpdateSessionDto): Promise<Chat> => {
    const response = await baseURL.put<{ data: ApiChatSession }>(`/chat/sessions/${sessionId}`, dto);
    return transformSessionToChat(response.data.data);
  },

  // Delete a chat session
  deleteSession: async (sessionId: string): Promise<void> => {
    await baseURL.delete(`/chat/sessions/${sessionId}`);
  },

  // Create a new message in a session
  createMessage: async (sessionId: string, dto: CreateMessageDto): Promise<Message> => {
    const response = await baseURL.post<{ data: ApiChatMessage }>(
      `/chat/sessions/${sessionId}/messages`,
      dto,
    );
    return transformMessageToMessage(response.data.data);
  },
};
