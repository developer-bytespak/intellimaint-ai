import { CONFIG } from '@/constants/config';
import baseURL, { API_BASE } from './axios';
import { Chat, Message } from '@/types/chat';

// Chat API uses the Gateway backend (NEXT_PUBLIC_NEST_URL), not the Services backend
// API_BASE is already configured correctly in axios.ts to point to Gateway with /api/v1
const API_BASE_URL = API_BASE;

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

export interface StreamMessageResponse {
  token: string;
  done: boolean;
  fullText?: string;
  sessionId?: string;
  messageId?: string;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    cachedTokens?: number;
    totalTokens?: number;
  };
  aborted?: boolean;
}

// ============================================================================
// SSE IMPLEMENTATION - COMMENTED OUT (Migrated to Socket.IO)
// ============================================================================
// The following SSE parser and streaming functions have been replaced by
// Socket.IO streaming via useChatSocket hook.
// See: src/hooks/useChatSocket.ts for the new implementation.
// ============================================================================

/*
class SSEParser {
  private buffer = '';
  private eventBuffer: { [key: string]: string } = {};

  *parse(chunk: string): Generator<StreamMessageResponse> {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        if (Object.keys(this.eventBuffer).length > 0) {
          const event = this.processEvent();
          if (event) {
            yield event;
          }
          this.eventBuffer = {};
        }
        continue;
      }

      if (trimmedLine.startsWith(':')) {
        continue;
      }

      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex !== -1) {
        const field = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();

        if (this.eventBuffer[field]) {
          this.eventBuffer[field] += '\n' + value;
        } else {
          this.eventBuffer[field] = value;
        }
      }
    }
  }

  private processEvent(): StreamMessageResponse | null {
    try {
      const dataStr = this.eventBuffer['data'];
      if (!dataStr) return null;

      const data = JSON.parse(dataStr);

      return {
        token: data.token || '',
        done: data.done || false,
        fullText: data.fullText,
        sessionId: data.sessionId,
        messageId: data.messageId,
        tokenUsage: data.tokenUsage,
        aborted: data.aborted || false,
      };
    } catch (error) {
      console.error('Failed to parse SSE event:', error, this.eventBuffer);
      return null;
    }
  }

  *flush(): Generator<StreamMessageResponse> {
    if (this.buffer.trim()) {
      const trimmedBuffer = this.buffer.trim();
      if (trimmedBuffer.startsWith('data:')) {
        const value = trimmedBuffer.substring(5).trim();
        this.eventBuffer['data'] = value;
        const event = this.processEvent();
        if (event) {
          yield event;
        }
      }
    }
    this.buffer = '';
    this.eventBuffer = {};
  }
}

export async function* streamChatMessage(
  sessionId: string,
  content: string,
  images?: string[],
  token?: string,
): AsyncGenerator<StreamMessageResponse> {
  const url = `${API_BASE_URL}/chat/sessions/${sessionId}/messages/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify({
      content,
      images: images || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stream failed: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  const parser = new SSEParser();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        yield* parser.flush();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      yield* parser.parse(chunk);
    }
  } catch (error) {
    console.error('Stream reading error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export async function* streamChatMessageWithSession(
  content: string,
  images?: string[],
  token?: string,
): AsyncGenerator<StreamMessageResponse> {
  const url = `${API_BASE_URL}/chat/messages/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify({
      content,
      images: images || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stream failed: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  const parser = new SSEParser();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        yield* parser.flush();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      yield* parser.parse(chunk);
    }
  } catch (error) {
    console.error('Stream reading error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
*/

// ============================================================================
// END SSE IMPLEMENTATION
// ============================================================================

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
    console.log('[chatApi.listSessions] Fetching sessions with query:', query);
    const response = await baseURL.get<{ data: ListSessionsResponse }>('/chat/sessions', {
      params: query,
    });
    console.log('[chatApi.listSessions] Raw response:', response?.data);
    const body = response?.data?.data as ListSessionsResponse | undefined;
    if (!body || !Array.isArray(body.sessions)) {
      console.error('[chatApi.listSessions] Unexpected response shape:', response);
      throw new Error('Invalid response from listSessions: missing sessions');
    }
    
    console.log('[chatApi.listSessions] Found', body.sessions.length, 'sessions');

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

  // Delete a message from a session
  deleteMessage: async (sessionId: string, messageId: string): Promise<void> => {
    await baseURL.delete(`/chat/sessions/${sessionId}/messages/${messageId}`);
  },

  // Stop streaming and cleanup incomplete messages
  stopStream: async (sessionId: string): Promise<void> => {
    await baseURL.post(`/chat/sessions/${sessionId}/stop-stream`);
  },

  // Edit a message
  editMessage: async (
    sessionId: string,
    messageId: string,
    content: string
  ): Promise<ApiChatMessage> => {
    const response = await baseURL.patch<{ data: ApiChatMessage }>(
      `/chat/sessions/${sessionId}/messages/${messageId}`,
      { content }
    );
    return response.data.data;
  },

  // Cleanup stopped messages on page reload
  cleanupStoppedMessages: async (): Promise<{ deletedCount: number; messageIds: string[] }> => {
    const response = await baseURL.post<{ data: { deletedCount: number; messageIds: string[] } }>(
      '/chat/cleanup-stopped'
    );
    return response.data.data;
  },
};

/*
// Duplicate SSE function - Commented out (already commented above)
export async function* streamChatMessageWithSession(
  content: string,
  images?: string[],
  token?: string,
): AsyncGenerator<StreamMessageResponse> {
  const url = `${API_BASE_URL}/chat/messages/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify({
      content,
      images: images || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stream failed: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  const parser = new SSEParser();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        yield* parser.flush();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      yield* parser.parse(chunk);
    }
  } catch (error) {
    console.error('Stream reading error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
*/