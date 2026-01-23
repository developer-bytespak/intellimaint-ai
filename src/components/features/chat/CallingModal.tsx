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
}

export default function CallingModal({
  isOpen,
  onClose,
  websocketUrl,
  onEndCall,
}: CallingModalProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<"listening" | "processing" | "speaking">("listening");

  const ws = useWebSocket(websocketUrl);
  const sttRef = useRef<null | { stop: () => void; pause: () => void; resume: () => void }>(null);
  const isFirstResponse = useRef(true); // Track if this is the first response in a conversation turn

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

      // 🔒 PAUSE STT - User done speaking, now processing
      if (sttRef.current) {
        sttRef.current.pause();
        console.log("⏸️ STT paused during processing");
      }

      setStatus("processing");

      if (ws.isConnected) {
        ws.send(finalText);
        console.log("📤 Sent to backend:", finalText);
      } else {
        console.log("⚠️ WS not ready");
        setStatus("listening");
        // Resume STT if send failed
        if (sttRef.current) {
          sttRef.current.resume();
        }
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
    
    // Only set to speaking on first response chunk
    if (isFirstResponse.current) {
      setStatus("speaking");
      isFirstResponse.current = false;
      
      // ✅ Register callback to resume STT when ENTIRE queue is empty
      setOnQueueEmpty(() => {
        console.log("✅ All TTS finished - resuming STT");
        setStatus("listening");
        if (sttRef.current) {
          sttRef.current.resume();
          console.log("▶️ STT resumed - ready for input");
        }
        isFirstResponse.current = true; // Reset for next conversation turn
      });
    }

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

    setIsCallActive(false);
    setStatus("listening");
    setCallDuration(0);

    // Call onEndCall callback if provided
    if (onEndCall) {
      onEndCall();
    }

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
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all duration-300">
            <img src="/Intelliment LOgo.png" alt="Intelliment Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Status Display */}
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm mb-1">Status</div>
          <div className="text-white text-xl font-semibold flex items-center justify-center gap-2">
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
      </div>
    </div>
  );
}