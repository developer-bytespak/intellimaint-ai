"use client";
import { useEffect, useRef, useState } from "react";

const DEBUG = process.env.NODE_ENV === 'development';

export let sessionId="";

export function useWebSocket(url: string, options?: { onError?: (error: Event | string) => void }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectRef = useRef<number | null>(null);
  const manualDisconnectRef = useRef<boolean>(false);
  const [lastTextMessage, setLastTextMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<(string | Blob | ArrayBuffer)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingAudioRef = useRef(false);

  // ✅ Fixed: Return Promise that resolves when audio finishes
  const playAudioBlob = async (blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // Store audio reference for interruption
      audioRef.current = audio;
      isPlayingAudioRef.current = true;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        isPlayingAudioRef.current = false;
      };

      audio.onended = () => {
        if (DEBUG) console.log("✅ Audio playback finished");
        cleanup();
        resolve();
      };

      audio.onerror = (err) => {
        console.error("❌ Audio playback error:", err);
        cleanup();
        reject(err);
      };

      audio.play().catch((err) => {
        console.error("❌ Audio play failed:", err);
        cleanup();
        reject(err);
      });
    });
  };

  // ✅ Stop audio playback (for interruption)
  const stopAudio = () => {
    if (audioRef.current) {
      if (DEBUG) console.log("🛑 Stopping bot audio - user interrupt");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      isPlayingAudioRef.current = false;
    }
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

    // Ensure any in-flight audio stops immediately
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
      console.log("🔌 [useWebSocket.connect()] URL is empty?:", url === "");
      
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
        console.error("❌ [useWebSocket] Attempted URL:", url);
        console.error("❌ [useWebSocket] Error type:", err.type);
        console.error("❌ [useWebSocket] ReadyState:", wsRef.current?.readyState);
        if (options?.onError) {
          options.onError(err);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 [useWebSocket] Connection closed");
        console.log("🔌 [useWebSocket] Close code:", event.code);
        console.log("🔌 [useWebSocket] Close reason:", event.reason);
        console.log("🔌 [useWebSocket] Was clean?:", event.wasClean);
        setIsConnected(false);
      };

      ws.onmessage = async (msg) => {
        try {
          if (DEBUG) console.log("🔵 Backend Response Received");
          console.log("WebSocket message data:", msg.data);

          setMessages((prev) => [...prev, msg.data]);

          // ✅ Audio blob - Fixed timing
          if (msg.data instanceof Blob) {
            if (DEBUG) console.log("🔊 TTS Audio Blob received");

            // 1️⃣ Signal to pause mic
            window.dispatchEvent(new Event("pause-mic"));

            try {
              // 2️⃣ Wait for audio to finish playing
              await playAudioBlob(msg.data);
            } catch (err) {
              console.error("Audio playback failed:", err);
            } finally {
              // 3️⃣ Resume mic AFTER audio finishes
              window.dispatchEvent(new Event("resume-mic"));
            }
          }
          // Text message
          else if (typeof msg.data === "string") {
            if (DEBUG) console.log("📩 Text message received:", msg.data);
            try {
              const parsed = JSON.parse(msg.data);
              // ✅ If fakeSessionId exists, update state
              // console.log("Parsed message:", parsed);
              if (parsed.fakeSessionId) {
                // if (DEBUG) console.log("✅ Setting sessionId:", parsed.fakeSessionId);
                // ✅ Inject into URL params as 'chat'
                // const currentUrl = new URL(window.location.href);
                // currentUrl.searchParams.set("chat", parsed.fakeSessionId);
                // window.history.replaceState({}, "", currentUrl.toString());
                sessionId = parsed.fakeSessionId;

              }

            } catch {
              if (DEBUG) console.log("📝 Plain Text Response");
            }
            setLastTextMessage(msg.data);
          }
          // ArrayBuffer fallback
          else if (msg.data instanceof ArrayBuffer) {
            if (DEBUG) console.log("🔊 ArrayBuffer received");
            const blob = new Blob([msg.data], { type: "audio/mpeg" });

            window.dispatchEvent(new Event("pause-mic"));

            try {
              await playAudioBlob(blob);
            } finally {
              window.dispatchEvent(new Event("resume-mic"));
            }
          } else {
            console.log("⚠️ Unknown message type:", typeof msg.data);
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

        // If we got disconnected while audio was playing, stop it.
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


