'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageDocument } from '@/types/chat';
import CameraModal from './CameraModal';
import AudioRecorder from './AudioRecorder';
import { useAudioRecorder } from './useAudioRecorder';
import { useAudio } from '@/hooks/useAudio';

interface WelcomeScreenProps {
  onSendMessage?: (content: string, images?: string[], documents?: MessageDocument[]) => void;
}

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<MessageDocument[]>([]);
  const [showPinMenu, setShowPinMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

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
    
    if (onSendMessage) {
      const imageDataUrls = selectedImages.map(url => {
        if (url.startsWith('data:')) return url;
        return url;
      });
      
      onSendMessage(inputValue.trim(), imageDataUrls, selectedDocuments.length > 0 ? selectedDocuments : undefined);
      setInputValue('');
      setSelectedImages([]);
      setSelectedDocuments([]);
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

  const handleCapturePhoto = (url: string) => {
    setSelectedImages(prev => [...prev, url].slice(0, 10));
  };

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
  const handleSendAudioWrapper = async (audioDocument: MessageDocument) => {
    try {
      // Send audio to backend for transcription
      sendAudio.mutate(audioDocument, {
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
  const audioRecorder = useAudioRecorder(handleSendAudioWrapper);

  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full overflow-hidden">
      {/* Welcome Content - Scrollable */}
      <div className="flex-1 overflow-y-auto items-center justify-center p-4 sm:p-8 flex">
        <div className="max-w-2xl text-center space-y-4 sm:space-y-6 w-full">
          {/* Logo or Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome to IntelliMaint AI</h1>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 sm:mt-8">
            <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-white font-semibold mb-1">Fast Response</h3>
              <p className="text-gray-400 text-sm">Get instant AI-powered answers</p>
            </div>
            <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-white font-semibold mb-1">Expert Knowledge</h3>
              <p className="text-gray-400 text-sm">Access comprehensive maintenance data</p>
            </div>
            <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-white font-semibold mb-1">24/7 Available</h3>
              <p className="text-gray-400 text-sm">Always here when you need help</p>
            </div>
          </div>
        </div>
      </div>

      {/* ChatGPT-like Prompt Interface - Fixed at Bottom */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-6 border-t border-[#2a3441] bg-[#1f2632]">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto" noValidate>
          <div className="bg-[#2a3441] rounded-2xl px-3 sm:px-4 py-3 flex flex-col w-full overflow-visible box-border">
            {/* Audio Recorder UI - Shows when recording or audio ready */}
            {(audioRecorder.isRecording || audioRecorder.audioUrl) && (
              <div className="mb-3">
                {!isSending && (
                  <AudioRecorder 
                    variant="ui"
                    isRecording={audioRecorder.isRecording}
                    recordingTime={audioRecorder.recordingTime}
                    audioUrl={audioRecorder.audioUrl}
                    handleStartRecording={audioRecorder.handleStartRecording}
                    stopAndSend={audioRecorder.stopAndSend}
                    handleSendAudio={audioRecorder.handleSendAudio}
                    handleCancel={audioRecorder.handleCancel}
                    formatTime={audioRecorder.formatTime}
                  />
                )}
              </div>
            )}
            
            {/* Input Field - Disabled when audio is active or sending */}
            <div className="flex items-center gap-2 relative mb-3">
              <input
                type="text"
                value={inputValue || ''}
                onChange={(e) => setInputValue(e.target.value || '')}
                placeholder={isSending ? "Transcribing audio..." : (audioRecorder.isRecording || audioRecorder.audioUrl) ? "Recording audio..." : "Ask Intellimaint AI."}
                disabled={audioRecorder.isRecording || !!audioRecorder.audioUrl || isSending}
                className={`flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm sm:text-base ${
                  (audioRecorder.isRecording || audioRecorder.audioUrl || isSending) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              
              {/* Right side icons: Plus and Voice (Microphone) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Plus Icon Button with Dropdown */}
                <div className="relative pin-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowPinMenu(!showPinMenu)}
                    disabled={audioRecorder.isRecording || !!audioRecorder.audioUrl || isSending}
                    className={`p-2 rounded-lg hover:bg-[#3a4a5a] hover:text-white transition-colors duration-200 ${
                      (audioRecorder.isRecording || audioRecorder.audioUrl || isSending) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                          className="p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                          onClick={() => { setShowPinMenu(false); handleOpenCamera(); }}
                          title="Camera"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        
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
                
                {/* Voice Button (Microphone) - Right side */}
                <AudioRecorder 
                  variant="button"
                  isRecording={audioRecorder.isRecording}
                  recordingTime={audioRecorder.recordingTime}
                  audioUrl={audioRecorder.audioUrl}
                  handleStartRecording={audioRecorder.handleStartRecording}
                  stopAndSend={audioRecorder.stopAndSend}
                  handleSendAudio={audioRecorder.handleSendAudio}
                  handleCancel={audioRecorder.handleCancel}
                  formatTime={audioRecorder.formatTime}
                />
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
        </form>
      </div>
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapturePhoto}
      />
    </div>
  );
}

