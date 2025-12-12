"use client";

import { useEffect, useState } from "react";
import { useVoiceStream } from "@/hooks/useVoiceStream";
import { useWebSocket } from "@/hooks/useWebSocket";

interface CallingModalProps {
  isOpen: boolean;
  onClose: () => void;
  websocketUrl?: string;
}

export default function CallingModal({
  isOpen,
  onClose,
  websocketUrl = "",
}: CallingModalProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const effectiveUrl = isOpen && websocketUrl ? websocketUrl : "";

  const {
    isConnected,
    messages,
    disconnect: disconnectWebSocket,
    send: wsSend,
  } = useWebSocket(effectiveUrl);

  const {
    startStreaming,
    stopStreaming,
    isConnected: isVoiceConnected,
  } = useVoiceStream(effectiveUrl, {
    externalSend: wsSend,
    externalIsConnected: isConnected,
    // ✅ Handle user interrupt
    onUserInterrupt: () => {
      console.log("🎤 User interrupted bot - handled in modal");
    },
  });

  // Update call state
  useEffect(() => {
    if (isConnected && websocketUrl) {
      setIsCallActive(true);
    }
  }, [isConnected, websocketUrl]);

  // Start/stop streaming
  useEffect(() => {
    if (isCallActive && isConnected && websocketUrl) {
      console.log("📞 Starting voice stream...");
      startStreaming();
    }

    return () => {
      if (isCallActive) {
        console.log("📞 Stopping voice stream...");
        stopStreaming();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallActive, isConnected, websocketUrl]);

  // ✅ Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCallActive && isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, isConnected]);

  const handleEndCall = () => {
    console.log("📞 Ending call...");

    stopStreaming();
    disconnectWebSocket();
    setIsCallActive(false);
    setCallDuration(0);
    onClose();
  };

  // ✅ Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#1f2632] rounded-2xl p-8 sm:p-10 md:p-12 max-w-md w-full mx-4 border border-[#3a4a5a] shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleEndCall}
          className="absolute top-4 right-4 p-2 hover:bg-[#3a4a5a] rounded-full transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center space-y-6">
          {/* Avatar with animation */}
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full border-4 ${
                isConnected
                  ? "border-green-500 animate-ping"
                  : "border-blue-500 animate-pulse"
              } opacity-75`}
            ></div>
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
                isConnected ? "ring-4 ring-green-500/50" : ""
              }`}
            >
              <svg
                className="w-12 h-12 sm:w-14 sm:h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>

          {/* Status */}
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isConnected ? "Connected" : websocketUrl ? "Connecting..." : "Call"}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {isConnected
                ? "Voice call is active"
                : websocketUrl
                ? "Establishing connection..."
                : "WebSocket URL not configured"}
            </p>

            {/* Connection indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-yellow-500"
                } ${isConnected ? "animate-pulse" : "animate-ping"}`}
              ></div>
              <span className="text-xs text-gray-500">
                {isConnected ? "Connected" : "Connecting"}
              </span>
            </div>

            {/* ✅ Call duration */}
            {isCallActive && isConnected && (
              <div className="text-gray-400 text-lg font-mono pt-2">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            End Call
          </button>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 pt-4 border-t border-[#3a4a5a] text-xs text-gray-500 space-y-1">
            <p>WebSocket: {isConnected ? "✅ Connected" : "❌ Disconnected"}</p>
            <p>Voice Stream: {isVoiceConnected ? "✅ Active" : "❌ Inactive"}</p>
            <p>Messages: {messages.length}</p>
            <p>Duration: {formatDuration(callDuration)}</p>
          </div>
        )}
      </div>
    </div>
  );
}