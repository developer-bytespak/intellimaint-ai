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
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudioLevel, setCurrentAudioLevel] = useState(0);
  const [animationCounter, setAnimationCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioMimeTypeRef = useRef<string>('audio/webm');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Animation counter for waveform
  useEffect(() => {
    if (!isRecording || isPaused) return;
    
    const interval = setInterval(() => {
      setAnimationCounter(prev => prev + 1);
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

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
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Stop recording if still active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
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

  const analyzeAudio = () => {
    if (!analyserRef.current || !isRecording || isPaused) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording || isPaused) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average level for pulsing effect
      const sum = Array.from(dataArray).reduce((a, b) => a + b, 0);
      const average = sum / bufferLength / 255; // Normalize to 0-1
      
      setCurrentAudioLevel(average);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio context for visualization
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      source.connect(analyser);
      
      // Check for supported mime types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      audioMimeTypeRef.current = selectedMimeType || 'audio/webm';
      
      const options: MediaRecorderOptions = {};
      if (selectedMimeType) {
        options.mimeType = selectedMimeType;
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: audioMimeTypeRef.current });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop audio analysis
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        if (!isPaused) {
          setRecordingTime(prev => prev + 1);
        }
      }, 1000);
      
      // Start audio analysis for waveform
      analyzeAudio();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAnimationCounter(0);
      
      // Stop audio analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        analyzeAudio();
      } else {
        mediaRecorderRef.current.pause();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };
  
  const handleToggleVoice = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      // If there's a previous recording, clear it
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setRecordingTime(0);
      }
      await startRecording();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSendAudio = () => {
    if (audioBlob) {
      // Get file extension based on mime type
      const mimeType = audioMimeTypeRef.current;
      let extension = 'webm';
      if (mimeType.includes('ogg')) extension = 'ogg';
      else if (mimeType.includes('mp4')) extension = 'm4a';
      else if (mimeType.includes('mpeg')) extension = 'mp3';
      
      // Create a File object from the blob
      const audioFile = new File([audioBlob], `recording-${Date.now()}.${extension}`, { type: mimeType });
      const audioUrlForDoc = URL.createObjectURL(audioBlob);
      
      // Create a MessageDocument for the audio
      const audioDocument: MessageDocument = {
        file: audioFile,
        url: audioUrlForDoc,
        type: 'AUDIO'
      };
      
      // Send the audio as a document
      onSendMessage('', undefined, [audioDocument]);
      
      // Cleanup
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      setAudioBlob(null);
      setRecordingTime(0);
      setCurrentAudioLevel(0);
      setAnimationCounter(0);
    }
  };
  
  const handleCancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setCurrentAudioLevel(0);
    setAnimationCounter(0);
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
            
            {/* Voice Recording Waveform */}
            {(isRecording || audioUrl) && (
              <div className="mb-3 flex items-center gap-2 transform transition-all duration-300 ease-out">
                {/* Mic Icon (shows while recording) */}
                {isRecording && (
                  <div className="flex-shrink-0">
                    <svg className={`w-5 h-5 ${isPaused ? 'text-gray-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </div>
                )}
                
                {/* Waveform Container */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#1f2632] border border-[#3a4a5a] rounded-lg">
                  {isRecording ? (
                    <>
                      {/* Waveform bars - pulsing effect */}
                      <div className="flex-1 flex items-center justify-center gap-0.5 h-8">
                        {Array.from({ length: 40 }).map((_, i) => {
                          // Create a pulsing effect based on audio level
                          const baseHeight = 6;
                          const maxHeight = 28;
                          // Use sine wave for smooth animation with audio level
                          const phase = (i / 40) * Math.PI * 2;
                          const timeOffset = animationCounter * 0.1;
                          const sineWave = Math.sin(phase + timeOffset);
                          // Audio level influences the middle bars more (like WhatsApp)
                          const centerDistance = Math.abs(i / 40 - 0.5);
                          const audioInfluence = currentAudioLevel * 18 * (1 - centerDistance * 1.5);
                          const height = Math.max(
                            baseHeight + (sineWave * 6) + audioInfluence,
                            baseHeight
                          );
                          
                          return (
                            <div
                              key={i}
                              className="bg-white rounded-full transition-all duration-100 ease-out"
                              style={{
                                width: '2px',
                                height: `${Math.min(height, maxHeight)}px`,
                                opacity: isPaused ? 0.3 : 0.85,
                              }}
                            />
                          );
                        })}
                      </div>
                      
                      {/* Time Display */}
                      <div className="flex-shrink-0 text-white text-sm font-mono min-w-[45px] text-right">
                        {formatTime(recordingTime)}
                      </div>
                      
                      {/* Pause Button */}
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:bg-[#3a4a5a] rounded-lg transition-colors"
                        title={isPaused ? 'Resume' : 'Pause'}
                      >
                        {isPaused ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Stop Button */}
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Stop"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 6h12v12H6z"/>
                        </svg>
                      </button>
                    </>
                  ) : audioUrl && (
                    <>
                      {/* Playback Controls */}
                      <button
                        type="button"
                        onClick={(e) => {
                          const audio = e.currentTarget.parentElement?.querySelector('audio') as HTMLAudioElement;
                          if (audio) {
                            if (audio.paused) {
                              audio.play();
                              setIsPaused(false);
                            } else {
                              audio.pause();
                              setIsPaused(true);
                            }
                          }
                        }}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:bg-[#3a4a5a] rounded-lg transition-colors"
                        title={isPaused ? 'Play' : 'Pause'}
                      >
                        {isPaused ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Hidden audio element for playback */}
                      <audio
                        src={audioUrl}
                        onEnded={() => setIsPaused(true)}
                        onPlay={() => setIsPaused(false)}
                        onPause={() => setIsPaused(true)}
                        className="hidden"
                      />
                      
                      {/* Time Display */}
                      <div className="flex-1 text-white text-sm font-mono text-center">
                        {formatTime(recordingTime)}
                      </div>
                      
                      {/* Send Button */}
                      <button
                        type="button"
                        onClick={handleSendAudio}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Send"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      
                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={handleCancelRecording}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:bg-[#3a4a5a] rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            
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
                    className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isRecording ? 'bg-red-600' : ''}`}
                    title={isRecording ? 'Stop Recording' : 'Voice'}
                    onClick={handleToggleVoice}
                  >
                    <svg className={`w-5 h-5 transition-colors duration-200 ${isRecording ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className={`p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200 ${isRecording ? 'bg-red-600' : ''}`}
                  title={isRecording ? 'Stop Recording' : 'Voice'}
                  onClick={handleToggleVoice}
                >
                  <svg className={`w-5 h-5 transition-colors duration-200 ${isRecording ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

