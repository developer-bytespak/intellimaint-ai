// // "use client";

// // import { useEffect, useState, useRef } from "react";
// // import { useWebSocket } from "@/hooks/useWebSocket";
// // import { startSTT } from "@/hooks/useSTT";
// // import { speak, stopAllAudio } from "@/hooks/useTTS";

// // interface CallingModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   websocketUrl: string;
// // }

// // export default function CallingModal({
// //   isOpen,
// //   onClose,
// //   websocketUrl,
// // }: CallingModalProps) {
// //   const [isCallActive, setIsCallActive] = useState(false);
// //   const [callDuration, setCallDuration] = useState(0);
// //   const [status, setStatus] = useState<"listening" | "processing" | "speaking">("listening");

// //   const ws = useWebSocket(websocketUrl);
// //   const sttRef = useRef<null | { stop: () => void }>(null);

// //   // ---------------- START CALL ----------------
// //   useEffect(() => {
// //     if (!isOpen || !ws.isConnected) return;

// //     console.log("📞 Call started");
// //     setIsCallActive(true);
// //     setStatus("listening");

// //     console.log("🎤 Starting STT...");

// //     // Start listening for user speech
// //     startSTT((finalText) => {
// //       console.log("✅ User finished speaking:", finalText);

// //       // User done speaking, now processing
// //       setStatus("processing");

// //       if (ws.isConnected) {
// //         ws.send(finalText);
// //         console.log("📤 Sent to backend:", finalText);
// //       } else {
// //         console.log("⚠️ WS not ready");
// //         setStatus("listening"); // Go back to listening
// //       }
// //     })
// //       .then((stt) => {
// //         sttRef.current = stt;
// //         console.log("✅ STT Ready");
// //       })
// //       .catch((err) => {
// //         console.error("❌ STT Failed:", err);
// //       });

// //     return () => {
// //       console.log("🧹 Cleaning up...");
// //       if (sttRef.current) {
// //         sttRef.current.stop();
// //       }
// //       sttRef.current = null;
// //       setStatus("listening");
// //     };
// //   }, [isOpen, ws.isConnected]);

// //   // ---------------- BOT RESPONSE ----------------
// //   useEffect(() => {
// //     if (!ws.lastText) return;

// //     console.log("🤖 Backend response:", ws.lastText);
// //     setStatus("speaking");

// //     // Convert to speech and play
// //     speak(ws.lastText)
// //       .then(() => {
// //         console.log("✅ Bot finished speaking");
// //         setStatus("listening"); // Ready for next input
// //       })
// //       .catch((err) => {
// //         console.error("❌ TTS Error:", err);
// //         setStatus("listening");
// //       });
// //   }, [ws.lastText]);

// //   // ---------------- TIMER ----------------
// //   useEffect(() => {
// //     let t: NodeJS.Timeout;
// //     if (isCallActive) {
// //       t = setInterval(() => {
// //         setCallDuration((p) => p + 1);
// //       }, 1000);
// //     }
// //     return () => clearInterval(t);
// //   }, [isCallActive]);

// //   // ---------------- END CALL ----------------
// //   const handleEnd = () => {
// //     console.log("📞 Ending call...");

// //     if (sttRef.current) {
// //       sttRef.current.stop();
// //     }
// //     sttRef.current = null;

// //     stopAllAudio();

// //     setIsCallActive(false);
// //     setStatus("listening");
// //     setCallDuration(0);

// //     onClose();
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
// //       <div className="bg-[#1f2632] rounded-2xl p-8 max-w-md w-full border border-[#3a4a5a] shadow-2xl">
        
// //         {/* Header */}
// //         <h2 className="text-xl font-bold text-white text-center mb-2">
// //           {ws.isConnected ? "Voice Call Active" : "Connecting..."}
// //         </h2>

// //         {/* Avatar */}
// //         <div className="flex justify-center my-8">
// //           <div
// //             className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all duration-300
// //             `}
// //           >
// //             <img src="/Intelliment LOgo.png" alt="" />
// //           </div>
// //         </div>

// //         {/* Status Display */}
// //         <div className="text-center mb-4">
// //           <div className="text-gray-400 text-sm mb-1">Status</div>
// //           <div className="text-white text-xl font-semibold">
// //             {status === "listening" && " Listening..."}
// //             {status === "processing" && " Processing..."}
// //             {status === "speaking" && " AI Speaking..."}
// //           </div>
// //         </div>

