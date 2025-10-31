'use client';

import { useRef, useEffect } from 'react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (url: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the video element at the start of the effect
    const videoElement = videoRef.current;

    const startCamera = async () => {
      try {
        // Try to get rear camera first, fallback to any available camera
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Use rear camera on mobile
          });
        } catch {
          // Fallback to default camera if rear camera is not available
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
        }
        streamRef.current = stream;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please check permissions.');
        onClose();
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [isOpen, onClose]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            onCapture(url);
            onClose();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[200] flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="max-w-full max-h-[80vh] object-contain"
          style={{ transform: 'scaleX(-1)' }} // Mirror the video like a real camera
        />

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Capture Button */}
        <button
          onClick={handleCapture}
          className="absolute bottom-8 bg-white rounded-full p-4 hover:bg-gray-200 transition-colors z-10"
          title="Capture Photo"
        >
          <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full"></div>
        </button>
      </div>
    </div>
  );
}

