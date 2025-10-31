export interface MessageDocument {
  file: File;
  url: string;
  type: 'PDF' | 'DOC';
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: string[]; // optional list of image URLs/data URLs attached to the message
  documents?: MessageDocument[]; // optional list of documents (PDF/DOC) attached to the message
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