// //         {/* Timer */}
// //         <div className="text-center mb-6">
// //           <div className="text-gray-400 text-sm mb-1">Duration</div>
// //           <div className="text-white font-mono text-3xl">
// //             {new Date(callDuration * 1000).toISOString().slice(14, 19)}
// //           </div>
// //         </div>

// //         {/* End Button */}
// //         <button
// //           onClick={handleEnd}
// //           className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
// //         >
// //           End Call
// //         </button>

// //         {/* Flow Indicator */}
// //         {/* <div className="mt-6 pt-4 border-t border-gray-600">
// //           <div className="flex justify-between text-xs text-gray-500">
// //             <span className={status === "listening" ? "text-purple-400" : ""}>
// //               👂 Listen
// //             </span>
// //             <span className={status === "processing" ? "text-yellow-400" : ""}>
// //               ⚡ Process
// //             </span>
// //             <span className={status === "speaking" ? "text-blue-400" : ""}>
// //               🔊 Speak
// //             </span>
// //           </div>
// //         </div> */}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useWebSocket } from "@/hooks/useWebSocket";
// import { startSTT } from "@/hooks/useSTT";
// import { speak, stopAllAudio } from "@/hooks/useTTS";

// interface CallingModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   websocketUrl: string;
// }

// export default function CallingModal({
//   isOpen,
//   onClose,
//   websocketUrl,
// }: CallingModalProps) {
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [status, setStatus] = useState<"listening" | "processing" | "speaking">("listening");

//   const ws = useWebSocket(websocketUrl);
//   const sttRef = useRef<null | { stop: () => void; pause: () => void; resume: () => void }>(null);

//   // ---------------- START CALL ----------------
//   useEffect(() => {
//     if (!isOpen || !ws.isConnected) return;

//     console.log("📞 Call started");
//     setIsCallActive(true);
//     setStatus("listening");

//     console.log("🎤 Starting STT...");

//     // Start listening for user speech
//     startSTT((finalText) => {
//       console.log("✅ User finished speaking:", finalText);

//       // 🔒 PAUSE STT - User done speaking, now processing
//       if (sttRef.current) {
//         sttRef.current.pause();
//         console.log("⏸️ STT paused during processing");
//       }

//       setStatus("processing");

//       if (ws.isConnected) {
//         ws.send(finalText);
//         console.log("📤 Sent to backend:", finalText);
//       } else {
//         console.log("⚠️ WS not ready");
//         setStatus("listening");
//         // Resume STT if send failed
//         if (sttRef.current) {
//           sttRef.current.resume();
//         }
//       }
//     })
//       .then((stt) => {
//         sttRef.current = stt;
//         console.log("✅ STT Ready");
//       })
//       .catch((err) => {
//         console.error("❌ STT Failed:", err);
//       });

//     return () => {
//       console.log("🧹 Cleaning up...");
//       if (sttRef.current) {
//         sttRef.current.stop();
//       }
//       sttRef.current = null;
//       setStatus("listening");
//     };
//   }, [isOpen, ws.isConnected]);

//   // ---------------- BOT RESPONSE ----------------
//   useEffect(() => {
//     if (!ws.lastText) return;

//     console.log("🤖 Backend response:", ws.lastText);
//     setStatus("speaking");

//     // Convert to speech and play
//     speak(ws.lastText)
//       .then(() => {
//         console.log("✅ Bot finished speaking");
        
//         // 🔓 RESUME STT - Bot done, ready for next input
//         setStatus("listening");
//         if (sttRef.current) {
//           sttRef.current.resume();
//           console.log("▶️ STT resumed - ready for input");
//         }
//       })
//       .catch((err) => {
//         console.error("❌ TTS Error:", err);
//         setStatus("listening");
//         // Resume STT even on error
//         if (sttRef.current) {
//           sttRef.current.resume();
//         }
//       });
//   }, [ws.lastText]);

//   // ---------------- TIMER ----------------
//   useEffect(() => {
//     let t: NodeJS.Timeout;
//     if (isCallActive) {
//       t = setInterval(() => {
//         setCallDuration((p) => p + 1);
//       }, 1000);
//     }
//     return () => clearInterval(t);
//   }, [isCallActive]);

//   // ---------------- END CALL ----------------
//   const handleEnd = () => {
//     console.log("📞 Ending call...");

//     // Stop STT
//     if (sttRef.current) {
//       sttRef.current.stop();
//       console.log("✅ STT stopped");
//     }
//     sttRef.current = null;

