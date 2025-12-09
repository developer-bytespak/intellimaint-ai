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
    // Defensive checks: ensure the backend returned the expected shape
    const body = response?.data?.data as ListSessionsResponse | undefined;
    if (!body || !Array.isArray(body.sessions)) {
      console.error('Unexpected listSessions response shape:', response);
      // Throw a clear error so callers can handle it instead of crashing on undefined
      throw new Error('Invalid response from listSessions: missing sessions');
    }

    return {
      chats: body.sessions.map(transformSessionToChat),
      pagination: body.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
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
  createMessage: async (sessionId: string, dto: CreateMessageDto): Promise<{
    userMessage: Message;
    assistantMessage: Message;
  }> => {
    const response = await baseURL.post<{ data: { userMessage: ApiChatMessage; assistantMessage: ApiChatMessage } }>(
      `/chat/sessions/${sessionId}/messages`,
      dto,
    );
    return {
      userMessage: transformMessageToMessage(response.data.data.userMessage),
      assistantMessage: transformMessageToMessage(response.data.data.assistantMessage),
    };
  },

  // Create a new message with a new session (for first message)
  createMessageWithSession: async (dto: CreateMessageDto): Promise<{
    chat: Chat;
    message: Message;
  }> => {
    const response = await baseURL.post<{ data: { session: ApiChatSession; message: ApiChatMessage } }>(
      '/chat/messages',
      dto,
    );
    return {
      chat: transformSessionToChat(response.data.data.session),
      message: transformMessageToMessage(response.data.data.message),
    };
  },

  // Stream message creation in existing session (SSE)
  streamMessage: async (
    sessionId: string,
    dto: CreateMessageDto,
    onToken: (token: string, fullText: string) => void,
    onComplete: (fullText: string, messageId?: string) => void,
    onError: (error: Error) => void,
    abortSignal?: AbortSignal,
  ): Promise<void> => {
    // Get API base URL from axios instance
    const API_BASE = baseURL.defaults.baseURL;
    const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(dto),
      signal: abortSignal, // Add abort signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      onError(new Error(errorData.message || 'Stream failed'));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('Response body is not readable'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        // Check if aborted before reading
        if (abortSignal?.aborted) {
          return; // Silently return if aborted
        }
        
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          // Check if aborted during processing
          if (abortSignal?.aborted) {
            return; // Silently return if aborted
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(new Error(data.error));
                return;
              }
              if (data.token && !data.done) {
                onToken(data.token, data.fullText || '');
              }
              if (data.done) {
                onComplete(data.fullText || '', data.messageId);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      // Don't call onError if it was aborted
      if (abortSignal?.aborted) {
        return; // Silently return if aborted
      }
      onError(error instanceof Error ? error : new Error('Stream read error'));
    }
  },

  // Stream message creation with new session (SSE)
  streamMessageWithSession: async (
    dto: CreateMessageDto,
    onToken: (token: string, fullText: string, sessionId?: string) => void,
    onComplete: (fullText: string, sessionId: string, messageId?: string) => void,
    onError: (error: Error) => void,
    abortSignal?: AbortSignal,
  ): Promise<void> => {
    // Get API base URL from axios instance
    const API_BASE = baseURL.defaults.baseURL;
    const response = await fetch(`${API_BASE}/chat/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dto),
      signal: abortSignal, // Add abort signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      onError(new Error(errorData.message || 'Stream failed'));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('Response body is not readable'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let sessionId: string | undefined;

    try {
      while (true) {
        // Check if aborted before reading
        if (abortSignal?.aborted) {
          return; // Silently return if aborted
        }
        
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Check if aborted during processing
          if (abortSignal?.aborted) {
            return; // Silently return if aborted
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(new Error(data.error));
                return;
              }
              if (data.sessionId) {
                sessionId = data.sessionId;
              }
              if (data.token && !data.done) {
                onToken(data.token, data.fullText || '', sessionId);
              }
              if (data.done) {
                onComplete(data.fullText || '', sessionId || '', data.messageId);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      // Don't call onError if it was aborted
      if (abortSignal?.aborted) {
        return; // Silently return if aborted
      }
      onError(error instanceof Error ? error : new Error('Stream read error'));
    }
  },

  // Delete a message from a session
  deleteMessage: async (sessionId: string, messageId: string): Promise<void> => {
    await baseURL.delete(`/chat/sessions/${sessionId}/messages/${messageId}`);
  },
};
