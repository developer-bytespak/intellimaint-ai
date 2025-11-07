import { useState, useRef, useEffect } from 'react';
import { MessageDocument } from '@/types/chat';

export function useAudioRecorder(onSendAudio: (audioDocument: MessageDocument) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioMimeTypeRef = useRef<string>('audio/webm');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const shouldSendOnStopRef = useRef<boolean>(false);
  const isCancelingRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const analyzeAudio = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevels = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Create waveform bars (40 bars for visualization)
      const barCount = 40;
      const levels: number[] = [];
      const step = Math.floor(bufferLength / barCount);
      
      for (let i = 0; i < barCount; i++) {
        const index = i * step;
        const value = dataArray[index] || 0;
        levels.push(value / 255); // Normalize to 0-1
      }
      
      setAudioLevels(levels);
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };
    
    updateLevels();
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
        // If canceling, don't process the recording
        if (isCancelingRef.current) {
          isCancelingRef.current = false;
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: audioMimeTypeRef.current });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop audio analysis but keep the last levels for visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        // Keep audioLevels for playback visualization
        
        // If stopAndSend was called, send the audio now
        if (shouldSendOnStopRef.current) {
          shouldSendOnStopRef.current = false;
          setTimeout(() => {
            const mimeType = audioMimeTypeRef.current;
            let extension = 'webm';
            if (mimeType.includes('ogg')) extension = 'ogg';
            else if (mimeType.includes('mp4')) extension = 'm4a';
            else if (mimeType.includes('mpeg')) extension = 'mp3';

            const audioFile = new File([audioBlob], `recording-${Date.now()}.${extension}`, { type: mimeType });
            const audioUrlForDoc = URL.createObjectURL(audioBlob);

            const audioDocument: MessageDocument = {
              file: audioFile,
              url: audioUrlForDoc,
              type: 'AUDIO'
            };

            onSendAudio(audioDocument);

            // Cleanup
            setAudioUrl(null);
            setAudioBlob(null);
            setRecordingTime(0);
            setAudioLevels([]);
          }, 50);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioLevels([]);

      // Clear any existing timer first
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Reset time to 0
      setRecordingTime(0);

      // Start timer - update exactly every 1000ms (1 second)
      // Use a timestamp to ensure accurate 1-second intervals
      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(elapsed);
      }, 1000);

      // Start audio analysis for waveform
      analyzeAudio();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    // Clear timer first to prevent any further updates
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop audio analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const stopAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Set flag to send when recording stops
      shouldSendOnStopRef.current = true;
      stopRecording();
    } else if (audioBlob) {
      // If already stopped, send immediately
      handleSendAudio();
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setRecordingTime(0);
      }
      await startRecording();
    }
  };

  const handleStartRecording = async () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
      setRecordingTime(0);
    }
    await startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendAudio = () => {
    if (audioBlob) {
      const mimeType = audioMimeTypeRef.current;
      let extension = 'webm';
      if (mimeType.includes('ogg')) extension = 'ogg';
      else if (mimeType.includes('mp4')) extension = 'm4a';
      else if (mimeType.includes('mpeg')) extension = 'mp3';

      const audioFile = new File([audioBlob], `recording-${Date.now()}.${extension}`, { type: mimeType });
      const audioUrlForDoc = URL.createObjectURL(audioBlob);

      const audioDocument: MessageDocument = {
        file: audioFile,
        url: audioUrlForDoc,
        type: 'AUDIO'
      };

      // Pass audio document to parent component
      onSendAudio(audioDocument);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      setAudioBlob(null);
      setRecordingTime(0);
      setAudioLevels([]);
    }
  };

  const handleCancel = () => {
    // Set cancel flag to prevent onstop handler from processing
    isCancelingRef.current = true;
    
    // Reset send flag to prevent auto-sending
    shouldSendOnStopRef.current = false;
    
    // Stop recording if active
    if (isRecording && mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Ignore errors if already stopped
      }
      setIsRecording(false);
    }
    
    // Stop audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Cleanup audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Clear all state immediately
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setAudioLevels([]);
    
    // Clear audio chunks to prevent any leftover data
    audioChunksRef.current = [];
  };

  return {
    isRecording,
    recordingTime,
    audioUrl,
    audioLevels,
    handleToggleRecording,
    handleStartRecording,
    stopRecording,
    stopAndSend,
    handleSendAudio,
    handleCancel,
    formatTime
  };
}