//     // Stop all audio
//     stopAllAudio();

//     // 🔌 Close backend WebSocket
//     ws.close();
//     console.log("🔌 Backend WS closed");

//     setIsCallActive(false);
//     setStatus("listening");
//     setCallDuration(0);

//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
//       <div className="bg-[#1f2632] rounded-2xl p-8 max-w-md w-full border border-[#3a4a5a] shadow-2xl">
        
//         {/* Header */}
//         <h2 className="text-xl font-bold text-white text-center mb-2">
//           {ws.isConnected ? "Voice Call Active" : "Connecting..."}
//         </h2>

//         {/* Avatar */}
//         <div className="flex justify-center my-8">
//           <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all duration-300">
//             <img src="/Intelliment LOgo.png" alt="Intelliment Logo" className="w-full h-full object-contain" />
//           </div>
//         </div>

//         {/* Status Display */}
//         <div className="text-center mb-4">
//           <div className="text-gray-400 text-sm mb-1">Status</div>
//           <div className="text-white text-xl font-semibold flex items-center justify-center gap-2">
//             {status === "listening" && (
//               <>
//                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                 Listening...
//               </>
//             )}
//             {status === "processing" && (
//               <>
//                 <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
//                 Processing...
//               </>
//             )}
//             {status === "speaking" && (
//               <>
//                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
//                 AI Speaking...
//               </>
//             )}
//           </div>
//         </div>

//         {/* Timer */}
//         <div className="text-center mb-6">
//           <div className="text-gray-400 text-sm mb-1">Duration</div>
//           <div className="text-white font-mono text-3xl">
//             {new Date(callDuration * 1000).toISOString().slice(14, 19)}
//           </div>
//         </div>

//         {/* End Button */}
//         <button
//           onClick={handleEnd}
//           className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
//         >
//           End Call
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { startSTT } from "@/hooks/useSTT";
import { speak, stopAllAudio, setOnQueueEmpty, isTTSPlaying } from "@/hooks/useTTS";

interface CallingModalProps {
  isOpen: boolean;
  onClose: () => void;
  websocketUrl: string;
  onEndCall?: () => void | Promise<void>;
  sessionId?: string; // Current chat session ID (for existing chats)
}

