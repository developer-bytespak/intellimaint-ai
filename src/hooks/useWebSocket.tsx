// "use client";
// import { useEffect, useRef, useState } from "react";

// const DEBUG = process.env.NODE_ENV === 'development';

// export let sessionId = "";

// export function useWebSocket(url: string, options?: { onError?: (error: Event | string) => void }) {
//   const wsRef = useRef<WebSocket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const reconnectRef = useRef<number | null>(null);
//   const manualDisconnectRef = useRef<boolean>(false);
//   const [lastTextMessage, setLastTextMessage] = useState<string | null>(null);
//   const [messages, setMessages] = useState<(string | Blob | ArrayBuffer)[]>([]);
//   // const audioRef = useRef<HTMLAudioElement | null>(null);
//   // const isPlayingAudioRef = useRef(false);
//   const micPausedRef = useRef(false);


//   const audioQueueRef = useRef<Blob[]>([]);
//   const isPlayingRef = useRef(false);
//   const audioElRef = useRef<HTMLAudioElement | null>(null);
//   const audioBufferRef = useRef<Uint8Array[]>([]);
//   const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const getAudioEl = () => {
//     if (!audioElRef.current) {
//       audioElRef.current = new Audio();
//       audioElRef.current.onended = playNext;
//     }
//     return audioElRef.current;
//   };

//   const playBufferedAudio = () => {
//     if (audioBufferRef.current.length === 0) {
//       micPausedRef.current = false;
//       window.dispatchEvent(new Event("resume-mic"));
//       return;
//     }

//     // Combine all buffered chunks into one blob
//     const combinedData = new Uint8Array(
//       audioBufferRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
//     );
//     let offset = 0;
//     for (const chunk of audioBufferRef.current) {
//       combinedData.set(chunk, offset);
//       offset += chunk.length;
//     }

//     const audio = getAudioEl();
//     const combinedBlob = new Blob([combinedData], { type: 'audio/mpeg' });
//     const url = URL.createObjectURL(combinedBlob);

//     isPlayingRef.current = true;
//     audio.src = url;

//     console.log("🎵 Playing combined audio blob, total size:", combinedData.length);

//     audio.onended = () => {
//       console.log("✅ Audio playback finished");
//       URL.revokeObjectURL(url);
//       isPlayingRef.current = false;
//       audioBufferRef.current = [];
//       playNext();
//     };

//     audio.onerror = (err) => {
//       console.error("❌ Audio decode error:", err);
//       URL.revokeObjectURL(url);
//       isPlayingRef.current = false;
//       audioBufferRef.current = [];
//       playNext();
//     };

//     audio.play().catch((err) => {
//       console.error("❌ Audio play() failed:", err);
//       isPlayingRef.current = false;
//       audioBufferRef.current = [];
//       playNext();
//     });
//   };

//   const playNext = () => {
//     if (isPlayingRef.current) return;

//     const nextBlob = audioQueueRef.current.shift();
//     if (!nextBlob) {
//       if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
//       bufferTimeoutRef.current = null;

//       // Play any remaining buffered data
//       if (audioBufferRef.current.length > 0) {
//         console.log("📦 Playing remaining buffered chunks");
//         playBufferedAudio();
//       } else {
//         console.log("✅ Audio queue empty - resuming mic");
//         micPausedRef.current = false;
//         window.dispatchEvent(new Event("resume-mic"));
//       }
//       return;
//     }

//     // Buffer the chunk instead of playing immediately
//     nextBlob.arrayBuffer().then((buffer) => {
//       audioBufferRef.current.push(new Uint8Array(buffer));

//       // Clear previous timeout
//       if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);

//       // Play after 300ms of buffering OR if queue is getting full
//       if (audioQueueRef.current.length === 0 || audioBufferRef.current.length >= 3) {
//         console.log("📤 Playing buffered audio (", audioBufferRef.current.length, "chunks)");
//         playBufferedAudio();
//       } else {
//         bufferTimeoutRef.current = setTimeout(() => {
//           if (audioBufferRef.current.length > 0) {
//             console.log("📤 Playing buffered audio after timeout");
//             playBufferedAudio();
//           }
//         }, 300);
//       }

//       playNext();
//     });
//   };



//   // // ✅ Fixed: Return Promise that resolves when audio finishes
//   // const playAudioBlob = async (blob: Blob): Promise<void> => {
//   //   return new Promise((resolve, reject) => {
//   //     const url = URL.createObjectURL(blob);
//   //     const audio = new Audio(url);

//   //     // Store audio reference for interruption
//   //     audioRef.current = audio;
//   //     isPlayingAudioRef.current = true;

