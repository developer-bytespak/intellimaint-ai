'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import baseURL from '@/lib/api/axios';
import axios from 'axios';
import { toast } from 'react-toastify';
import { storeFileInDB, getFileFromDB, getAllFilesFromDB, deleteFileFromDB, clearAllFilesFromDB } from '@/lib/utils/indexedDB';

// Store files in IndexedDB for persistence across page reloads
export const storeFiles = async (files: File[]) => {
  try {
    for (const file of files) {
      await storeFileInDB(file);
    }
    console.log(`[Storage] Stored ${files.length} files in IndexedDB`);
  } catch (error) {
    console.error('[Storage] Failed to store files:', error);
    toast.error('Failed to save files for processing');
  }
};

// Get a single file from IndexedDB
export const getFile = async (fileName: string): Promise<File | null> => {
  try {
    const file = await getFileFromDB(fileName);
    return file;
  } catch (error) {
    console.error('[Storage] Failed to retrieve file:', error);
    return null;
  }
};

// Get all stored files from IndexedDB
export const getAllStoredFiles = async (): Promise<File[]> => {
  try {
    const files = await getAllFilesFromDB();
    return files;
  } catch (error) {
    console.error('[Storage] Failed to retrieve all files:', error);
    return [];
  }
};

// Clear all files from IndexedDB after successful upload
export const clearStoredFiles = async () => {
  try {
    await clearAllFilesFromDB();
    console.log('[Storage] Cleared all files from IndexedDB');
  } catch (error) {
    console.error('[Storage] Failed to clear files:', error);
  }
};

// Global instance

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
  const queryClient = useQueryClient();

  // Upload document to server (which handles blob upload and DB save)
  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {

      const formData = new FormData();
      formData.append('file', file);
      console.log('[useRepository] Uploading file:', file.name);

      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      if (!token) {
        console.warn('[useRepository] ❌ No accessToken found in localStorage - user may not be authenticated');
      } else {
        console.log('[useRepository] ✅ Token found in localStorage, length:', token.length);
      }
      
      const headers: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      console.log('[useRepository] Request headers:', {
        hasAuth: !!token,
        contentType: 'automatically set by FormData',
      });

      const res = await fetch('/api/upload-repository-document', {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      console.log('[useRepository] Response status:', res.status, res.statusText);

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
        
        // Provide helpful error messages based on status
        let errorMessage = error.error || 'Failed to upload document';
        if (res.status === 401) {
          errorMessage = 'Authentication failed. ' + (error.details || 'Please log in again.');
        } else if (res.status === 400) {
          errorMessage = error.error || 'Invalid file. Please check the file and try again.';
        }
        
        console.error('[useRepository] ❌ Upload failed:', {
          status: res.status,
          hasToken: !!token,
          error: errorMessage,
        });
        
        throw new Error(errorMessage);
      }

      const data = await res.json();
      return data.document as RepositoryDocument;
    },
    onSuccess: (data) => {
      // Invalidate documents query to refetch
      queryClient.invalidateQueries({ queryKey: ['repository', 'documents'] });
      // Show success toast
      toast.success('Document uploaded and saved successfully!');
      // Note: Don't clear localStorage here - batch manager handles cleanup
    },
    onError: (error: Error) => {
      // Note: Don't clear localStorage here - batch manager handles cleanup on full batch error
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

  const {data,isLoading,isError}=useQuery({
    queryKey: ['user'],
    queryFn:async()=>{
      const res=await baseURL.get('/user/profile');
      return res.data.data;
    }
  })

  // Document Extraction
  const extractDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      if(isError){
        toast.error('Failed to fetch user data for extraction.');
        throw new Error('Failed to fetch user data for extraction.');
      }
      console.log('data', data);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await axios.post(
        `${apiUrl}/api/v1/extract/extract/full`,
        formData,
        {
    params: {
      userId: data.id,
      name: data.name,
      role: data.role,
      email: data.email
    },
    headers: { 'Content-Type': 'multipart/form-data' }
  }

      );
      return res.data;
    },
    onSuccess: (data) => {
      // Job ID will be set by the component
    },
  });

  const {data:userData,isLoading:userLoading,isError:userError}= useQuery({
    queryKey: ['user'],
    queryFn:async()=>{
      const res=await baseURL.get('/user/profile');
      console.log('Fetched user data:', res.data);
      return res.data.data;
    }
  })

  return {
    uploadDocument,
    deleteDocument,
    extractDocument,
    userData,
    userLoading,
    userError
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