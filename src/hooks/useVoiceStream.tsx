import { useRef, useEffect } from "react";
import { useWebSocket } from "./useWebSocket";

const DEBUG = process.env.NODE_ENV === "development";

interface UseVoiceStreamOptions {
  externalSend?: (data: string) => void;
  externalIsConnected?: boolean;
  onUserInterrupt?: () => void;
  onStopAudio?: () => void;
}

export function useVoiceStream(
  websocketUrl: string,
  options?: UseVoiceStreamOptions
) {
  const internalWs = useWebSocket(options?.externalSend ? "" : websocketUrl);
  const send = options?.externalSend || internalWs.send;
  const isConnected =
    options?.externalIsConnected !== undefined
      ? options.externalIsConnected
      : internalWs.isConnected;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const isBotSpeakingRef = useRef(false);
  const hasInterruptedRef = useRef(false);

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
    };

    recognition.onerror = (e) => {
      console.error("❌ STT error:", e);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // ✅ Detect voice activity during bot speech
      if (isBotSpeakingRef.current && !hasInterruptedRef.current) {
        const hasInterimResults = Array.from(event.results).some(
          (result) => !result.isFinal
        );

        if (hasInterimResults) {
          if (DEBUG) console.log("🎤 User started speaking - interrupting bot");

          // Stop bot audio
          if (options?.onStopAudio) {
            console.log("🛑 Calling onStopAudio to stop bot audio");
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

        // TODO: Commenting out backend send for debugging
        console.log("📤 Would send to backend:", {
          type: "final_text",
          text: finalText.trim(),
        });
        send(
          JSON.stringify({
            type: "final_text",
            text: finalText.trim(),
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
    if (DEBUG) {
      console.log("🎤 startStreaming called");
      console.log("isConnected:", isConnected);
      console.log("externalIsConnected:", options?.externalIsConnected);
      console.log("recognitionRef:", recognitionRef.current);
      console.log("isListeningRef:", isListeningRef.current);
    }

    if (!isConnected) {
      console.error("❌ WebSocket not connected, cannot start voice stream");
      return;
    }

    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start();
        if (DEBUG) console.log("✅ STT started successfully");
      } catch (error) {
        console.error("❌ Error starting STT:", error);
      }
    }
  };

  const stopStreaming = () => {
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
  };
}
