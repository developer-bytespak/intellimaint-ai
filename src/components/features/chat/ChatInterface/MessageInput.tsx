'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageDocument } from '@/types/chat';
import AttachmentPreview from './AttachmentPreview';
import CameraModal from './CameraModal';
import AudioRecorder from './AudioRecorder';
import { useAudioRecorder } from './useAudioRecorder';
import { useAudio } from '@/hooks/useAudio';

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
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedImages.length === 0 && selectedDocuments.length === 0) return;
    
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
      selectedImages={selectedImages}
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
}) {
  const isAudioActive = isRecording || !!audioUrl;
  const isDisabled = isAudioActive || isSending;
  // Wrapper function - yeh handleSendAudio ko wrap karta hai

    const handleCallingFeature = (e:any) => {
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
            
            {/* Input Field - Disabled when audio is active or sending */}
            <div className="relative mb-3">
              <input
                type="text"
                value={inputValue || ''}
                onChange={(e) => setInputValue(e.target.value || '')}
                placeholder={isSending ? "Transcribing audio..." : isAudioActive ? "Recording audio..." : "Ask Intellimaint AI."}
                disabled={isDisabled}
                className={`w-full max-w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base py-2 pr-8 overflow-hidden text-ellipsis box-border ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {/* Loader on right end when sending */}
              {isSending && (
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
                    onClick={(e) => alert('Calling feature is not implemented yet.')}
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
