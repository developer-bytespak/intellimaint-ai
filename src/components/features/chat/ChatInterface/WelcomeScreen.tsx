'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageDocument, Chat, ImageUploadState } from '@/types/chat';
import CameraModal from './CameraModal';
import AudioRecorder from './AudioRecorder';
import { useAudioRecorder } from './useAudioRecorder';
import { useAudio } from '@/hooks/useAudio';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useVoiceStream } from '@/hooks/useVoiceStream';
import MessageList from './MessageList';
import AttachmentPreview from './AttachmentPreview';
import { useUser } from '@/hooks/useUser';

interface WelcomeScreenProps {
  activeChat?: Chat | null;
  onSendMessage?: (content: string, images?: string[], documents?: MessageDocument[], chatOverride?: Chat, editingMessageId?: string | null) => void;
  isSending?: boolean;
  streamingText?: { [messageId: string]: string };
  streamingMessageId?: string | null;
  stopStreaming?: () => void;
  startEditingMessage?: (messageId: string) => { content: string; images?: string[]; documents?: MessageDocument[]; } | null;
  editingMessageId?: string | null;
  setEditingMessageId?: (id: string | null) => void;
}

export default function WelcomeScreen({ 
  activeChat, 
  onSendMessage, 
  isSending = false, 
  streamingText = {}, 
  streamingMessageId = null,
  stopStreaming,
  startEditingMessage,
  editingMessageId,
  setEditingMessageId,
}: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [imageUploadStates, setImageUploadStates] = useState<ImageUploadState[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<MessageDocument[]>([]);
  const [showPinMenu, setShowPinMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();

  // WebSocket connection for calling
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
  const {
    isConnected: isWebSocketConnected,
    disconnect: disconnectWebSocket,
    send: wsSend,
    stopAudio,
  } = useWebSocket(isCallActive ? websocketUrl : '');

  // Voice stream for STT/TTS during calls
  const {
    startStreaming: startVoiceStream,
    stopStreaming: stopVoiceStream,
  } = useVoiceStream(isCallActive ? websocketUrl : '', {
    externalSend: wsSend,
    externalIsConnected: isWebSocketConnected,
    // Handle user interrupt - stop bot audio
    onUserInterrupt: () => {
      console.log("🎤 User interrupted - bot audio stopped, STT resuming");
    },
    // Stop bot audio when user speaks during bot speech
    onStopAudio: stopAudio,
  });

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      imageUploadStates.forEach(state => {
        if (state.previewUrl && !state.previewUrl.startsWith('data:') && !state.previewUrl.startsWith('http')) {
          URL.revokeObjectURL(state.previewUrl);
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

  // Start STT when call is connected
  useEffect(() => {
    console.log("📞 Call effect - isCallActive:", isCallActive, "isWebSocketConnected:", isWebSocketConnected);
    
    if (isCallActive && isWebSocketConnected) {
      console.log("📞 Call is active and websocket is connected, starting STT...");
      
      const timer = setTimeout(() => {
        console.log("📞 Calling startVoiceStream()...");
        startVoiceStream();
      }, 100);
      
      return () => clearTimeout(timer);
    }

    return () => {
      if (isCallActive) {
        console.log("📞 Call is active but websocket not connected, stopping streaming...");
        stopVoiceStream();
      }
    };
  }, [isCallActive, isWebSocketConnected, startVoiceStream, stopVoiceStream]);

  // Check if any image is still uploading
  const isUploading = imageUploadStates.some(state => state.status === 'uploading');
  
  // Handle editing message - populate input when editingMessageId changes
  useEffect(() => {
    if (editingMessageId && activeChat && startEditingMessage) {
      const messageData = startEditingMessage(editingMessageId);
      if (messageData) {
        setInputValue(messageData.content);
        // Note: images and documents from edited message would need to be handled separately
        // For now, we'll just populate the text content
      }
    } else if (!editingMessageId && inputValue) {
      // Clear input when not editing (optional - you might want to keep the input)
    }
  }, [editingMessageId, activeChat, startEditingMessage]);

  // Auto-focus textarea when activeChat is available
  useEffect(() => {
    if (activeChat && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [activeChat]);
  
  const handleEditMessage = (messageId: string) => {
    if (startEditingMessage) {
      startEditingMessage(messageId);
    }
  };
  
  const handleSubmit = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    e?.preventDefault();
    // Don't allow sending if images are still uploading
    if (isUploading) return;
    if (!inputValue.trim() && imageUploadStates.length === 0 && selectedDocuments.length === 0) return;
    
    if (onSendMessage) {
      // Use uploaded URLs, fallback to preview URLs if upload failed
      const imageUrls = imageUploadStates.map(state => 
        state.uploadedUrl || state.previewUrl
      );
      
      onSendMessage(
        inputValue.trim(), 
        imageUrls.length > 0 ? imageUrls : undefined, 
        selectedDocuments.length > 0 ? selectedDocuments : undefined,
        undefined,
        editingMessageId || undefined
      );
      setInputValue('');
      setImageUploadStates([]);
      setSelectedDocuments([]);
      if (setEditingMessageId) {
        setEditingMessageId(null);
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '24px';
      }
    }
  };

  const handleOpenGallery = () => {
    fileInputRef.current?.click();
  };

  // Global key handler — focus textarea when typing anywhere outside inputs
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      if (!tgt) return;
      const tag = tgt.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tgt.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Only handle printable characters, backspace and enter
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
        if (!textareaRef.current) return;
        e.preventDefault();
        textareaRef.current.focus();

        if (e.key.length === 1) {
          setInputValue(prev => prev + e.key);
        } else if (e.key === 'Backspace') {
          setInputValue(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleSubmit]);

  const handleOpenDocumentUpload = () => {
    documentInputRef.current?.click();
  };

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCapturePhoto = (url: string) => {
    // Create upload state and start uploading immediately
    const newState: ImageUploadState = {
      previewUrl: url,
      status: 'uploading',
      progress: undefined, // Don't show 0%, wait for actual progress
    };
    setImageUploadStates(prev => {
      const updated = [...prev, newState].slice(0, 10);
      // Start uploading with the correct index
      const index = updated.length - 1;
      setTimeout(() => uploadImage(url, index), 0);
      return updated;
    });
  };

  // Upload image immediately when selected
  const uploadImage = async (previewUrl: string, index: number) => {
    if (!user?.id) {
      console.error('User ID not available for image upload');
      setImageUploadStates(prev => prev.map((state, i) => 
        i === index ? { ...state, status: 'error', error: 'User not authenticated' } : state
      ));
      return;
    }

    try {
      // Convert blob URL to File
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], `chat-image-${Date.now()}-${index}.jpg`, { type: blob.type });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      let hasProgress = false;
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && e.total > 0) {
          hasProgress = true;
          const progress = Math.round((e.loaded / e.total) * 100);
          // Only update if progress is meaningful (avoid showing 100% immediately)
          if (progress > 0 && progress < 100) {
            setImageUploadStates(prev => prev.map((state, i) => 
              i === index ? { ...state, progress } : state
            ));
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          // Only set progress to 100 if we actually tracked progress, otherwise remove it
          setImageUploadStates(prev => prev.map((state, i) => 
            i === index ? { 
              ...state, 
              uploadedUrl: data.url, 
              status: 'completed',
              progress: hasProgress ? 100 : undefined
            } : state
          ));
        } else {
          const error = JSON.parse(xhr.responseText);
          setImageUploadStates(prev => prev.map((state, i) => 
            i === index ? { ...state, status: 'error', error: error.error || 'Upload failed' } : state
          ));
        }
      });

      xhr.addEventListener('error', () => {
        setImageUploadStates(prev => prev.map((state, i) => 
          i === index ? { ...state, status: 'error', error: 'Network error' } : state
        ));
      });

      xhr.open('POST', '/api/upload-image');
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageUploadStates(prev => prev.map((state, i) => 
        i === index ? { ...state, status: 'error', error: 'Failed to upload image' } : state
      ));
    }
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
    
    const currentLength = imageUploadStates.length;
    const newStates: ImageUploadState[] = [];
    
    for (let i = 0; i < files.length && (currentLength + newStates.length) < 10; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        const newState: ImageUploadState = {
          previewUrl,
          status: 'uploading',
          progress: undefined, // Don't show 0%, wait for actual progress
        };
        newStates.push(newState);
      }
    }
    
    setImageUploadStates(prev => {
      const updated = [...prev, ...newStates].slice(0, 10);
      // Start uploading each new image with correct indices
      newStates.forEach((state, offset) => {
        const index = currentLength + offset;
        setTimeout(() => uploadImage(state.previewUrl, index), 0);
      });
      return updated;
    });
    
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
    const state = imageUploadStates[index];
    if (state.previewUrl && !state.previewUrl.startsWith('data:') && !state.previewUrl.startsWith('http')) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setImageUploadStates(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocumentAt = (index: number) => {
    const doc = selectedDocuments[index];
    URL.revokeObjectURL(doc.url);
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Use audio hook for backend API calls
  const { sendAudio, isSending: isSendingAudio } = useAudio();

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

  // Check if we should show welcome content or messages
  const showWelcomeContent = !activeChat || activeChat.messages.length === 0;

  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-full overflow-hidden relative">
      {/* Header with Logo and Name - Show when chat is active, fixed at top on mobile */}
      {!showWelcomeContent && (
        <div className="fixed top-0 left-0 right-0 sm:hidden z-20 bg-[#1f2632] px-3 py-2 flex items-center gap-2 border-b border-[#2a3441]">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <img 
              src="/Intelliment LOgo.png" 
              alt="IntelliMaint AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-sm font-semibold text-white">IntelliMaint AI</h1>
        </div>
      )}

      {/* Show Welcome Content only when no active chat or chat has no messages */}
      {showWelcomeContent ? (
        <div className="flex-1 overflow-y-auto items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 flex">
          <div className="max-w-2xl lg:max-w-4xl text-center space-y-3 sm:space-y-4 md:space-y-6 w-full px-2 sm:px-4">
            {/* Logo or Icon */}
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                <img 
                  src="/Intelliment LOgo.png" 
                  alt="IntelliMaint AI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Welcome Text */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white px-2">Welcome to IntelliMaint AI</h1>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
              <div className="bg-[#2a3441] p-3 sm:p-4 md:p-5 rounded-xl hover:bg-[#3a4a5a] transition-colors duration-200">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Fast Response</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Get instant AI-powered answers</p>
              </div>
              <div className="bg-[#2a3441] p-3 sm:p-4 md:p-5 rounded-xl hover:bg-[#3a4a5a] transition-colors duration-200">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Expert Knowledge</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Access comprehensive maintenance data</p>
              </div>
              <div className="bg-[#2a3441] p-3 sm:p-4 md:p-5 rounded-xl hover:bg-[#3a4a5a] transition-colors duration-200 sm:col-span-2 lg:col-span-1">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">24/7 Available</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Always here when you need help</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Show Message List when chat has messages - Constrained to prompt width */
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 chat-scrollbar">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-14 sm:pt-8 pb-4">
            <MessageList 
              activeChat={activeChat} 
              isSending={isSending}
              streamingText={streamingText}
              streamingMessageId={streamingMessageId}
              onEditMessage={handleEditMessage}
            />
          </div>
        </div>
      )}

      {/* ChatGPT-like Prompt Interface - Fixed at Bottom */}
      <div className="shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-[#2a3441] bg-[#1f2632]">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto" noValidate>
          <div className="bg-[#2a3441] rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 py-3 sm:py-3 md:py-4 flex flex-col w-full">
            {/* Attachment Preview - Shows uploaded images and documents */}
            <AttachmentPreview
              imageUploadStates={imageUploadStates}
              documents={selectedDocuments}
              onRemoveImage={removeImageAt}
              onRemoveDocument={removeDocumentAt}
              onViewImage={(index) => setViewingImageIndex(index)}
            />
            
            {/* Audio Recorder UI - Shows when recording or audio ready */}
            {(audioRecorder.isRecording || audioRecorder.audioUrl) && (
              <div className="mb-3">
                {!isSending && !isSendingAudio && (
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
            
            {/* Input Field Wrapper - Keeps placeholder and icons aligned in sequence */}
            <div className="flex items-end gap-2 w-full">
              <textarea
                ref={textareaRef}
                value={inputValue || ''}
                onChange={(e) => {
                  setInputValue(e.target.value || '');
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  isCallActive
                    ? "On a call..."
                    : isSendingAudio
                    ? "Transcribing audio..."
                    : (audioRecorder.isRecording || audioRecorder.audioUrl)
                    ? "Recording audio..."
                    : "Ask Intellimaint AI."
                }
                disabled={isCallActive || audioRecorder.isRecording || !!audioRecorder.audioUrl || isSending || isSendingAudio}
                rows={1}
                className={`flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base leading-6 resize-none overflow-y-auto max-h-40 scrollbar-chatgpt py-2 ${
                  (isCallActive || audioRecorder.isRecording || audioRecorder.audioUrl || isSending || isSendingAudio)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              />

              {/* Right side icons: Plus/Call, Send (when typing), and Voice (Microphone) - Fixed in sequence */}
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
                {/* Conditional: Plus Icon Button OR Loading/End Call Button */}
                {isCallActive ? (
                  // Call is Active - Show Loading or End Call based on connection
                  isWebSocketConnected ? (
                    // Connected - Show End Call Button
                    <button
                      type="button"
                      onClick={() => {
                        setIsCallActive(false);
                        disconnectWebSocket();
                      }}
                      disabled={false}
                      className="p-1.5 sm:p-2 rounded-lg bg-transparent  text-white hover:text-white border border-white/20 hover:text-white/50 transition-colors duration-200 flex items-center gap-1.5"
                      title="End Call"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h12v12H6z"/>
                      </svg>
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">End</span>
                    </button>
                  ) : (
                    // Connecting - Show Loading
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-xs text-blue-300 ml-1">Connecting...</span>
                    </div>
                  )
                ) : (
                  // Call is Inactive - Show Plus Icon with Dropdown
                  <div className="relative pin-dropdown">
                    <button
                      type="button"
                      onClick={() => setShowPinMenu(!showPinMenu)}
                      disabled={audioRecorder.isRecording || !!audioRecorder.audioUrl || isSending || isSendingAudio}
                      className={`p-1.5 sm:p-2 rounded-lg hover:bg-[#3a4a5a] hover:text-white transition-colors duration-200 ${
                        (audioRecorder.isRecording || audioRecorder.audioUrl || isSending || isSendingAudio) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="More Options"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    
                    {/* Plus Dropdown Menu */}
                    {showPinMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#1f2632] border border-[#3a4a5a] rounded-lg shadow-lg p-1.5 sm:p-2 z-100">
                        <div className="flex gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            className="p-1.5 sm:p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                            onClick={() => { setShowPinMenu(false); handleOpenCamera(); }}
                            title="Camera"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          
                          <button
                            type="button"
                            className="p-1.5 sm:p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                            onClick={() => {
                              setShowPinMenu(false);
                              setIsCallActive(true);
                            }}
                            title="Call"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </button>
                          
                          <button
                            type="button"
                            className="p-1.5 sm:p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                            onClick={() => { setShowPinMenu(false); handleOpenGallery(); }}
                            title="Gallery"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          
                          <button
                            type="button"
                            className="p-1.5 sm:p-2 hover:bg-[#3a4a5a] text-white rounded-lg transition-all duration-200"
                            onClick={() => { setShowPinMenu(false); handleOpenDocumentUpload(); }}
                            title="Upload PDF/DOC"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Stop Button (when streaming or sending) or Send Button (when typing or attachments present) or Voice Button (Microphone) - Right side */}
                {(streamingMessageId || isSending) && stopStreaming ? (
                  // Show stop button when streaming or sending
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      stopStreaming();
                    }}
                    className="p-1.5 sm:p-2 rounded-lg transition-colors duration-200 bg-red-500 hover:bg-red-600 text-white"
                    title="Stop generating"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </button>
                ) : (inputValue.trim() || imageUploadStates.length > 0 || selectedDocuments.length > 0) ? (
                  <button
                    type="submit"
                    disabled={audioRecorder.isRecording || !!audioRecorder.audioUrl || isSending || isSendingAudio || isUploading}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
                      isUploading 
                        ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } ${
                      (audioRecorder.isRecording || audioRecorder.audioUrl || isSending || isSendingAudio) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={isUploading ? 'Uploading images...' : 'Send message'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                ) : !isCallActive ? (
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
                ) : null}
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

      {/* Image Overlay */}
      {viewingImageIndex !== null && imageUploadStates[viewingImageIndex] && (
        <div 
          className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setViewingImageIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
            title="Close"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <img
            src={imageUploadStates[viewingImageIndex].previewUrl}
            alt={`preview-${viewingImageIndex}`}
            className="max-w-[85%] max-h-[75vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error('Failed to load image:', imageUploadStates[viewingImageIndex].previewUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}

