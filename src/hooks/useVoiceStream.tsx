import { useRef, useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import { useParams, useSearchParams } from "next/navigation";

const DEBUG = process.env.NODE_ENV === "development";

interface UseVoiceStreamOptions {
  externalSend?: (data: string) => void;
  externalIsConnected?: boolean;
  onUserInterrupt?: () => void;
  onStopAudio?: () => void;
  onError?: (error: any) => void;
}

export function useVoiceStream(
  websocketUrl: string,
  options?: UseVoiceStreamOptions
) {
  const internalWs = useWebSocket(options?.externalSend ? "" : websocketUrl, {
    onError: options?.onError,
  });
  const params = useSearchParams();
  const chat = params?.get("chat") as string | undefined;
  // console.log("Chat ID in useVoiceStream:", chat);
  const send = options?.externalSend || internalWs.send;
  const isConnected =
    options?.externalIsConnected !== undefined
      ? options.externalIsConnected
      : internalWs.isConnected;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const isBotSpeakingRef = useRef(false);
  const hasInterruptedRef = useRef(false);
  const isExplicitlyStopped = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // -----------------------------
  // INIT SpeechRecognition
  // -----------------------------
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      alert("SpeechRecognition not supported in this browser");
      return;
    }

    const recognition: SpeechRecognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isListeningRef.current = true;
      if (DEBUG) console.log("🎤 STT started");
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (DEBUG) console.log("🛑 STT stopped");

      // Auto-restart if not explicitly stopped by user AND not paused for bot speech
      if (!isExplicitlyStopped.current && !isBotSpeakingRef.current) {
        if (DEBUG) console.log("🔄 Auto-restarting STT...");
        try {
          recognition.start();
        } catch (e) {
          // ignore
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") {
        // Ignore, let onend handle restart
        return;
      }
      console.error("❌ STT error:", e);
      if (options?.onError) {
        options.onError(e);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const hasInterimResults = Array.from(event.results).some(
        (result) => !result.isFinal
      );

      // ✅ Clear processing state when user starts speaking
      if (hasInterimResults) {
        setIsProcessing(false);
      }

      // ✅ Detect voice activity during bot speech
      if (isBotSpeakingRef.current && !hasInterruptedRef.current) {
        if (hasInterimResults) {
          if (DEBUG) console.log("🎤 User started speaking - interrupting bot");

          // Stop bot audio
          if (options?.onStopAudio) {
            options.onStopAudio();
            if (DEBUG) console.log("🛑 Bot audio stopped");
          }

          // Mark as interrupted
          hasInterruptedRef.current = true;

          // Send interrupt message to backend
          send(
            JSON.stringify({
              type: "interrupt",
            })
          );

          // Trigger callback
          if (options?.onUserInterrupt) {
            options.onUserInterrupt();
          }
        }
      }

      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript + " ";
        }
      }

      if (finalText.trim()) {
        if (DEBUG) console.log("📝 Final text:", finalText);

        // Set processing state
        setIsProcessing(true);

        // TODO: Commenting out backend send for debugging
        console.log("📤 Would send to backend:", {
          type: "final_text",
          text: finalText.trim(),
        });
        send(
          JSON.stringify({
            type: "final_text",
            text: finalText.trim(),
            sessionId: chat || null,
          })
        );
      }
    };

    recognitionRef.current = recognition;
  }, [send]);

  // -----------------------------
  // Pause / Resume mic (bot speech)
  // -----------------------------
  useEffect(() => {
    const pauseMic = () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
        isBotSpeakingRef.current = true;
        hasInterruptedRef.current = false;
        if (DEBUG) console.log("⏸️ Mic paused - bot is speaking");
      }
    };

    const resumeMic = () => {
      if (recognitionRef.current && !isListeningRef.current) {
        recognitionRef.current.start();
        isBotSpeakingRef.current = false;
        hasInterruptedRef.current = false;
        if (DEBUG) console.log("▶️ Mic resumed");
      }
    };

    window.addEventListener("pause-mic", pauseMic);
    window.addEventListener("resume-mic", resumeMic);

    return () => {
      window.removeEventListener("pause-mic", pauseMic);
      window.removeEventListener("resume-mic", resumeMic);
    };
  }, []);

  // -----------------------------
  // Controls
  // -----------------------------
  const startStreaming = async () => {
    if (!isConnected) {
      alert("WebSocket not connected");
      return;
    }

    isExplicitlyStopped.current = false;

    if (recognitionRef.current && !isListeningRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopStreaming = () => {
    isExplicitlyStopped.current = true;

    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }

    // TODO: Commenting out backend send for debugging
    console.log("📤 Would send to backend:", {
      type: "stop",
    });
    console.log("📞 Voice stream stopped.", "stop");
    send(
      JSON.stringify({
        type: "stop",
      })
    );
  };

  return {
    startStreaming,
    stopStreaming,
    isConnected,
    isProcessing,
    setIsProcessing,
  };
}
