'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageDocument } from '@/types/chat';
import AttachmentPreview from './AttachmentPreview';
import CameraModal from './CameraModal';
import AudioRecorder from './AudioRecorder';
import { useAudioRecorder } from './useAudioRecorder';
import { useAudio } from '@/hooks/useAudio';
import { useUpload, UploadResult } from '@/hooks/useUploadContext';
import { toast } from 'react-toastify';

interface MessageInputProps {
  onSendMessage: (content: string, images?: string[], documents?: MessageDocument[]) => void;
}

interface ImageWithStatus {
  previewUrl: string; // blob: or data: URL for preview
  uploadedUrl?: string; // Final uploaded URL
  status: 'uploading' | 'uploaded' | 'error';
  file: File;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showPinMenu, setShowPinMenu] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageWithStatus[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<MessageDocument[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { uploadFile, uploadMultipleFiles } = useUpload();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPinMenu && !(event.target as Element).closest('.pin-dropdown')) {
        setShowPinMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPinMenu]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedImages.forEach(img => {
        if (img.previewUrl && !img.previewUrl.startsWith('data:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
      selectedDocuments.forEach(doc => {
        if (doc.url && !doc.url.startsWith('data:')) {
          URL.revokeObjectURL(doc.url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedImages.length === 0 && selectedDocuments.length === 0) return;
    
    // Check if any images are still uploading
    const hasUploadingImages = selectedImages.some(img => img.status === 'uploading');
    if (hasUploadingImages) return; // Don't send if images are still uploading
    
    // Check if any images failed to upload
    const hasErrorImages = selectedImages.some(img => img.status === 'error');
    if (hasErrorImages) {
      toast.error('Some images failed to upload. Please remove them and try again.');
      return;
    }
    
    if (isUploading) return; // Prevent multiple submissions during upload
    
    // Store values before clearing
    const messageContent = inputValue.trim();
    const imagesToProcess = [...selectedImages];
    const documentsToProcess = [...selectedDocuments];
    
    // Immediately clear input and selected files to go directly to chat
    setInputValue('');
    setSelectedImages([]);
    setSelectedDocuments([]);
    
    setIsUploading(true);
    
    try {
      // Get uploaded image URLs (they should all be uploaded by now)
      const uploadedImageUrls = imagesToProcess
        .filter(img => img.status === 'uploaded' && img.uploadedUrl)
        .map(img => img.uploadedUrl!);

      // Upload documents that haven't been uploaded yet
      const documentsToUpload: File[] = [];
      const documentUrlMap: Map<string, File> = new Map();
      
      documentsToProcess.forEach((doc) => {
        if (doc.url.startsWith('blob:') && doc.file) {
          documentsToUpload.push(doc.file);
          documentUrlMap.set(doc.url, doc.file);
        }
      });

      let finalDocuments = documentsToProcess;
      if (documentsToUpload.length > 0) {
        const uploadResults = await uploadMultipleFiles.mutateAsync(documentsToUpload);

        // Update document URLs
        finalDocuments = documentsToProcess.map((doc) => {
          if (doc.url.startsWith('blob:')) {
            const fileIndex = documentsToUpload.findIndex(f => f === doc.file);
            if (fileIndex !== -1 && uploadResults[fileIndex]?.success && uploadResults[fileIndex]?.url) {
              URL.revokeObjectURL(doc.url);
              return {
                ...doc,
                url: uploadResults[fileIndex].url!,
              };
            }
          }
          return doc;
        });
      }

      // Now send the message with uploaded URLs
      onSendMessage(messageContent, uploadedImageUrls, finalDocuments.length > 0 ? finalDocuments : undefined);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenGallery = () => {
    fileInputRef.current?.click();
  };

  const handleOpenDocumentUpload = () => {
    documentInputRef.current?.click();
  };

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCapturePhoto = async (url: string) => {
    // If it's a data URL from camera, convert to File for immediate upload
    if (url.startsWith('data:')) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Create a blob URL for preview
        const blobUrl = URL.createObjectURL(file);
        
        // Add image with uploading status
        const newImage: ImageWithStatus = {
          previewUrl: blobUrl,
          status: 'uploading',
          file,
        };
        
        setSelectedImages(prev => [...prev, newImage].slice(0, 10));
        
        // Upload immediately
        uploadImageFile(newImage, prev => [...prev].slice(0, 10));
      } catch (error) {
        console.error('Error processing camera photo:', error);
        toast.error('Failed to process camera photo');
      }
    } else {
      // Already a blob URL or external URL - treat as already uploaded
      const alreadyUploadedImage: ImageWithStatus = {
        previewUrl: url,
        uploadedUrl: url,
        status: 'uploaded' as const,
        file: new File([], 'image.jpg', { type: 'image/jpeg' }),
      };
      setSelectedImages(prev => [...prev, alreadyUploadedImage].slice(0, 10));
    }
  };
  
  // Helper function to upload a single image file
  const uploadImageFile = async (image: ImageWithStatus, getUpdatedImages: (prev: ImageWithStatus[]) => ImageWithStatus[]) => {
    try {
      const result = await uploadFile.mutateAsync({ file: image.file });
      
      if (result.success && result.url) {
        // Update the image status to uploaded
        setSelectedImages(prev => {
          const updated = prev.map(img => 
            img.previewUrl === image.previewUrl
              ? { ...img, uploadedUrl: result.url!, status: 'uploaded' as const }
              : img
          );
          return getUpdatedImages(updated);
        });
        
        // Revoke the blob URL since we now have the uploaded URL
        if (image.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.previewUrl);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Update the image status to error
      setSelectedImages(prev => {
        const updated = prev.map(img => 
          img.previewUrl === image.previewUrl
            ? { ...img, status: 'error' as const }
            : img
        );
        return getUpdatedImages(updated);
      });
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImages: ImageWithStatus[] = [];
    
    // Create temporary blob URLs for preview and upload immediately
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const blobUrl = URL.createObjectURL(file);
        
        const newImage: ImageWithStatus = {
          previewUrl: blobUrl,
          status: 'uploading',
          file,
        };
        
        newImages.push(newImage);
      }
    }
    
    if (newImages.length === 0) {
      e.target.value = '';
      return;
    }
    
    // Add images with uploading status for immediate preview
    setSelectedImages(prev => {
      const updated = [...prev, ...newImages].slice(0, 10);
      return updated;
    });
    
    e.target.value = '';
    
    // Upload all images immediately
    newImages.forEach((image) => {
      uploadImageFile(image, prev => prev);
    });
  };

  const handleDocumentFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const tempDocuments: MessageDocument[] = [];
    
    // Create temporary documents with blob URLs for preview
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        tempDocuments.push({ file, url, type: 'PDF' });
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx')
      ) {
        const url = URL.createObjectURL(file);
        tempDocuments.push({ file, url, type: 'DOC' });
      }
    }
    
    if (tempDocuments.length === 0) {
      e.target.value = '';
      return;
    }
    
    // Add temporary documents for immediate preview (will be uploaded on send)
    setSelectedDocuments(prev => [...prev, ...tempDocuments].slice(0, 5));
    e.target.value = '';
    
    // DO NOT upload immediately - files will be uploaded when user clicks send
  };

  const removeImageAt = (index: number) => {
    const image = selectedImages[index];
    if (image && image.previewUrl && image.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocumentAt = (index: number) => {
    const doc = selectedDocuments[index];
    URL.revokeObjectURL(doc.url);
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Use audio hook for backend API calls
  const { sendAudio, isSending } = useAudio();

  // Handle audio send - call backend and set transcription
  const handleSendAudio = async (audioDocument: MessageDocument) => {
    try {
      // Send audio to backend for transcription
       sendAudio.mutate(audioDocument,{
        onSuccess: (data) => {
          console.log('data', data);
          if (data && data.data) {
            // Ensure we always set a string value to avoid controlled/uncontrolled input warning
            setInputValue(String(data.data || ''));
          }
        },
        onError: (error) => {
          console.error('Error transcribing audio:', error);
          setInputValue('Error transcribing audio');
          alert('Error transcribing audio');
        }
      });
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setInputValue('Error transcribing audio');
      // Even if transcription fails, user can still send the audio
    }
  };

  // Use recording hook directly
  const audioRecorder = useAudioRecorder(handleSendAudio);

  return (
    <MessageInputContent
      {...audioRecorder}
      inputValue={inputValue}
      setInputValue={setInputValue}
      selectedImages={selectedImages.map(img => img.previewUrl)}
      selectedImagesWithStatus={selectedImages}
      selectedDocuments={selectedDocuments}
      showPinMenu={showPinMenu}
      setShowPinMenu={setShowPinMenu}
      showCamera={showCamera}
      setShowCamera={setShowCamera}
      fileInputRef={fileInputRef}
      documentInputRef={documentInputRef}
      handleSubmit={handleSubmit}
      handleOpenGallery={handleOpenGallery}
      handleOpenDocumentUpload={handleOpenDocumentUpload}
      handleOpenCamera={handleOpenCamera}
      handleCapturePhoto={handleCapturePhoto}
      handleFilesSelected={handleFilesSelected}
      handleDocumentFilesSelected={handleDocumentFilesSelected}
      removeImageAt={removeImageAt}
      removeDocumentAt={removeDocumentAt}
      isSending={isSending}
      uploading={uploadFile.isPending || uploadMultipleFiles.isPending}
    />
  );
}

function MessageInputContent({
  isRecording,
  recordingTime,
  audioUrl,
  handleStartRecording,
  stopAndSend,
  handleSendAudio,
  handleCancel,
  formatTime,
  inputValue,
  setInputValue,
  selectedImages,
  selectedImagesWithStatus,
  selectedDocuments,
  showPinMenu,
  setShowPinMenu,
  showCamera,
  setShowCamera,
  fileInputRef,
  documentInputRef,
  handleSubmit,
  handleOpenGallery,
  handleOpenDocumentUpload,
  handleOpenCamera,
  handleCapturePhoto,
  handleFilesSelected,
  handleDocumentFilesSelected,
  removeImageAt,
  removeDocumentAt,
  isSending,
  uploading,
}: {
  isRecording: boolean;
  recordingTime: number;
  audioUrl: string | null;
  handleStartRecording: () => Promise<void>;
  stopAndSend: () => void;
  handleSendAudio: () => void;
  handleCancel: () => void;
  formatTime: (seconds: number) => string;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedImages: string[];
  selectedImagesWithStatus: ImageWithStatus[];
  selectedDocuments: MessageDocument[];
  showPinMenu: boolean;
  setShowPinMenu: (show: boolean) => void;
  showCamera: boolean;
  setShowCamera: (show: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
  handleSubmit: (e: React.FormEvent) => void;
  handleOpenGallery: () => void;
  handleOpenDocumentUpload: () => void;
  handleOpenCamera: () => void;
  handleCapturePhoto: (url: string) => void;
  handleFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDocumentFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImageAt: (index: number) => void;
  removeDocumentAt: (index: number) => void;
  isSending: boolean;
  uploading: boolean;
}) {
  const isAudioActive = isRecording || !!audioUrl;
  const hasUploadingImages = selectedImagesWithStatus.some(img => img.status === 'uploading');
  const isDisabled = isAudioActive || isSending || uploading || hasUploadingImages;
  // Wrapper function - yeh handleSendAudio ko wrap karta hai

    const handleCallingFeature = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log("chal")
    setShowPinMenu(false)

    alert('Calling feature is not implemented yet.');
  }


  return (
    <>
      <div className="flex-shrink-0 px-3 sm:px-4 md:mb-0 mb-2 py-3 sm:py-4 md:pb-3 pb-[90px] border-t border-[#2a3441] bg-[#1f2632] overflow-visible max-w-full">
        <form onSubmit={handleSubmit} className='w-full max-w-full overflow-visible' noValidate>
          <div className="bg-[#2a3441] rounded-2xl px-3 sm:px-4 py-3 md:py-0 flex flex-col w-full max-w-full overflow-visible box-border">
          {/* // TODO: User Show Image and Document Preview before sending the message ; */}
            <AttachmentPreview
              images={selectedImages}
              imagesWithStatus={selectedImagesWithStatus}
              documents={selectedDocuments}
              onRemoveImage={removeImageAt}
              onRemoveDocument={removeDocumentAt}
            />
            
            {/* Audio Recorder UI - Shows when recording or audio ready */}
            <div className="mb-3">
              {!isSending && <AudioRecorder 
                variant="ui"
                isRecording={isRecording}
                recordingTime={recordingTime}
                audioUrl={audioUrl}
                handleStartRecording={handleStartRecording}
                stopAndSend={stopAndSend}
                handleSendAudio={handleSendAudio}
                handleCancel={handleCancel}
                formatTime={formatTime}
              />}
            </div>
            
            {/* Input Field - Disabled when audio is active or sending or images uploading */}
            <div className="relative mb-3">
              <input
                type="text"
                value={inputValue || ''}
                onChange={(e) => setInputValue(e.target.value || '')}
                placeholder={
                  isSending 
                    ? "Transcribing audio..." 
                    : isAudioActive 
                    ? "Recording audio..." 
                    : hasUploadingImages
                    ? "Uploading images..."
                    : "Ask Intellimaint AI."
                }
                disabled={isDisabled}
                className={`w-full max-w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base py-2 pr-8 overflow-hidden text-ellipsis box-border ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {/* Loader on right end when sending or uploading images */}
              {(isSending || hasUploadingImages) && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
              
            {/* Icons Row */}
            <div className="flex items-center justify-between w-full max-w-full overflow-visible">
              {/* Mobile: Show all icons */}
              <div className="flex items-center justify-between w-full md:hidden min-w-0 max-w-full flex-shrink-0 box-border">
                {/* Left Icons Group */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    disabled={isSending}
                    className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Text"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    disabled={isSending}
                    className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleOpenCamera}
                    title="Camera"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Phone Icon Mobile */}

                  <button
                    type="button"
                    disabled={isSending}
                    className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Call"
                    onClick={() => alert('Calling feature is not implemented yet.')}
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                </div>

                {/* Right Icons Group */}
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  <AudioRecorder 
                    variant="button"
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    audioUrl={audioUrl}
                    handleStartRecording={handleStartRecording}
                    stopAndSend={stopAndSend}
                    handleSendAudio={handleSendAudio}
                    handleCancel={handleCancel}
                    formatTime={formatTime}
                  />
                  <button
                    type="button"
                    disabled={isSending}
                    className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleOpenDocumentUpload}
                    title="Upload PDF/DOC"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Desktop: Show plus icon with dropdown */}
              <div className="hidden md:flex items-center gap-2 ml-auto relative">
                <AudioRecorder 
                  variant="button"
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  audioUrl={audioUrl}
                  handleStartRecording={handleStartRecording}
                  stopAndSend={stopAndSend}
                  handleSendAudio={handleSendAudio}
                  handleCancel={handleCancel}
                  formatTime={formatTime}
                />
                <div className="relative pin-dropdown">
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => setShowPinMenu(!showPinMenu)}
                    className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="More Options"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  
                  {/* Plus Dropdown Menu */}
                  {showPinMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#1f2632] border border-[#3a4a5a] rounded-lg shadow-lg p-2 z-[100]">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSending}
                          className={`p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => { setShowPinMenu(false); handleOpenCamera(); }}
                          title="Camera"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

                        {/* Phone Icon Desktop */}
                        
                        {/* <button
                          type="button"
                          disabled={isSending}
                          className={`p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={(e) => {alert('Calling feature is not implemented yet.')}}
                          title="Call"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button> */}
                        
                        <button
                          type="button"
                          disabled={isSending}
                          className={`p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => { setShowPinMenu(false); handleOpenGallery(); }}
                          title="Gallery"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          disabled={isSending}
                          className={`p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => { setShowPinMenu(false); handleOpenDocumentUpload(); }}
                          title="Upload PDF/DOC"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <input
              ref={documentInputRef}
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
              multiple
              className="hidden"
              onChange={handleDocumentFilesSelected}
            />
          </div>
        </form>
      </div>
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapturePhoto}
      />
    </>
  );
}

