'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRef, useState } from 'react';
import { MessageDocument } from '@/types/chat';
import { API_BASE } from '@/lib/api/axios';

interface TranscribeResponse {
  status: number;
  message: string;
  data: string; // The transcription text is directly in the data field
}

// Use the properly configured API_BASE which already includes /api/v1
const API_BASE_URL = API_BASE.replace(/\/api\/v1\/?$/, ''); // Remove /api/v1 since we'll add it in specific endpoints

export function useAudio() {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textToSpeechControllerRef = useRef<AbortController | null>(null);

  const sendAudioMutation = useMutation({
    mutationFn: async (audioDocument: MessageDocument): Promise<TranscribeResponse> => {
      const formData = new FormData();
      formData.append('file', audioDocument.file, audioDocument.file.name);

      const endpoint = '/api/v1/asr/transcribe';
      const fullUrl = `${API_BASE_URL}${endpoint}`;

      try {
        console.log(`[Audio] Sending transcription request to: ${fullUrl}`);
        const response = await axios.post<TranscribeResponse>(
          fullUrl,
          formData
          // Note: Don't set Content-Type header manually for FormData - axios sets it automatically with boundary
        );

        console.log('[Audio] Transcription successful:', response.data);
        return response.data;
      } catch (error) {
        // Log the raw error first
        console.error('[Audio] Raw error object:', error);
        console.error('[Audio] Error type:', typeof error);
        console.error('[Audio] Error constructor:', error?.constructor?.name);
        
        if (axios.isAxiosError(error)) {
          const errorResponse = error.response?.data;
          const status = error.response?.status;
          const hasResponse = !!error.response;
          
          // Log detailed error information with individual logs for better visibility
          console.error('[Audio] Transcription error details:');
          console.error('  URL:', fullUrl);
          console.error('  Has Response:', hasResponse);
          console.error('  Status:', status || 'N/A (no response)');
          console.error('  Status Text:', error.response?.statusText || 'N/A');
          console.error('  Error Code:', error.code || 'N/A');
          console.error('  Error Message:', error.message || 'N/A');
          console.error('  Response Data:', errorResponse || 'No response data');
          console.error('  Request Made:', error.request ? 'Yes' : 'No');
          
          // Also log as object for easier inspection
          const errorDetails = {
            url: fullUrl,
            hasResponse,
            status: status ?? null,
            statusText: error.response?.statusText ?? null,
            errorCode: error.code ?? null,
            errorMessage: error.message ?? null,
            responseData: errorResponse ?? null,
            requestMade: !!error.request
          };
          console.error('[Audio] Error details object:', errorDetails);

          // Handle network errors (no response from server)
          if (!hasResponse) {
            const errorMessage = error.code === 'ECONNREFUSED' 
              ? `Connection refused. The server at ${API_BASE_URL} is not reachable.\n\nPossible causes:\n1. Backend server is not running\n2. Wrong port number\n3. Firewall blocking the connection`
              : error.code === 'ERR_NETWORK'
              ? `Network error. Unable to reach ${API_BASE_URL}\n\nPossible causes:\n1. CORS issue - backend not allowing requests from frontend\n2. Network connectivity problem\n3. Backend server is down`
              : `Network error: ${error.message}\n\nTried to reach: ${fullUrl}\n\nPossible causes:\n1. Backend server is not running at ${API_BASE_URL}\n2. CORS is not configured on the backend\n3. Network connectivity issue`;
            
            throw new Error(errorMessage);
          }

          // Handle HTTP errors (server responded with error status)
          if (status === 404) {
            throw new Error(
              `API endpoint not found: ${fullUrl}\n\n` +
              `Possible solutions:\n` +
              `1. Check if your backend server is running at ${API_BASE_URL}\n` +
              `2. Verify the endpoint path in your backend code (might be /asr/transcribe, /api/asr/transcribe, etc.)\n` +
              `3. Check your backend route definitions to confirm the correct path\n` +
              `4. Ensure CORS is configured to allow requests from your frontend\n\n` +
              `Server response: ${JSON.stringify(errorResponse || 'No response data')}`
            );
          }
          
          throw new Error(
            `Failed to transcribe audio (${status}): ${error.response?.statusText || error.message}\n` +
            `Response: ${JSON.stringify(errorResponse || 'No response data')}`
          );
        } else {
          // Non-axios error
          console.error('[Audio] Non-axios error detected');
          console.error('[Audio] Error:', error);
          console.error('[Audio] Error type:', typeof error);
          console.error('[Audio] Is Error instance:', error instanceof Error);
          
          if (error instanceof Error) {
            console.error('[Audio] Error message:', error.message);
            console.error('[Audio] Error stack:', error.stack);
          }
          
          throw new Error(`Unexpected error during transcription: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
  });

  const textToSpeechMutation = useMutation({
    mutationFn: async (text: string): Promise<Blob> => {
      if (textToSpeechControllerRef.current) {
        textToSpeechControllerRef.current.abort();
      }

      const controller = new AbortController();
      textToSpeechControllerRef.current = controller;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/asr/synthesize`,
          { text },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            responseType: 'blob',
            signal: controller.signal,
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ERR_CANCELED') {
            throw new Error('SYNTHESIS_CANCELLED');
          }

          if (error.response?.status === 404) {
            throw new Error(`API endpoint not found. Please check if the backend server is running at ${API_BASE_URL} and the endpoint /api/v1/asr/synthesize exists.`);
          }
          throw new Error(`Failed to synthesize speech: ${error.response?.status} ${error.response?.statusText || error.message}`);
        }
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('SYNTHESIS_CANCELLED');
        }
        throw error;
      } finally {
        if (textToSpeechControllerRef.current === controller) {
          textToSpeechControllerRef.current = null;
        }
      }
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

  const cancelTextToSpeech = () => {
    if (textToSpeechControllerRef.current) {
      textToSpeechControllerRef.current.abort();
      textToSpeechControllerRef.current = null;
    }
    textToSpeechMutation.reset();
    stopAudio();
  };

  return {
    sendAudio: sendAudioMutation,
    isSending: sendAudioMutation.isPending,
    transcription: sendAudioMutation.data?.data || null,
    textToSpeech: textToSpeechMutation,
    isLoading: textToSpeechMutation.isPending,
    currentPlayingId,
    playAudio,
    stopAudio,
    cancelTextToSpeech,
  };
}