//   //     const cleanup = () => {
//   //       URL.revokeObjectURL(url);
//   //       isPlayingAudioRef.current = false;
//   //     };

//   //     audio.onended = () => {
//   //       if (DEBUG) console.log("✅ Audio playback finished");
//   //       cleanup();
//   //       resolve();
//   //     };

//   //     audio.onerror = (err) => {
//   //       console.error("❌ Audio playback error:", err);
//   //       cleanup();
//   //       reject(err);
//   //     };

//   //     audio.play().catch((err) => {
//   //       console.error("❌ Audio play failed:", err);
//   //       cleanup();
//   //       reject(err);
//   //     });
//   //   });
//   // };

//   const stopAudio = () => {
//     // stop current playing audio
//     if (audioElRef.current) {
//       audioElRef.current.pause();
//       audioElRef.current.src = "";
//     }

//     // clear queue
//     audioQueueRef.current = [];
//     isPlayingRef.current = false;

//     // resume mic immediately
//     window.dispatchEvent(new Event("resume-mic"));

//     if (DEBUG) console.log("🛑 Audio queue stopped & cleared");
//   };


//   const send = (data: string | ArrayBuffer) => {
//     try {
//       if (wsRef.current?.readyState === WebSocket.OPEN) {
//         const dataSize =
//           data instanceof ArrayBuffer
//             ? data.byteLength
//             : typeof data === "string"
//               ? data.length
//               : 0;
//         const dataType =
//           data instanceof ArrayBuffer
//             ? "ArrayBuffer"
//             : typeof data === "string"
//               ? "String"
//               : "Unknown";

//         if (DEBUG) {
//           console.log(
//             `📤 WebSocket.send() called: ${dataType}, size: ${dataSize} bytes`
//           );
//         }

//         wsRef.current.send(data);

//         if (DEBUG) console.log(`✅ Data sent successfully`);
//       } else {
//         const readyState = wsRef.current?.readyState;
//         const stateNames: Record<number, string> = {
//           0: "CONNECTING",
//           1: "OPEN",
//           2: "CLOSING",
//           3: "CLOSED",
//         };
//         const stateName =
//           readyState !== undefined
//             ? stateNames[readyState] || "UNKNOWN"
//             : "UNDEFINED";
//         console.warn(
//           `⚠️ WebSocket not open. ReadyState: ${readyState} (${stateName})`
//         );
//       }
//     } catch (err) {
//       console.error("❌ WebSocket send error:", err);
//     }
//   };

//   const disconnect = () => {
//     if (DEBUG) console.log("🔌 Disconnecting WebSocket...");
//     manualDisconnectRef.current = true;

//     // Ensure any in-flight audio stops immediately
//     stopAudio();

//     if (reconnectRef.current !== null) {
//       window.clearTimeout(reconnectRef.current);
//       reconnectRef.current = null;
//     }

//     if (wsRef.current) {
//       wsRef.current.close();
//       wsRef.current = null;
//       setIsConnected(false);
//       if (DEBUG) console.log("✅ WebSocket disconnected");
//     }
//   };

//   const connect = () => {
//     try {
//       manualDisconnectRef.current = false;

//       console.log("🔌 [useWebSocket.connect()] Attempting WebSocket connection");
//       console.log("🔌 [useWebSocket.connect()] URL:", url);
//       console.log("🔌 [useWebSocket.connect()] URL is empty?:", url === "");

//       if (!url) {
//         console.log("⚠️ [useWebSocket.connect()] URL is empty, skipping connection");
//         return;
//       }

//       const ws = new WebSocket(url);
//       wsRef.current = ws;

//       ws.binaryType = "blob";

//       ws.onopen = () => {
//         console.log("✅ [useWebSocket] Connected successfully to:", url);
//         setIsConnected(true);
//         if (reconnectRef.current !== null) {
//           window.clearTimeout(reconnectRef.current);
//           reconnectRef.current = null;
//         }
//       };

//       ws.onerror = (err) => {
//         console.error("❌ [useWebSocket] Connection error:", err);
//         console.error("❌ [useWebSocket] Attempted URL:", url);
//         console.error("❌ [useWebSocket] Error type:", err.type);
//         console.error("❌ [useWebSocket] ReadyState:", wsRef.current?.readyState);
//         if (options?.onError) {
//           options.onError(err);
//         }
//       };

//       ws.onclose = (event) => {
//         console.log("🔌 [useWebSocket] Connection closed");
//         console.log("🔌 [useWebSocket] Close code:", event.code);
//         console.log("🔌 [useWebSocket] Close reason:", event.reason);
//         console.log("🔌 [useWebSocket] Was clean?:", event.wasClean);
//         setIsConnected(false);
//       };

