export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  url: string;
  filename: string;
  date: Date;
  size: number;
}

export interface Document {
  id: string;
  title: string;
  type: 'PDF' | 'PPT' | 'DOC';
  size: string;
  date: Date;
  url: string;
}

export interface PhotoGroup {
  month: string;
  year: number;
  photos: Photo[];
}

export type TabType = 'chats' | 'photos' | 'documents';
