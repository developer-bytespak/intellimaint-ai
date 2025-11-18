'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AudioPlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioKey = searchParams.get('key');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Retrieve audio URL from sessionStorage using the key
  useEffect(() => {
    if (audioKey) {
      try {
        const storedUrl = sessionStorage.getItem(audioKey);
        if (storedUrl) {
          setAudioUrl(storedUrl);
          // Clean up sessionStorage after retrieving (optional)
          // sessionStorage.removeItem(audioKey);
        } else {
          console.error('Audio data not found in sessionStorage');
        }
      } catch (error) {
        console.error('Error retrieving audio from sessionStorage:', error);
      }
    }
  }, [audioKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    router.back();
  };

  if (!audioKey || !audioUrl) {
    return (
      <div className="min-h-screen bg-[#1f2632] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {!audioKey ? 'No audio key provided' : 'Audio file not found'}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f2632] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-[#2a3441] rounded-lg transition-colors"
            title="Go Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold">Audio Player</h1>
        </div>

        {/* Audio Player Card */}
        <div className="bg-[#2a3441] rounded-2xl p-6 sm:p-8 shadow-lg">
          {/* Audio Element */}
          <audio ref={audioRef} src={audioUrl} preload="metadata" />

          {/* Play/Pause Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isPlaying ? (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-[#1f2632] rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #1f2632 ${(currentTime / (duration || 1)) * 100}%, #1f2632 100%)`
              }}
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-[#1f2632] rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #1f2632 ${volume * 100}%, #1f2632 100%)`
              }}
            />
            <span className="text-sm text-gray-400 w-12 text-right">{Math.round(volume * 100)}%</span>
          </div>

          {/* Audio Info */}
          <div className="mt-6 pt-6 border-t border-[#3a4a5a]">
            <p className="text-gray-400 text-sm">Playing audio recording</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudioPlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1f2632] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading audio player...</p>
        </div>
      </div>
    }>
      <AudioPlayerContent />
    </Suspense>
  );
}