//       ws.onmessage = async (msg) => {
//         try {
//           if (DEBUG) console.log("🔵 Backend Response Received");
//           console.log("WebSocket message data:", msg.data);

//           setMessages((prev) => [...prev, msg.data]);

//           // ✅ Audio blob - Fixed timing
//           // if (msg.data instanceof Blob) {
//           //   if (DEBUG) console.log("🔊 TTS Audio Blob received");

//           //   // 1️⃣ Signal to pause mic
//           //   window.dispatchEvent(new Event("pause-mic"));

//           //   try {
//           //     // 2️⃣ Wait for audio to finish playing
//           //     await playAudioBlob(msg.data);
//           //   } catch (err) {
//           //     console.error("Audio playback failed:", err);
//           //   } finally {
//           //     // 3️⃣ Resume mic AFTER audio finishes
//           //     window.dispatchEvent(new Event("resume-mic"));
//           //   }
//           // }
//           if (msg.data instanceof Blob) {
//             if (!micPausedRef.current) {
//               micPausedRef.current = true;
//               window.dispatchEvent(new Event("pause-mic"));
//             }

//             audioQueueRef.current.push(msg.data);
//             playNext();
//           }


//           // Text message
//           else if (typeof msg.data === "string") {
//             if (DEBUG) console.log("📩 Text message received:", msg.data);
//             try {
//               const parsed = JSON.parse(msg.data);

//               // ✅ Handle text responses
//               if (parsed.type === "text") {
//                 console.log("💬 LLM Response:", parsed.content);
//                 // Add to messages state
//                 setLastTextMessage((prev) => (prev || "") + " " + parsed.content);
//               }

//               // ✅ Handle session ID
//               if (parsed.type === "session" && parsed.sessionId) {
//                 sessionId = parsed.sessionId;
//                 console.log("🆕 Session set:", sessionId);
//               }

//               // ✅ Handle completion
//               if (parsed.type === "done") {
//                 console.log("✅ LLM Response Complete");
//               }
//             } catch {
//               if (DEBUG) console.log("📝 Plain Text Response");
//             }
//           }
//           // ArrayBuffer fallback
//           else if (msg.data instanceof ArrayBuffer) {
//             if (DEBUG) console.log("🔊 ArrayBuffer received");
//             const blob = new Blob([msg.data], { type: "audio/wav" });

//             window.dispatchEvent(new Event("pause-mic"));

//             try {
//               // await playAudioBlob(blob);
//             } finally {
//               window.dispatchEvent(new Event("resume-mic"));
//             }
//           } else {
//             console.log("⚠️ Unknown message type:", typeof msg.data);
//           }
//         } catch (err) {
//           console.error("❌ WS message handling error:", err);
//         }
//       };

//       ws.onclose = (event) => {
//         if (DEBUG) {
//           console.log("🔌 WebSocket disconnected", {
//             code: event.code,
//             reason: event.reason,
//             wasClean: event.wasClean,
//           });
//         }
//         setIsConnected(false);

//         // If we got disconnected while audio was playing, stop it.
//         stopAudio();

//         if (
//           url &&
//           url.trim() !== "" &&
//           !manualDisconnectRef.current &&
//           reconnectRef.current === null
//         ) {
//           if (DEBUG) console.log("🔄 Auto-reconnecting in 2 seconds...");
//           reconnectRef.current = window.setTimeout(() => {
//             reconnectRef.current = null;
//             connect();
//           }, 2000);
//         } else if (manualDisconnectRef.current) {
//           if (DEBUG) console.log("✅ Manual disconnect - no auto-reconnect");
//         }
//       };
//     } catch (err) {
//       console.error("❌ WebSocket creation error:", err);
//     }
//   };

//   useEffect(() => {
//     if (!url || url.trim() === "") return;

//     if (wsRef.current) {
//       manualDisconnectRef.current = false;
//       wsRef.current.close();
//       wsRef.current = null;
//     }
//     if (reconnectRef.current !== null) {
//       window.clearTimeout(reconnectRef.current);
//       reconnectRef.current = null;
//     }

//     connect();

//     return () => {
//       manualDisconnectRef.current = true;
//       stopAudio();
//       wsRef.current?.close();
//       if (reconnectRef.current !== null) {
//         window.clearTimeout(reconnectRef.current);
//         reconnectRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [url]);

//   return { isConnected, send, disconnect, lastTextMessage, messages, stopAudio };
// }




"use client";
import { useEffect, useRef, useState } from "react";

const DEBUG = process.env.NODE_ENV === 'development';

export let sessionId = "";

