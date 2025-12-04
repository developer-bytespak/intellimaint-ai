'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import baseURL from '@/lib/api/axios';

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

interface UploadContextType {
  uploadFile: UseMutationResult<UploadResult, Error, { file: File; filename?: string }>;
  uploadMultipleFiles: UseMutationResult<UploadResult[], Error, File[]>;
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
        toast.success('File uploaded successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
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

  return (
    <UploadContext.Provider value={{ uploadFile, uploadMultipleFiles }}>
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

