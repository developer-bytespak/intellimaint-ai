"use client";

import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { startSTT } from "@/hooks/useSTT";
import { speak, stopAllAudio } from "@/hooks/useTTS";

interface CallingModalProps {
  isOpen: boolean;
  onClose: () => void;
  websocketUrl: string;
}

export default function CallingModal({
  isOpen,
  onClose,
  websocketUrl,
}: CallingModalProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<"listening" | "processing" | "speaking">("listening");

  const ws = useWebSocket(websocketUrl);
  const sttRef = useRef<null | { stop: () => void }>(null);

  // ---------------- START CALL ----------------
  useEffect(() => {
    if (!isOpen || !ws.isConnected) return;

    console.log("📞 Call started");
    setIsCallActive(true);
    setStatus("listening");

    console.log("🎤 Starting STT...");

    // Start listening for user speech
    startSTT((finalText) => {
      console.log("✅ User finished speaking:", finalText);

      // User done speaking, now processing
      setStatus("processing");

      if (ws.isConnected) {
        ws.send(finalText);
        console.log("📤 Sent to backend:", finalText);
      } else {
        console.log("⚠️ WS not ready");
        setStatus("listening"); // Go back to listening
      }
    })
      .then((stt) => {
        sttRef.current = stt;
        console.log("✅ STT Ready");
      })
      .catch((err) => {
        console.error("❌ STT Failed:", err);
      });

    return () => {
      console.log("🧹 Cleaning up...");
      if (sttRef.current) {
        sttRef.current.stop();
      }
      sttRef.current = null;
      setStatus("listening");
    };
  }, [isOpen, ws.isConnected]);

  // ---------------- BOT RESPONSE ----------------
  useEffect(() => {
    if (!ws.lastText) return;

    console.log("🤖 Backend response:", ws.lastText);
    setStatus("speaking");

    // Convert to speech and play
    speak(ws.lastText)
      .then(() => {
        console.log("✅ Bot finished speaking");
        setStatus("listening"); // Ready for next input
      })
      .catch((err) => {
        console.error("❌ TTS Error:", err);
        setStatus("listening");
      });
  }, [ws.lastText]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isCallActive) {
      t = setInterval(() => {
        setCallDuration((p) => p + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isCallActive]);

  // ---------------- END CALL ----------------
  const handleEnd = () => {
    console.log("📞 Ending call...");

    if (sttRef.current) {
      sttRef.current.stop();
    }
    sttRef.current = null;

    stopAllAudio();

    setIsCallActive(false);
    setStatus("listening");
    setCallDuration(0);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#1f2632] rounded-2xl p-8 max-w-md w-full border border-[#3a4a5a] shadow-2xl">
        
        {/* Header */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          {ws.isConnected ? "Voice Call Active" : "Connecting..."}
        </h2>

        {/* Avatar */}
        <div className="flex justify-center my-8">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all duration-300
            ${
              status === "speaking"
                ? "bg-blue-500 animate-pulse scale-110 shadow-lg shadow-blue-500/50"
                : status === "processing"
                ? "bg-yellow-500 animate-spin"
                : "bg-purple-600"
            }`}
          >
            {status === "speaking" ? "" : status === "processing" ? "" : ""}
          </div>
        </div>

        {/* Status Display */}
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm mb-1">Status</div>
          <div className="text-white text-xl font-semibold">
            {status === "listening" && " Listening..."}
            {status === "processing" && " Processing..."}
            {status === "speaking" && " AI Speaking..."}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className="text-gray-400 text-sm mb-1">Duration</div>
          <div className="text-white font-mono text-3xl">
            {new Date(callDuration * 1000).toISOString().slice(14, 19)}
          </div>
        </div>

        {/* End Button */}
        <button
          onClick={handleEnd}
          className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
        >
          End Call
        </button>

        {/* Flow Indicator */}
        {/* <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="flex justify-between text-xs text-gray-500">
            <span className={status === "listening" ? "text-purple-400" : ""}>
              👂 Listen
            </span>
            <span className={status === "processing" ? "text-yellow-400" : ""}>
              ⚡ Process
            </span>
            <span className={status === "speaking" ? "text-blue-400" : ""}>
              🔊 Speak
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}