export function useWebSocket(url: string, options?: { onError?: (error: Event | string) => void }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectRef = useRef<number | null>(null);
  const manualDisconnectRef = useRef<boolean>(false);
  const [lastTextMessage, setLastTextMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<(string | Blob | ArrayBuffer)[]>([]);
  const micPausedRef = useRef(false);

  const audioQueueRef = useRef<Blob[]>([]);
  const isPlayingRef = useRef(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioBufferRef = useRef<Blob[]>([]);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioEl = () => {
    if (!audioElRef.current) {
      audioElRef.current = new Audio();
    }
    return audioElRef.current;
  };

  const playBufferedChunks = () => {
    if (audioBufferRef.current.length === 0 || isPlayingRef.current) return;

    const audio = getAudioEl();
    // Combine all buffered chunks into one blob
    const combinedBlob = new Blob(audioBufferRef.current, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(combinedBlob);

    console.log(`🎵 Playing ${audioBufferRef.current.length} chunks combined (${combinedBlob.size} bytes)`);

    isPlayingRef.current = true;
    audioBufferRef.current = [];
    audio.src = url;

    audio.onended = () => {
      console.log("✅ Audio chunk finished");
      URL.revokeObjectURL(url);
      isPlayingRef.current = false;
      playNext();
    };

    audio.onerror = (err) => {
      console.error("❌ Audio playback error:", err);
      URL.revokeObjectURL(url);
      isPlayingRef.current = false;
      playNext();
    };

    audio.play().catch((err) => {
      console.error("❌ Audio play() failed:", err);
      URL.revokeObjectURL(url);
      isPlayingRef.current = false;
      playNext();
    });
  };

  const playNext = () => {
    if (isPlayingRef.current) return;

    const nextBlob = audioQueueRef.current.shift();
    
    if (!nextBlob) {
      // Queue is empty, check if we have buffered chunks to play
      if (audioBufferRef.current.length > 0) {
        // Don't play yet if we haven't waited the minimum buffer time
        if (!bufferTimeoutRef.current) {
          console.log(`📦 Queue empty, ${audioBufferRef.current.length} chunk(s) buffered - waiting before play`);
          bufferTimeoutRef.current = setTimeout(() => {
            if (audioBufferRef.current.length > 0) {
              playBufferedChunks();
            }
            bufferTimeoutRef.current = null;
          }, 250);
        }
      } else {
        // No chunks buffered and queue empty
        if (bufferTimeoutRef.current) {
          clearTimeout(bufferTimeoutRef.current);
          bufferTimeoutRef.current = null;
        }
        console.log("✅ Audio queue empty - resuming mic");
        micPausedRef.current = false;
        window.dispatchEvent(new Event("resume-mic"));
      }
      return;
    }

    // Buffer the chunk
    audioBufferRef.current.push(nextBlob);
    console.log(`📥 Buffered chunk ${audioBufferRef.current.length} (${nextBlob.size} bytes)`);
    
    // If we already have a timeout set, don't create another
    if (bufferTimeoutRef.current) {
      return;
    }

    // Check if we have 3+ chunks
    if (audioBufferRef.current.length >= 3) {
      console.log(`✅ Reached 3 chunks, playing immediately`);
      playBufferedChunks();
      return;
    }

    // Set timeout to play whatever we have after delay
    console.log(`⏱️ Setting buffer timeout... (${audioBufferRef.current.length}/3 chunks)`);
    bufferTimeoutRef.current = setTimeout(() => {
      bufferTimeoutRef.current = null;
      if (audioBufferRef.current.length > 0 && !isPlayingRef.current) {
        console.log(`⏱️ Buffer timeout - playing ${audioBufferRef.current.length} buffered chunk(s)`);
        playBufferedChunks();
      }
    }, 250);
  };

  const stopAudio = () => {
    // Stop current playing audio
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = "";
    }

    // Clear all buffers and queue
    audioQueueRef.current = [];
    audioBufferRef.current = [];
    if (bufferTimeoutRef.current) {
      clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = null;
    }
    isPlayingRef.current = false;

    // Resume mic immediately
    micPausedRef.current = false;
    window.dispatchEvent(new Event("resume-mic"));

    if (DEBUG) console.log("🛑 Audio queue stopped & cleared");
  };

  const send = (data: string | ArrayBuffer) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const dataSize =
          data instanceof ArrayBuffer
            ? data.byteLength
            : typeof data === "string"
              ? data.length
              : 0;
        const dataType =
          data instanceof ArrayBuffer
            ? "ArrayBuffer"
            : typeof data === "string"
              ? "String"
              : "Unknown";

        if (DEBUG) {
          console.log(
            `📤 WebSocket.send() called: ${dataType}, size: ${dataSize} bytes`
          );
        }

        wsRef.current.send(data);

        if (DEBUG) console.log(`✅ Data sent successfully`);
      } else {
        const readyState = wsRef.current?.readyState;
        const stateNames: Record<number, string> = {
          0: "CONNECTING",
          1: "OPEN",
          2: "CLOSING",
          3: "CLOSED",
        };
        const stateName =
          readyState !== undefined
            ? stateNames[readyState] || "UNKNOWN"
            : "UNDEFINED";
        console.warn(
          `⚠️ WebSocket not open. ReadyState: ${readyState} (${stateName})`
        );
      }
    } catch (err) {
      console.error("❌ WebSocket send error:", err);
    }
  };

  const disconnect = () => {
    if (DEBUG) console.log("🔌 Disconnecting WebSocket...");
    manualDisconnectRef.current = true;

    stopAudio();

    if (reconnectRef.current !== null) {
      window.clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      if (DEBUG) console.log("✅ WebSocket disconnected");
    }
  };

  const connect = () => {
    try {
      manualDisconnectRef.current = false;

      console.log("🔌 [useWebSocket.connect()] Attempting WebSocket connection");
      console.log("🔌 [useWebSocket.connect()] URL:", url);

      if (!url) {
        console.log("⚠️ [useWebSocket.connect()] URL is empty, skipping connection");
        return;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.binaryType = "blob";

      ws.onopen = () => {
        console.log("✅ [useWebSocket] Connected successfully to:", url);
        setIsConnected(true);
        if (reconnectRef.current !== null) {
          window.clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onerror = (err) => {
        console.error("❌ [useWebSocket] Connection error:", err);
        if (options?.onError) {
          options.onError(err);
        }
      };

      ws.onmessage = async (msg) => {
        try {
          if (DEBUG) console.log("🔵 Backend Response Received");
          console.log("WebSocket message data:", msg.data);

          setMessages((prev) => [...prev, msg.data]);

          // ✅ Audio blob handling
          if (msg.data instanceof Blob) {
            // ✅ FIX 2: Validate blob size
            if (msg.data.size === 0) {
              console.warn("⚠️ Received empty audio blob, skipping");
              return;
            }

            // Pause mic on first audio chunk
            if (!micPausedRef.current) {
              micPausedRef.current = true;
              window.dispatchEvent(new Event("pause-mic"));
            }

            // Add to queue
            audioQueueRef.current.push(msg.data);
            
            // Start playing if not already
            if (!isPlayingRef.current) {
              playNext();
            }
          }
          // Text message
          else if (typeof msg.data === "string") {
            if (DEBUG) console.log("📩 Text message received:", msg.data);
            try {
              const parsed = JSON.parse(msg.data);

              // Handle text responses
              if (parsed.type === "text") {
                console.log("💬 LLM Response:", parsed.content);
                setLastTextMessage((prev) => (prev || "") + " " + parsed.content);
              }

              // Handle session ID
              if (parsed.type === "session" && parsed.sessionId) {
                sessionId = parsed.sessionId;
                console.log("🆕 Session set:", sessionId);
              }

              // Handle completion
              if (parsed.type === "done") {
                console.log("✅ LLM Response Complete");
              }
            } catch {
              if (DEBUG) console.log("📝 Plain Text Response");
            }
          }
        } catch (err) {
          console.error("❌ WS message handling error:", err);
        }
      };

      ws.onclose = (event) => {
        if (DEBUG) {
          console.log("🔌 WebSocket disconnected", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
        }
        setIsConnected(false);

        stopAudio();

        if (
          url &&
          url.trim() !== "" &&
          !manualDisconnectRef.current &&
          reconnectRef.current === null
        ) {
          if (DEBUG) console.log("🔄 Auto-reconnecting in 2 seconds...");
          reconnectRef.current = window.setTimeout(() => {
            reconnectRef.current = null;
            connect();
          }, 2000);
        } else if (manualDisconnectRef.current) {
          if (DEBUG) console.log("✅ Manual disconnect - no auto-reconnect");
        }
      };
    } catch (err) {
      console.error("❌ WebSocket creation error:", err);
    }
  };

  useEffect(() => {
    if (!url || url.trim() === "") return;

    if (wsRef.current) {
      manualDisconnectRef.current = false;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectRef.current !== null) {
      window.clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    connect();

    return () => {
      manualDisconnectRef.current = true;
      stopAudio();
      wsRef.current?.close();
      if (reconnectRef.current !== null) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { isConnected, send, disconnect, lastTextMessage, messages, stopAudio };
}