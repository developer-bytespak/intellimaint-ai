'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import baseURL from '@/lib/api/axios';
import axios from 'axios';
import { useState } from 'react';

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
  const [jobId, setJobId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Upload document to server (which handles blob upload and DB save)
  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-repository-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      const data = await res.json();
      return data.document as RepositoryDocument;
    },
    onSuccess: () => {
      // Invalidate documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['repository', 'documents'] });
    },
  });

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

  // Document Extraction
 // Document Extraction
const extractDocument = useMutation({
  mutationFn: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      `http://localhost:8000/api/v1/extract/extract/full`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log('res', res);

    return res.data;
  },
  onSuccess: (data) => {
  },
});






  return {
    uploadDocument,
    deleteDocument,
    extractDocument
  };
}

// Separate hooks for queries (must be called directly in components)
export function useDocuments(page: number = 1, limit: number = 10, status?: string) {
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
// 2. Progress query with polling
export const useExtractionProgress = (jobId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['extraction-progress', jobId],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/api/v1/extract/extract/progress/${jobId}`
      );
      console.log('res', res);
      return res.data;
    },
    enabled: enabled && !!jobId, // Only run when jobId exists
    refetchInterval: (query) => {
      // Stop polling if completed or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false; // Stop polling
      }
      return 1000; // Poll every 1 second
    },
  });
};