export default function CallingModal({
  isOpen,
  onClose,
  websocketUrl,
  onEndCall,
  sessionId = '', // Current chat session ID
}: CallingModalProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<"listening" | "processing" | "speaking">("listening");
  const [isSttReady, setIsSttReady] = useState(false); // Track STT initialization state
  const [isDeegramConnected, setIsDeegramConnected] = useState(false); // 🔵 Track Deepgram connection
  const [isEndingCall, setIsEndingCall] = useState(false); // Track if call is ending
  const [currentSessionId, setCurrentSessionId] = useState<string>(sessionId || ''); // ✅ Track sessionId from backend

  const ws = useWebSocket(websocketUrl, currentSessionId); // ✅ PASS CURRENT SESSION ID (not original prop)
  const sttRef = useRef<null | { stop: () => void; pause: () => void; resume: () => void }>(null);
  const currentSessionIdRef = useRef<string>(sessionId || ''); // ✅ Ref for latest sessionId
  const isNewChat = !sessionId; // 🆕 Track if this is a new chat (no sessionId initially)

  // ✅ CAPTURE SESSION ID FROM BACKEND
  // When backend responds with sessionId, store it locally for reuse in subsequent messages
  useEffect(() => {
    if (ws.sessionId && ws.sessionId !== currentSessionIdRef.current) {
      console.log('🔐 SessionId captured from backend:', ws.sessionId);
      console.log('   This will be reused for all messages in this call');
      setCurrentSessionId(ws.sessionId);
      currentSessionIdRef.current = ws.sessionId;
    }
  }, [ws.sessionId]);

  // ---------------- START CALL ----------------
  useEffect(() => {
    if (!isOpen || !ws.isConnected) return;

    console.log("📞 Call started");
    setIsCallActive(true);
    setStatus("listening");

    console.log("🎤 Starting STT...");

    // Start listening for user speech
    startSTT(
      (finalText) => {
        console.log("✅ User finished speaking:", finalText);

        // 🔒 PAUSE STT - User done speaking, now processing
        if (sttRef.current) {
          sttRef.current.pause();
          console.log("⏸️ STT paused during processing");
        }

        setStatus("processing");

        if (ws.isConnected) {
          // ✅ CRITICAL FIX: Pass sessionId explicitly to send()
          // This ensures even if useWebSocket state hasn't synced yet, we use the captured sessionId
          console.log('📤 Sending message with sessionId:', currentSessionIdRef.current || '(new - backend will assign)');
          ws.send(finalText, currentSessionIdRef.current || undefined);  // ✅ Pass captured sessionId
          console.log("📤 Sent to backend:", finalText);
        } else {
          console.log("⚠️ WS not ready");
          setStatus("listening");
          // Resume STT if send failed
          if (sttRef.current) {
            sttRef.current.resume();
          }
        }
      },
      () => {
        // 🔵 Deepgram connected callback
        console.log("🔵 Deepgram STT connected - updating state");
        setIsDeegramConnected(true);
      }
    )
      .then((stt) => {
        sttRef.current = stt;
        console.log("✅ STT Ready");
        setIsSttReady(true); // Mark STT as ready
      })
      .catch((err) => {
        console.error("❌ STT Failed:", err);
        setIsSttReady(false); // Mark STT as failed
      });

    return () => {
      console.log("🧹 Cleaning up...");
      if (sttRef.current) {
        sttRef.current.stop();
      }
      sttRef.current = null;
      setStatus("listening");
      setIsSttReady(false); // Reset STT ready state on cleanup
    };
  }, [isOpen, ws.isConnected]);

  // ---------------- BOT RESPONSE ----------------
  useEffect(() => {
    if (!ws.lastText) return;

    console.log("🤖 Backend response:", ws.lastText);
    
    // Set to speaking on every response
    setStatus("speaking");
    
    // ✅ Register callback to resume STT when ENTIRE queue is empty (for EVERY response)
    setOnQueueEmpty(() => {
      console.log("✅ All TTS finished - resuming STT");
      setStatus("listening");
      if (sttRef.current) {
        sttRef.current.resume();
        console.log("▶️ STT resumed - ready for input");
      }
    });

    // Add to TTS queue (non-blocking)
    speak(ws.lastText).catch((err) => {
      console.error("❌ TTS Error:", err);
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
    setIsEndingCall(true); // Show ending animation

    // Stop STT
    if (sttRef.current) {
      sttRef.current.stop();
      console.log("✅ STT stopped");
    }
    sttRef.current = null;

    // Stop all audio
    stopAllAudio();

    // 🔌 Close backend WebSocket
    ws.close();
    console.log("🔌 Backend WS closed");

    // Wait a moment before closing modal
    setTimeout(() => {
      setIsCallActive(false);
      setStatus("listening");
      setCallDuration(0);
      setIsEndingCall(false);

      // ✅ Use tracked sessionId (most reliable, updates throughout call)
      if (isNewChat && currentSessionIdRef.current) {
        console.log("💾 New chat - Navigating with sessionId:", currentSessionIdRef.current);
        console.log("   This ensures all messages are in same session");
        // Reload the page with the sessionId in the URL
        window.location.href = `/chat?chat=${encodeURIComponent(currentSessionIdRef.current)}`;
      } else {
        // Normal close for existing chats
        console.log("📭 Existing chat - closing normally");
        if (onEndCall) {
          onEndCall();
        }
        onClose();
      }
    }, 1000); // Show "Ending call..." for 1 second
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
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all duration-300">
            <img src="/Intelliment LOgo.png" alt="Intelliment Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Status Display */}
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm mb-1">Status</div>
          <div className="text-white text-xl font-semibold flex items-center justify-center gap-2">
            {isEndingCall ? (
              <>
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </span>
                <span className="ml-2">Ending Call...</span>
              </>
            ) : !isDeegramConnected ? (
              // 🔵 Keep showing Connecting until Deepgram is ready
              <>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                Connecting...
              </>
            ) : (
              <>
                {status === "listening" && (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Listening...
                  </>
                )}
                {status === "processing" && (
                  <>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Processing...
                  </>
                )}
                {status === "speaking" && (
                  <>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    AI Speaking...
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Timer - Only show after Deepgram is connected */}
        {isDeegramConnected && (
          <div className="text-center mb-6">
            <div className="text-gray-400 text-sm mb-1">Duration</div>
            <div className="text-white font-mono text-3xl">
              {new Date(callDuration * 1000).toISOString().slice(14, 19)}
            </div>
          </div>
        )}

        {/* End Button */}
        <button
          onClick={handleEnd}
          className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
        >
          End Call
        </button>
      </div>
    </div>
  );
}