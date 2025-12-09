'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import baseURL from '@/lib/api/axios';
import axios from 'axios';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

// Global file storage that persists across component unmounts/remounts
// This allows file to be retrieved even after page navigation
const globalFileStorage = new Map<string, File>();

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
  // Store original file for upload after extraction completes
  const originalFileRef = useRef<File | null>(null);

  const queryClient = useQueryClient();

  // Helper function to store file globally by jobId
  const storeFileForJob = (jobId: string, file: File) => {
    globalFileStorage.set(jobId, file);
    originalFileRef.current = file;
  };

  // Helper function to get file by jobId
  const getFileForJob = (jobId: string | null): File | null => {
    if (!jobId) return null;
    const storedFile = globalFileStorage.get(jobId);
    if (storedFile) {
      originalFileRef.current = storedFile;
      return storedFile;
    }
    return originalFileRef.current;
  };

  // Helper function to clear file for jobId
  const clearFileForJob = (jobId: string | null) => {
    if (jobId) {
      globalFileStorage.delete(jobId);
    }
    originalFileRef.current = null;
  };

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
        let error;
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            error = await res.json();
          } else {
            const text = await res.text();
            error = { error: text || 'Failed to upload document' };
          }
        } catch (e) {
          error = { error: 'Failed to upload document' };
        }
        throw new Error(error.error || 'Failed to upload document');
      }

      const data = await res.json();
      return data.document as RepositoryDocument;
    },
    onSuccess: (data) => {
      // Invalidate documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['repository', 'documents'] });
      // Show success toast
      toast.success('Document uploaded and saved successfully!');
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(error.message || 'Failed to upload document');
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

      // Store file globally using job_id as key (will be set by component)
      if (res.data?.job_id) {
        storeFileForJob(res.data.job_id, file);
      }

      return res.data;
    },
    onSuccess: (data) => {
      // Job ID will be set by the component
    },
  });






  return {
    uploadDocument,
    deleteDocument,
    extractDocument,
    originalFileRef,
    getFileForJob,
    clearFileForJob,
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
// 2. Progress query with milestone-based polling (only 4 calls total)
export const useExtractionProgress = (jobId: string | null, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['extraction-progress', jobId],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/extract/extract/progress/${jobId}`,
          {
            responseType: 'text',
            validateStatus: (status) => {
              return status >= 200 && status < 500;
            },
          }
        );
        
        // Handle 204 No Content (milestone not reached - wait before next call)
        if (res.status === 204) {
          // Get previous data to preserve progress
          const previousData = queryClient.getQueryData(['extraction-progress', jobId]) as any;
          
          return {
            milestoneReached: false,
            status: 'waiting',
            // Preserve previous progress values
            progress: previousData?.progress || previousData?.percentage || 0,
            percentage: previousData?.percentage || previousData?.progress || 0,
          };
        }
        
        // Handle error statuses (4xx, 5xx)
        if (res.status >= 400) {
          try {
            const errorData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            return {
              status: 'failed',
              error: errorData.error || errorData.message || 'Extraction failed',
              ...errorData,
            };
          } catch {
            return {
              status: 'failed',
              error: 'Extraction failed',
            };
          }
        }
        
        // Handle successful responses (200)
        const contentType = (res.headers['content-type'] || '').toLowerCase();
        
        // If Content-Type is text/plain, it's completed
        if (contentType.includes('text/plain')) {
          return {
            status: 'completed',
            data: res.data,
            progress: 100,
            percentage: 100,
            milestoneReached: true,
          };
        }
        
        // JSON response (milestone reached)
        try {
          const jsonData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          
          if (!jsonData.status) {
            jsonData.status = 'processing';
          }
          
          // Mark that milestone was reached - trigger next call
          jsonData.milestoneReached = true;
          
          return jsonData;
        } catch (error) {
          console.warn('Failed to parse response as JSON, treating as plain text:', error);
          return {
            status: 'completed',
            data: res.data,
            progress: 100,
            percentage: 100,
            milestoneReached: true,
          };
        }
      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 204) {
            // Get previous data to preserve progress
            const previousData = queryClient.getQueryData(['extraction-progress', jobId]) as any;
            
            return {
              milestoneReached: false,
              status: 'waiting',
              // Preserve previous progress values
              progress: previousData?.progress || previousData?.percentage || 0,
              percentage: previousData?.percentage || previousData?.progress || 0,
            };
          }
          
          return {
            status: 'failed',
            error: error.response.data?.error || error.response.data?.message || 'Extraction failed',
          };
        }
        
        throw error;
      }
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      
      // Stop polling if completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      
      // If milestone was reached, immediately trigger next call (very short interval)
      if (data?.milestoneReached === true) {
        // Use a very short interval to trigger next call immediately
        return 100; // 100ms - almost immediate
      }
      
      // If 204 (waiting for milestone), wait longer before next call
      if (data?.milestoneReached === false || data?.status === 'waiting') {
        return 3000; // Wait 3 seconds before checking again
      }
      
      // Initial state - start polling
      return 1000;
    },
    // Keep previous data when receiving 204 (waiting state) - this ensures progress doesn't reset
    placeholderData: (previousData) => {
      // If previous data exists and has progress, keep it
      if (previousData && (previousData.progress !== undefined || previousData.percentage !== undefined)) {
        return previousData;
      }
      return previousData;
    },
  });
};