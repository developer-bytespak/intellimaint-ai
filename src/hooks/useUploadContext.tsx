'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useMutation, UseMutationResult, useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import baseURL from '@/lib/api/axios';
import { Photo, Document } from '@/types/chat';

export interface UploadResult {
  success: boolean;
  url?: string;
  pathname?: string;
  error?: string;
  message?: string;
}

interface UploadResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    pathname: string;
  };
}

interface RawPhotoData {
  id?: string;
  _id?: string;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  filename?: string;
  name?: string;
  createdAt?: string;
  date?: string;
  size?: number;
}

interface PaginatedImagesData {
  images: RawPhotoData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface HistoryImagesResponse {
  statusCode: number;
  message: string;
  data: RawPhotoData[] | PaginatedImagesData;
}

interface HistoryDocumentsResponse {
  statusCode: number;
  message: string;
  data: Document[];
}

interface UploadContextType {
  uploadFile: UseMutationResult<UploadResult, Error, { file: File; filename?: string }>;
  uploadMultipleFiles: UseMutationResult<UploadResult[], Error, File[]>;
  useHistoryImages: (enabled?: boolean) => UseInfiniteQueryResult<InfiniteData<Photo[], number>, Error>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  // Single file upload mutation
  const uploadFile = useMutation({
    mutationFn: async ({ file, filename }: { file: File; filename?: string }): Promise<UploadResult> => {
      // Validate file
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      if (filename) {
        formData.append('filename', filename);
      }

      // Upload to API route
      const response = await baseURL.post<UploadResponse>('/upload/file', formData, {
        headers: {
          'Content-Type': undefined, // Browser will set multipart/form-data with boundary
        },
      });

      const data = response.data;

      // Check NestJS response format
      if (data.statusCode !== 200) {
        throw new Error(data.message || 'Upload failed');
      }

      return {
        success: true,
        url: data.data.url,
        pathname: data.data.pathname,
      };
    },
    onSuccess: (data) => {
      if (data.success) {
        // toast.success('File uploaded successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
      console.error('Error uploading file:', error);
    },
  });

  // Multiple files upload mutation
  const uploadMultipleFiles = useMutation({
    mutationFn: async (files: File[]): Promise<UploadResult[]> => {
      const uploadPromises = files.map(async (file) => {
        try {
          // Validate file
          if (!file || !(file instanceof File)) {
            return {
              success: false,
              error: 'Invalid file provided',
            };
          }

          // Check file size (limit to 10MB)
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            return {
              success: false,
              error: `File ${file.name} exceeds 10MB limit`,
            };
          }

          // Create FormData
          const formData = new FormData();
          formData.append('file', file);

          // Upload to API route
          const response = await baseURL.post<UploadResponse>('/upload/file', formData, {
            headers: {
              'Content-Type': undefined,
            },
          });

          const data = response.data;
          console.log("data", data);

          // Check NestJS response format
          if (data.statusCode !== 200) {
            return {
              success: false,
              error: data.message || 'Upload failed',
            };
          }

          return {
            success: true,
            url: data.data.url,
            pathname: data.data.pathname,
          };
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string; error?: string } }; message?: string })?.response?.data?.message ||
            (error as { response?: { data?: { message?: string; error?: string } }; message?: string })?.response?.data?.error ||
            (error as { response?: { data?: { message?: string; error?: string } }; message?: string })?.message ||
            'Unknown error occurred';

          return {
            success: false,
            error: errorMessage,
          };
        }
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: (results) => {
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount > 0 && failCount === 0) {
        toast.success(`All ${successCount} file(s) uploaded successfully`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} file(s) uploaded, ${failCount} failed`);
      } else {
        toast.error('All file uploads failed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload files');
    },
  });

  // Fetch history images with infinite scrolling
  const useHistoryImages = (enabled: boolean = true) => {
    const PAGE_SIZE = 20; // Number of images per page
    
    return useInfiniteQuery<Photo[], Error, InfiniteData<Photo[], number>, readonly unknown[], number>({
      queryKey: ['history-images'],
      queryFn: async ({ pageParam = 1 }): Promise<Photo[]> => {
        try {
          console.log(`[History Images] Fetching page ${pageParam} from backend...`);
          
          // Try paginated endpoint first, fallback to regular endpoint with query params
          const response = await baseURL.get<HistoryImagesResponse>('/upload/history/images', {
            params: {
              page: pageParam,
              limit: PAGE_SIZE,
            },
          });
          
          const data = response.data;
          
          console.log(`[History Images] Response for page ${pageParam}:`, data);
          
          if (data.statusCode !== 200) {
            throw new Error(data.message || 'Failed to fetch images');
          }

          let photosArray: RawPhotoData[] = [];
          let hasMore = false;

          // Handle both paginated and non-paginated responses
          if (Array.isArray(data.data)) {
            // Non-paginated response (all images)
            photosArray = data.data;
            hasMore = false; // If backend returns all, no pagination
          } else if (data.data && typeof data.data === 'object' && 'images' in data.data) {
            // Paginated response
            const paginatedData = data.data as PaginatedImagesData;
            photosArray = paginatedData.images || [];
            hasMore = paginatedData.hasMore || false;
          } else {
            console.error('[History Images] Unexpected response format:', data.data);
            return [];
          }

          // Transform response to Photo[] format
          const photos: Photo[] = photosArray.map((item: RawPhotoData, index: number) => {
            const photo = {
              id: item.id || item._id || `photo-${pageParam}-${index}-${Date.now()}`,
              url: item.fileUrl || item.url || '', // Use fileUrl from backend
              filename: item.fileName || item.filename || item.name || 'image.jpg',
              date: item.createdAt ? new Date(item.createdAt) : (item.date ? new Date(item.date) : new Date()),
              size: item.size || 0,
            };
            return photo;
          });

          console.log(`[History Images] Page ${pageParam}: ${photos.length} photos loaded, hasMore: ${hasMore}`);
          
          // Only show toast for first page
          if (pageParam === 1 && photos.length > 0) {
            toast.success(`Loaded ${photos.length} image(s)`);
          }
          
          return photos;
        } catch (error: unknown) {
          const errorMessage = 
            (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
            (error as { response?: { data?: { message?: string } }; message?: string })?.message ||
            'Failed to fetch images';
          console.error(`[History Images] Error on page ${pageParam}:`, error);
          
          // Only show error toast for first page
          if (pageParam === 1) {
            toast.error(errorMessage);
          }
          throw error;
        }
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage: Photo[], allPages: Photo[][], lastPageParam: number) => {
        // If last page is empty or has fewer items than PAGE_SIZE, no more pages
        if (lastPage.length < PAGE_SIZE) {
          return undefined;
        }
        // Otherwise, check if backend indicates there are more pages
        // For now, we'll use length-based detection
        // Backend can return hasMore flag in response for better control
        return lastPage.length > 0 ? lastPageParam + 1 : undefined;
      },
      enabled,
      retry: false, // No retries on error
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };

 

  return (
    <UploadContext.Provider value={{ uploadFile, uploadMultipleFiles, useHistoryImages }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}

