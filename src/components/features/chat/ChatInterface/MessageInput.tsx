'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageDocument } from '@/types/chat';
import AttachmentPreview from './AttachmentPreview';
import CameraModal from './CameraModal';

interface MessageInputProps {
  onSendMessage: (content: string, images?: string[], documents?: MessageDocument[]) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showPinMenu, setShowPinMenu] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<MessageDocument[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

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
      selectedImages.forEach(url => {
        if (url && !url.startsWith('data:')) {
          URL.revokeObjectURL(url);
        }
      });
      selectedDocuments.forEach(doc => {
        if (doc.url && !doc.url.startsWith('data:')) {
          URL.revokeObjectURL(doc.url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run cleanup on unmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedImages.length === 0 && selectedDocuments.length === 0) return;
    
    // Convert images to data URLs before sending to ensure they persist
    const imageDataUrls = selectedImages.map(url => {
      if (url.startsWith('data:')) return url;
      return url;
    });
    
    onSendMessage(inputValue.trim(), imageDataUrls, selectedDocuments.length > 0 ? selectedDocuments : undefined);
    setInputValue('');
    setSelectedImages([]);
    setSelectedDocuments([]);
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

  const handleCapturePhoto = (url: string) => {
    setSelectedImages(prev => [...prev, url].slice(0, 10));
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      }
    }
    setSelectedImages(prev => [...prev, ...newUrls].slice(0, 10));
    e.target.value = '';
  };

  const handleDocumentFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newDocuments: MessageDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        newDocuments.push({ file, url, type: 'PDF' });
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx')
      ) {
        const url = URL.createObjectURL(file);
        newDocuments.push({ file, url, type: 'DOC' });
      }
    }
    setSelectedDocuments(prev => [...prev, ...newDocuments].slice(0, 5));
    e.target.value = '';
  };

  const removeImageAt = (index: number) => {
    const url = selectedImages[index];
    URL.revokeObjectURL(url);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocumentAt = (index: number) => {
    const doc = selectedDocuments[index];
    URL.revokeObjectURL(doc.url);
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex-shrink-0 px-3 sm:px-4 md:mb-0 mb-2 py-3 sm:py-4 md:pb-3 pb-[90px] border-t border-[#2a3441] bg-[#1f2632] overflow-visible max-w-full">
        <form onSubmit={handleSubmit} className='w-full max-w-full overflow-visible'>
          {/* Input Field with Icons Inside */}
          <div className="bg-[#2a3441] rounded-2xl px-3 sm:px-4 py-3 md:py-0 flex flex-col w-full max-w-full overflow-visible box-border">
            <AttachmentPreview
              images={selectedImages}
              documents={selectedDocuments}
              onRemoveImage={removeImageAt}
              onRemoveDocument={removeDocumentAt}
            />
            
            {/* Input Field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Intellimaint AI."
              className="w-full max-w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base mb-3 py-2 overflow-hidden text-ellipsis box-border"
            />
              
            {/* Icons Row - Inside Input Field */}
            <div className="flex items-center justify-between w-full max-w-full overflow-visible">
              {/* Mobile: Show all icons with left/right alignment */}
              <div className="flex items-center justify-between w-full md:hidden min-w-0 max-w-full flex-shrink-0 box-border">
                {/* Left Icons Group - First 3 icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Chat/Text Icon */}
                  <button
                    type="button"
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                    title="Text"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>

                  {/* Camera Icon */}
                  <button
                    type="button"
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                    onClick={handleOpenCamera}
                    title="Camera"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Phone Icon */}
                  <button
                    type="button"
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                    title="Call"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                </div>

                {/* Right Icons Group - Last 2 icons */}
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  {/* Microphone Icon */}
                  <button
                    type="button"
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                    title="Voice"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>

                  {/* Attachment Icon - Document Upload */}
                  <button
                    type="button"
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                    onClick={handleOpenDocumentUpload}
                    title="Upload PDF/DOC"
                  >
                    <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Desktop: Show audio and plus icons on the right side */}
              <div className="hidden md:flex items-center gap-2 ml-auto relative">
                {/* Audio Icon - Always visible */}
                <button
                  type="button"
                  className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
                  title="Voice"
                >
                  <svg className="w-5 h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Plus Button with Dropdown */}
                <div className="relative pin-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowPinMenu(!showPinMenu)}
                    className="p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
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
                        {/* Camera Icon */}
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                          onClick={() => { setShowPinMenu(false); handleOpenCamera(); }}
                          title="Camera"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        
                        {/* Phone Icon */}
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                          onClick={() => setShowPinMenu(false)}
                          title="Call"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        
                        {/* Gallery Icon */}
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                          onClick={() => { setShowPinMenu(false); handleOpenGallery(); }}
                          title="Gallery"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        {/* Attachment Icon - Document Upload */}
                        <button
                          type="button"
                          className="p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
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
            {/* Hidden file input for gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            {/* Hidden file input for document upload (PDF/DOC) */}
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

