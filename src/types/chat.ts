export interface MessageDocument {
  file: File;
  url: string;
  type: 'PDF' | 'DOC' | 'AUDIO';
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  // Stable UI key to prevent remounts across temp→real ID handoff
  stableKey?: string;
  images?: string[]; // optional list of image URLs/data URLs attached to the message
  documents?: MessageDocument[]; // optional list of documents (PDF/DOC) attached to the message
  audioDocument?: MessageDocument; // optional audio document attached to the message
  isStopped?: boolean; // true if user stopped the response before it was sent to LLM
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

export interface ImageUploadState {
  previewUrl: string; // Blob URL for preview
  uploadedUrl?: string; // Permanent URL after upload
  status: 'uploading' | 'completed' | 'error';
  progress?: number; // 0-100
  error?: string;
}