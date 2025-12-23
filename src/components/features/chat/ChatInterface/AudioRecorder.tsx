'use client';

interface AudioRecorderProps {
  variant?: 'button' | 'ui';
  isRecording: boolean;
  recordingTime: number;
  audioUrl: string | null;
  handleStartRecording: () => Promise<void>;
  stopAndSend: () => void;
  handleSendAudio: () => void;
  handleCancel: () => void;
  formatTime: (seconds: number) => string;
}

export default function AudioRecorder({ 
  variant = 'ui',
  isRecording,
  recordingTime,
  audioUrl,
  handleStartRecording,
  stopAndSend,
  handleSendAudio,
  handleCancel,
  formatTime
}: AudioRecorderProps) {

  // Show button variant
  if (variant === 'button') {
    if (!isRecording && !audioUrl) {
      return (
        <button
          type="button"
          onClick={handleStartRecording}
          className="p-2 sm:p-2 hover:bg-[#3a4a5a] hover:text-white rounded-lg transition-all duration-200"
          title="Start Recording"
        >
          <svg className="w-4 h-4 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      );
    }
    return null;
  }

  // Show UI variant (recording/playback controls)
  if (!isRecording && !audioUrl) {
    return null;
  }

  return (
    <div className="w-full bg-[#2a3441] rounded-full px-4 py-3 flex items-center gap-3">
      {/* Plus/Add Icon - Left */}
      <button
        type="button"
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        title="Add"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Recording Text with Time - Center */}
      <div className="flex-1 flex items-center justify-center gap-2 h-8 px-2">
        {isRecording ? (
          <>
            <span className="text-red-500 text-sm font-medium">Start recording</span>
            <span className="text-red-500 text-sm font-mono">{formatTime(recordingTime)}</span>
          </>
        ) : audioUrl ? (
          <>
            <span className="text-white text-sm font-medium">Recording ready</span>
            <span className="text-white text-sm font-mono">{formatTime(recordingTime)}</span>
          </>
        ) : null}
      </div>

      {/* Action Buttons - Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Cancel Button (X) */}
        <button
          type="button"
          onClick={handleCancel}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Cancel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Send/Confirm Button (Checkmark) */}
        <button
          type="button"
          onClick={isRecording ? stopAndSend : handleSendAudio}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Send"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          src={audioUrl}
          className="hidden"
        />
      )}
    </div>
  );
}

