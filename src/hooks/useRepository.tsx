'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import baseURL from '@/lib/api/axios';
import { put } from '@vercel/blob';

export interface RepositoryDocument {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  uploadedAt: string;
  createdAt: string;
}

export interface UploadUrlResponse {
  fileId: string;
  blobPath: string;
  fileName: string;
  contentType: string;
}

export interface CreateDocumentRequest {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  blobPath: string;
}

export interface ListDocumentsResponse {
  documents: RepositoryDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useRepository() {
  const queryClient = useQueryClient();

  // Get upload URLs
  const getUploadUrls = useMutation({
    mutationFn: async (files: { fileName: string; fileSize: number; contentType: string }[]) => {
      const res = await baseURL.post('/repository/upload-urls', { files });
      return res.data.data.uploadUrls as UploadUrlResponse[];
    },
  });

  // Upload file to Vercel Blob
  const uploadToVercelBlob = async (file: File, blobPath: string): Promise<string> => {
    const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      throw new Error('Blob storage token not configured');
    }

    const { url } = await put(blobPath, file, {
      access: 'public',
      contentType: file.type,
      token: blobToken,
    });

    return url;
  };

  // Save documents metadata
  const saveDocuments = useMutation({
    mutationFn: async (documents: CreateDocumentRequest[]) => {
      const res = await baseURL.post('/repository/documents', { documents });
      return res.data.data.documents as RepositoryDocument[];
    },
    onSuccess: () => {
      // Invalidate documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['repository', 'documents'] });
    },
  });

  // Note: For hooks that need parameters, they should be called directly in components
  // This hook provides the mutation functions and helper functions only

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const res = await baseURL.delete(`/repository/documents/${id}`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['repository', 'documents'] });
    },
  });

  return {
    getUploadUrls,
    uploadToVercelBlob,
    saveDocuments,
    deleteDocument,
  };
}

// Separate hooks for queries (must be called directly in components)
export function useDocuments(page: number = 1, limit: number = 20, status?: string) {
  return useQuery<ListDocumentsResponse>({
    queryKey: ['repository', 'documents', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) {
        params.append('status', status);
      }
      const res = await baseURL.get(`/repository/documents?${params.toString()}`);
      return res.data.data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery<RepositoryDocument>({
    queryKey: ['repository', 'documents', id],
    queryFn: async () => {
      const res = await baseURL.get(`/repository/documents/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

