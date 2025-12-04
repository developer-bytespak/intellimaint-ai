# Vercel Blob Upload - Usage Guide

## Overview
This project includes a complete implementation for uploading images and documents to Vercel Blob Storage. The upload functionality is already integrated into the chat interface.

## Files Created

1. **API Route**: `src/app/api/upload/route.ts`
   - Handles file uploads to Vercel Blob
   - Returns uploaded file URL

2. **Utility Functions**: `src/lib/utils/blobUpload.ts`
   - `uploadToBlob(file, filename?)` - Upload single file
   - `uploadMultipleToBlob(files[])` - Upload multiple files

3. **Custom Hook**: `src/hooks/useBlobUpload.ts`
   - React hook with loading and error states
   - Easy to use in components

## Basic Usage

### Method 1: Direct Function Call

```typescript
import { uploadToBlob } from '@/lib/utils/blobUpload';

// Upload a single file
const handleUpload = async (file: File) => {
  const result = await uploadToBlob(file);
  
  if (result.success) {
    console.log('Uploaded URL:', result.url);
    // Use result.url in your application
  } else {
    console.error('Upload failed:', result.error);
  }
};
```

### Method 2: Using the Custom Hook

```typescript
import { useBlobUpload } from '@/hooks/useBlobUpload';

function MyComponent() {
  const { uploadFile, isUploading, error } = useBlobUpload();
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await uploadFile(file);
    
    if (result.success) {
      console.log('File uploaded:', result.url);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {isUploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Method 3: Upload Multiple Files

```typescript
import { uploadMultipleToBlob } from '@/lib/utils/blobUpload';

const handleMultipleUpload = async (files: File[]) => {
  const results = await uploadMultipleToBlob(files);
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`File ${index + 1} uploaded:`, result.url);
    } else {
      console.error(`File ${index + 1} failed:`, result.error);
    }
  });
};
```

## Response Format

```typescript
interface UploadResult {
  success: boolean;
  url?: string;        // Blob URL if successful
  pathname?: string;   // Blob pathname if successful
  error?: string;      // Error message if failed
  message?: string;    // Additional error details
}
```

## Features

✅ **Automatic Upload**: Files are automatically uploaded when selected in chat interface
✅ **Preview Support**: Shows preview immediately, uploads in background
✅ **Error Handling**: Graceful error handling with user feedback
✅ **File Size Validation**: 10MB limit (configurable)
✅ **Multiple File Support**: Upload multiple files at once
✅ **Type Safety**: Full TypeScript support

## Environment Variables

For production, you may need to set:
```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

This is automatically available when deployed on Vercel. For local development, Vercel Blob SDK will work without explicit token in most cases.

## Already Integrated

The upload functionality is already integrated into:
- `MessageInput` component (chat input)
- `WelcomeScreen` component (welcome screen)

Files are automatically uploaded when users select images or documents!

