'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRef, useState } from 'react';
import { MessageDocument } from '@/types/chat';

interface TranscribeResponse {
  data: {
    transcription: string;
  };
}

export function useAudio() {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sendAudioMutation = useMutation({
    mutationFn: async (audioDocument: MessageDocument): Promise<TranscribeResponse> => {
      const formData = new FormData();
      formData.append('file', audioDocument.file, audioDocument.file.name);

      const response = await axios.post<TranscribeResponse>(
        'http://localhost:8000/api/v1/asr/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
  });

  const textToSpeechMutation = useMutation({
    mutationFn: async (text: string): Promise<Blob> => {
      const response = await axios.post(
        'http://localhost:8000/api/v1/asr/synthesize',
        { text },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      return response.data;
    },
  });

  const playAudio = (audioBlob: Blob, messageId: string) => {
    // Stop currently playing audio if any
    stopAudio();

    // Create audio URL from blob
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentPlayingId(messageId);

    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
      setCurrentPlayingId(null);
    });

    // Cleanup URL and state after audio finishes
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      setCurrentPlayingId(null);
      audioRef.current = null;
    };

    // Handle errors
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      setCurrentPlayingId(null);
      audioRef.current = null;
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setCurrentPlayingId(null);
    }
  };

  return {
    sendAudio: sendAudioMutation,
    isSending: sendAudioMutation.isPending,
    transcription: sendAudioMutation.data?.data?.transcription || null,
    textToSpeech: textToSpeechMutation,
    isLoading: textToSpeechMutation.isPending,
    currentPlayingId,
    playAudio,
    stopAudio,
  };
}

