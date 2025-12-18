'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import baseURL from '@/lib/api/axios';
import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

// Global file storage that persists across component unmounts/remounts
// This allows file to be retrieved even after page navigation
const globalFileStorage = new Map<string, File>();

// Global background processing manager - continues polling even when component unmounts
class BackgroundProcessingManager {
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  private queryClient: any = null;
  private readonly STORAGE_KEY = 'repository-active-jobs';
  private readonly PROGRESS_STORAGE_KEY = 'repository-progress-cache';

  setQueryClient(queryClient: any) {
    this.queryClient = queryClient;
  }

  // Save active job IDs to sessionStorage
  private saveActiveJobs(jobIds: string[]) {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobIds));
      } catch (e) {
        console.error('Failed to save active jobs:', e);
      }
    }
  }

  // Get active job IDs from sessionStorage
  getActiveJobs(): string[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  startPolling(jobId: string) {
    // Don't start if already polling
    if (this.pollingIntervals.has(jobId)) {
      return;
    }

    // Add to active jobs
    const activeJobs = this.getActiveJobs();
    if (!activeJobs.includes(jobId)) {
      activeJobs.push(jobId);
      this.saveActiveJobs(activeJobs);
    }

    // Track if this is the first poll
    let isFirstPoll = true;

    const poll = async () => {
      isFirstPoll = false;
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/extract/extract/progress/${jobId}`,
          {
            responseType: 'text',
            validateStatus: (status) => status >= 200 && status < 500,
          }
        );

        let progressData: any;

        if (res.status === 204) {
          const previousData = this.queryClient?.getQueryData(['extraction-progress', jobId]) as any;
          progressData = {
            milestoneReached: false,
            status: 'waiting',
            progress: previousData?.progress || previousData?.percentage || 0,
            percentage: previousData?.percentage || previousData?.progress || 0,
          };
        } else if (res.status >= 400) {
          try {
            const errorData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            progressData = {
              status: 'failed',
              error: errorData.error || errorData.message || 'Extraction failed',
              ...errorData,
            };
          } catch {
            progressData = {
              status: 'failed',
              error: 'Extraction failed',
            };
          }
        } else {
          const contentType = (res.headers['content-type'] || '').toLowerCase();

          if (contentType.includes('text/plain')) {
            progressData = {
              status: 'completed',
              data: res.data,
              progress: 100,
              percentage: 100,
              milestoneReached: true,
            };
          } else {
            try {
              const jsonData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
              if (!jsonData.status) {
                jsonData.status = 'processing';
              }
              jsonData.milestoneReached = true;
              progressData = jsonData;
            } catch {
              progressData = {
                status: 'completed',
                data: res.data,
                progress: 100,
                percentage: 100,
                milestoneReached: true,
              };
            }
          }
        }

        // Update React Query cache (only if changed to prevent loops)
        if (this.queryClient) {
          const currentData = this.queryClient.getQueryData(['extraction-progress', jobId]) as any;
          const changed = !currentData ||
            currentData.progress !== progressData.progress ||
            currentData.percentage !== progressData.percentage ||
            currentData.status !== progressData.status;

          if (changed) {
            this.queryClient.setQueryData(['extraction-progress', jobId], progressData);
            // Also save to sessionStorage for persistence across reloads
            this.saveProgressToStorage(jobId, progressData);
          }
        }

        // Stop if completed or failed
        if (progressData.status === 'completed' || progressData.status === 'failed') {
          this.stopPolling(jobId);
          return;
        }

        // Schedule next poll (first poll already happened, so schedule next)
        const interval = progressData.milestoneReached === true ? 100 : 3000;
        const timeout = setTimeout(() => poll(), interval);
        this.pollingIntervals.set(jobId, timeout);
      } catch (error: any) {
        if (error.response?.status === 204) {
          const previousData = this.queryClient?.getQueryData(['extraction-progress', jobId]) as any;
          const progressData = {
            milestoneReached: false,
            status: 'waiting',
            progress: previousData?.progress || previousData?.percentage || 0,
            percentage: previousData?.percentage || previousData?.progress || 0,
          };
          if (this.queryClient) {
            this.queryClient.setQueryData(['extraction-progress', jobId], progressData);
            this.saveProgressToStorage(jobId, progressData);
          }
          const timeout = setTimeout(() => poll(), 3000);
          this.pollingIntervals.set(jobId, timeout);
        } else {
          const progressData = {
            status: 'failed',
            error: error.response?.data?.error || error.response?.data?.message || 'Extraction failed',
          };
          if (this.queryClient) {
            this.queryClient.setQueryData(['extraction-progress', jobId], progressData);
            this.saveProgressToStorage(jobId, progressData);
          }
          this.stopPolling(jobId);
        }
      }
    };

    // Start polling
    poll();
  }

  stopPolling(jobId: string) {
    const interval = this.pollingIntervals.get(jobId);
    if (interval) {
      clearTimeout(interval);
      this.pollingIntervals.delete(jobId);
    }

    // Remove from active jobs
    const activeJobs = this.getActiveJobs().filter(id => id !== jobId);
    this.saveActiveJobs(activeJobs);

    // Clean up progress storage if job is completed/failed
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${this.PROGRESS_STORAGE_KEY}-${jobId}`;
        sessionStorage.removeItem(storageKey);
      } catch (e) {
        // Ignore
      }
    }
  }

  // Restore and resume polling for all active jobs
  resumeAllPolling() {
    const activeJobs = this.getActiveJobs();
    activeJobs.forEach(jobId => {
      if (!this.pollingIntervals.has(jobId)) {
        // Immediately fetch current progress before starting polling
        this.fetchCurrentProgress(jobId).then(() => {
          // Then start polling
          this.startPolling(jobId);
        });
      }
    });
  }

  // Save progress to sessionStorage
  private saveProgressToStorage(jobId: string, progressData: any) {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${this.PROGRESS_STORAGE_KEY}-${jobId}`;
        sessionStorage.setItem(storageKey, JSON.stringify(progressData));
      } catch (e) {
        console.error('Failed to save progress to storage:', e);
      }
    }
  }

  // Get progress from sessionStorage
  getProgressFromStorage(jobId: string): any | null {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${this.PROGRESS_STORAGE_KEY}-${jobId}`;
        const stored = sessionStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Immediately fetch current progress (for reload scenario)
  async fetchCurrentProgress(jobId: string): Promise<void> {
    if (!this.queryClient) return;

    // First, try to restore from sessionStorage for immediate display
    const cachedProgress = this.getProgressFromStorage(jobId);
    if (cachedProgress) {
      this.queryClient.setQueryData(['extraction-progress', jobId], cachedProgress);
    }

    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/extract/extract/progress/${jobId}`,
        {
          responseType: 'text',
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      let progressData: any;

      if (res.status === 204) {
        // 204 means waiting, preserve any existing progress or set to 0
        const existingData = this.queryClient.getQueryData(['extraction-progress', jobId]) as any;
        progressData = {
          milestoneReached: false,
          status: 'waiting',
          progress: existingData?.progress || existingData?.percentage || 0,
          percentage: existingData?.percentage || existingData?.progress || 0,
        };
      } else if (res.status >= 400) {
        try {
          const errorData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          progressData = {
            status: 'failed',
            error: errorData.error || errorData.message || 'Extraction failed',
            ...errorData,
          };
        } catch {
          progressData = {
            status: 'failed',
            error: 'Extraction failed',
          };
        }
      } else {
        const contentType = (res.headers['content-type'] || '').toLowerCase();

        if (contentType.includes('text/plain')) {
          progressData = {
            status: 'completed',
            data: res.data,
            progress: 100,
            percentage: 100,
            milestoneReached: true,
          };
        } else {
          try {
            const jsonData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            if (!jsonData.status) {
              jsonData.status = 'processing';
            }
            jsonData.milestoneReached = true;
            progressData = jsonData;
          } catch {
            progressData = {
              status: 'completed',
              data: res.data,
              progress: 100,
              percentage: 100,
              milestoneReached: true,
            };
          }
        }
      }

      // Immediately update cache with current progress
      this.queryClient.setQueryData(['extraction-progress', jobId], progressData);
      // Save to sessionStorage
      this.saveProgressToStorage(jobId, progressData);
    } catch (error: any) {
      // On error, set initial state
      if (error.response?.status === 204) {
        const existingData = this.queryClient.getQueryData(['extraction-progress', jobId]) as any;
        const progressData = {
          milestoneReached: false,
          status: 'waiting',
          progress: existingData?.progress || existingData?.percentage || 0,
          percentage: existingData?.percentage || existingData?.progress || 0,
        };
        this.queryClient.setQueryData(['extraction-progress', jobId], progressData);
        this.saveProgressToStorage(jobId, progressData);
      } else {
        const progressData = {
          status: 'failed',
          error: error.response?.data?.error || error.response?.data?.message || 'Extraction failed',
        };
        this.queryClient.setQueryData(['extraction-progress', jobId], progressData);
        this.saveProgressToStorage(jobId, progressData);
      }
    }
  }
}

// Global instance
export const backgroundProcessingManager = new BackgroundProcessingManager();

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

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper function to convert base64 to File
  const base64ToFile = (base64: string, fileName: string, fileType: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || fileType;
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  // Store file by file ID (for queue restoration)
  const storeFileByFileId = async (fileId: string, file: File) => {
    if (typeof window !== 'undefined') {
      try {
        if (file.size < 5 * 1024 * 1024) {
          const base64 = await fileToBase64(file);
          const fileMetadata = {
            base64,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          };
          sessionStorage.setItem(`file-queue-${fileId}`, JSON.stringify(fileMetadata));
        }
      } catch (e) {
        console.error('Failed to store file by file ID:', e);
      }
    }
  };

  // Get file by file ID (for queue restoration)
  const getFileByFileId = async (fileId: string): Promise<File | null> => {
    if (typeof window !== 'undefined') {
      try {
        const storedData = sessionStorage.getItem(`file-queue-${fileId}`);
        if (storedData) {
          const metadata = JSON.parse(storedData);
          const file = base64ToFile(metadata.base64, metadata.fileName, metadata.fileType);
          return file;
        }
      } catch (e) {
        console.error('Failed to restore file by file ID:', e);
      }
    }
    return null;
  };

  // Helper function to store file globally by jobId
  const storeFileForJob = async (jobId: string, file: File) => {
    globalFileStorage.set(jobId, file);
    originalFileRef.current = file;

    // Also store file as base64 in sessionStorage for persistence across reloads
    if (typeof window !== 'undefined') {
      try {
        // Only store if file size is reasonable (less than 5MB base64)
        // Base64 is ~33% larger than original
        if (file.size < 5 * 1024 * 1024) {
          const base64 = await fileToBase64(file);
          const fileMetadata = {
            base64,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          };
          sessionStorage.setItem(`file-data-${jobId}`, JSON.stringify(fileMetadata));
        } else {
          console.warn('File too large to store in sessionStorage, will need to re-upload after reload');
        }
      } catch (e) {
        console.error('Failed to store file data:', e);
      }
    }
  };

  // Helper function to get file by jobId (restores from base64 if needed)
  const getFileForJob = async (jobId: string | null): Promise<File | null> => {
    if (!jobId) return null;

    // First try global storage (works if component didn't unmount)
    const storedFile = globalFileStorage.get(jobId);
    if (storedFile) {
      originalFileRef.current = storedFile;
      return storedFile;
    }

    // If not in global storage, try to restore from sessionStorage base64
    if (typeof window !== 'undefined') {
      try {
        const storedData = sessionStorage.getItem(`file-data-${jobId}`);
        if (storedData) {
          const metadata = JSON.parse(storedData);
          // Convert base64 back to File
          const file = base64ToFile(metadata.base64, metadata.fileName, metadata.fileType);

          // Store back in global storage for future use
          globalFileStorage.set(jobId, file);
          originalFileRef.current = file;
          return file;
        }
      } catch (e) {
        console.error('Failed to restore file from base64:', e);
      }
    }

    return originalFileRef.current;
  };

  // Helper function to clear file for jobId
  const clearFileForJob = (jobId: string | null) => {
    if (jobId) {
      globalFileStorage.delete(jobId);

      // Also clear file data from sessionStorage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(`file-data-${jobId}`);
        } catch (e) {
          console.error('Failed to clear file data:', e);
        }
      }
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const res = await baseURL.get('/user/profile');
      console.log(res.data)
      return res.data.data;
    }
  });


  // Document Extraction
  const extractDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      if (isError) {
        toast.error("Failed to get user profile for extraction.");
        return;
      }


      const res = await axios.post(
        `http://localhost:8000/api/v1/extract/extract/full`,
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
      console.log('res', res);

      // Store file globally using job_id as key (will be set by component)
      if (res.data?.job_id) {
        await storeFileForJob(res.data.job_id, file);
      }

      return res.data;
    },
    onSuccess: (data) => {
      // Job ID will be set by the component
    },
  });






  // Initialize background manager
  useEffect(() => {
    backgroundProcessingManager.setQueryClient(queryClient);
    // Resume polling for any active jobs on mount
    backgroundProcessingManager.resumeAllPolling();
  }, [queryClient]);

  return {
    uploadDocument,
    deleteDocument,
    extractDocument,
    originalFileRef,
    getFileForJob,
    clearFileForJob,
    storeFileByFileId,
    getFileByFileId,
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
// 2. Progress query with background processing support
export const useExtractionProgress = (jobId: string | null, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // Start background polling when jobId is available
  useEffect(() => {
    if (enabled && jobId) {
      backgroundProcessingManager.setQueryClient(queryClient);

      // Immediately fetch current progress (for reload scenario)
      backgroundProcessingManager.fetchCurrentProgress(jobId).then(() => {
        // Then start polling
        backgroundProcessingManager.startPolling(jobId);
      });
    }
  }, [jobId, enabled, queryClient]);

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
    // Don't use refetchInterval - background manager handles polling
    refetchInterval: false,
    // Keep previous data
    placeholderData: (previousData) => previousData,
    // Use stale time to prevent unnecessary refetches
    staleTime: Infinity,
  });
};