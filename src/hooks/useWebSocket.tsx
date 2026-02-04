// // "use client";

// // import { useEffect, useRef, useState } from "react";

// // export let sessionId = "";

// // export function useWebSocket(url: string) {

// //   const wsRef = useRef<WebSocket | null>(null);

// //   const [isConnected, setIsConnected] = useState(false);
// //   const [lastText, setLastText] = useState<string>("");


// //   useEffect(() => {

// //     if (!url) return;

// //     const ws = new WebSocket(url);

// //     wsRef.current = ws;


// //     ws.onopen = () => {
// //       setIsConnected(true);
// //       console.log("✅ WS connected");
// //     };


// //     ws.onmessage = (msg) => {

// //       if (typeof msg.data !== "string") return;

// //       const data = JSON.parse(msg.data);


// //       if (data.type === "session") {
// //         sessionId = data.sessionId;
// //       }


// //       if (data.type === "text") {
// //         setLastText(data.content);
// //       }


// //       if (data.type === "done") {
// //         console.log("🤖 Bot done");
// //       }
// //     };


// //     ws.onclose = () => {
// //       setIsConnected(false);
// //       console.log("🔌 WS closed");
// //     };


// //     return () => {
// //       ws.close();
// //       wsRef.current = null;
// //     };

// //   }, [url]);


// //   const send = (text: string) => {

// //     if (wsRef.current?.readyState !== WebSocket.OPEN) return;

// //     wsRef.current.send(JSON.stringify({
// //       type: "text",
// //       text,
// //       sessionId,
// //     }));
// //   };


// //   return {
// //     isConnected,
// //     lastText,
// //     send,
// //   };
// // }


// "use client";

// import { useEffect, useRef, useState } from "react";

// export let sessionId = "";

// export function useWebSocket(url: string) {
//   const wsRef = useRef<WebSocket | null>(null);

//   const [isConnected, setIsConnected] = useState(false);
//   const [lastText, setLastText] = useState<string>("");

//   useEffect(() => {
//     if (!url) return;

//     const ws = new WebSocket(url);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       setIsConnected(true);
//       console.log("✅ WS connected");
//     };

//     ws.onmessage = (msg) => {
//       if (typeof msg.data !== "string") return;

//       const data = JSON.parse(msg.data);

//       if (data.type === "session") {
//         sessionId = data.sessionId;
//       }

//       if (data.type === "text") {
//         setLastText(data.content);
//       }

//       if (data.type === "done") {
//         console.log("🤖 Bot done");
//       }
//     };

//     ws.onclose = () => {
//       setIsConnected(false);
//       console.log("🔌 WS closed");
//     };

//     return () => {
//       ws.close();
//       wsRef.current = null;
//     };
//   }, [url]);

//   const send = (text: string) => {
//     if (wsRef.current?.readyState !== WebSocket.OPEN) return;

//     wsRef.current.send(
//       JSON.stringify({
//         type: "text",
//         text,
//         sessionId,
//       })
//     );
//   };

//   // 🔌 Close WebSocket manually
//   const close = () => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.close();
//       console.log("🔌 Manually closed WS connection");
//     }
//   };

//   return {
//     isConnected,
//     lastText,
//     send,
//     close, // ✅ Export close method
//   };
// }


"use client";

import { useEffect, useRef, useState } from "react";

// Global variable for backward compatibility (can be accessed by other modules)
let globalSessionId = "";

export function useWebSocket(url: string, initialSessionId: string = '') {
  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastText, setLastText] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const [sessionId, setSessionId] = useState<string>(initialSessionId); // Initialize with provided sessionId

  // Sync sessionId when prop changes
  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId);
      console.log('🔄 SessionId updated from prop:', initialSessionId);
    } else {
      console.log('🔄 No initial sessionId provided (new chat)');
    }
  }, [initialSessionId]);

  // Log current sessionId state whenever it changes
  useEffect(() => {
    console.log('🔐 Current sessionId state:', sessionId || 'NOT SET (waiting for backend)');
  }, [sessionId]);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("✅ WS connected");
    };

    ws.onmessage = (msg) => {
      if (typeof msg.data !== "string") {
        console.log('📦 Received non-string data:', msg.data);
        return;
      }

      console.log('📥 Raw backend message:', msg.data.slice(0, 200)); // Log first 200 chars
      
      const data = JSON.parse(msg.data);
      console.log('📨 Parsed backend data:', { 
        type: data.type, 
        token: data.token || null,
        response: data.response?.slice(0, 100) || null,
        content: data.content?.slice(0, 100) || null,
        sessionId: data.sessionId || null,
        fakeSessionId: data.fakeSessionId || null
      });

      if (data.type === "session") {
        // Extract sessionId - backend sends it as either 'sessionId' or 'fakeSessionId'
        const newSessionId = data.sessionId || data.fakeSessionId;
        console.log("🔐 Session ID message received:", newSessionId);
        console.log("🔐 From backend - sessionId:", data.sessionId, "fakeSessionId:", data.fakeSessionId);
        // Update global variable for backward compatibility
        globalSessionId = newSessionId;
        // Update React state
        setSessionId(newSessionId);
        console.log("🔐 Session ID state updated to:", newSessionId);
      }

      // Handle streaming tokens from backend
      if (data.type === "chunk" && data.token) {
        console.log("🎯 Chunk token received:", data.token);
        setLastText(data.token); // Set ONLY current token (not accumulated)
        console.log("✅ Current token set for TTS:", data.token);
      }

      // Handle final response from backend
      // NOTE: We skip setting lastText here because final response is duplicate of chunks
      // The chunks are already queued for TTS playback, so we don't need to queue final again
      if (data.type === "final" && data.response) {
        console.log("🏁 Final response received:", data.response?.slice(0, 100));
        console.log("⏭️ Skipping final response TTS (chunks already queued)");
        // Do NOT setLastText here - avoid duplicate TTS
      }

      // Legacy support: Handle old "text" type with "content" field
      if (data.type === "text") {
        console.log("💬 Text message received:", data.content?.slice(0, 100));
        // Don't add "DONE" to speech queue
        if (data.content !== "DONE") {
          setLastText(data.content);
          console.log("✅ Text set for TTS:", data.content?.slice(0, 50));
        }
      }

      if (data.type === "done") {
        console.log("🤖 Bot done message received");
        setIsDone(true);
        // Reset isDone after a short delay
        setTimeout(() => setIsDone(false), 100);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("🔌 WS closed");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [url]);

  const send = (text: string, passedSessionId?: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    // ✅ CRITICAL: Use passed sessionId if provided (from parent), otherwise use internal state
    // This ensures explicit sessionId propagation without timing issues
    const finalSessionId = passedSessionId !== undefined ? passedSessionId : sessionId;
    
    if (finalSessionId) {
      console.log('📤 SENDING WITH SESSION ID:', { finalSessionId, text: text.slice(0, 50) });
      wsRef.current.send(
        JSON.stringify({
          text,
          sessionId: finalSessionId,
        })
      );
    } else {
      console.log('📤 SENDING PLAIN TEXT (NO SESSION ID):', text.slice(0, 50));
      wsRef.current.send(text);
    }
  };

  // 🔌 Close WebSocket manually
  const close = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      console.log("🔌 Manually closed WS connection");
    }
  };

  return {
    isConnected,
    lastText,
    isDone,
    send,
    close,
    sessionId, // 🔐 Expose sessionId for use in components
  };
}