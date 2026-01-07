import { useRef, useEffect, useState } from "react";
import { sessionId, useWebSocket } from "./useWebSocket";
import { useParams, useSearchParams } from "next/navigation";

const DEBUG = process.env.NODE_ENV === "development";

interface UseVoiceStreamOptions {
  externalSend?: (data: string) => void;
  externalIsConnected?: boolean;
  onUserInterrupt?: () => void;
  onStopAudio?: () => void;
  onListeningChange?: (isListening: boolean) => void;  // ✅ YEH ADD KARO
  onUserSpeaking?: (isSpeaking: boolean) => void
  onError?: (error: any) => void;
}



export function useVoiceStream(
  websocketUrl: string,
  options?: UseVoiceStreamOptions
) {
  const internalWs = useWebSocket(options?.externalSend ? "" : websocketUrl, {
    onError: options?.onError,
  });

  // console.log("useVoiceStream internalWs:", internalWs);

  const params = useSearchParams();
  let chat = params?.get("chat") as string | undefined;
  // console.log("useVoiceStream chat param:", sessionId);
  // if(!chat && sessionId) chat = sessionId;
  const send = options?.externalSend || internalWs.send;
  const isConnected =
    options?.externalIsConnected !== undefined
      ? options.externalIsConnected
      : internalWs.isConnected;


  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(false);


  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const isBotSpeakingRef = useRef(false);
  const hasInterruptedRef = useRef(false);
  const isExplicitlyStopped = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // const {} = useWebSocket();

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
      options?.onListeningChange?.(true);
      if (DEBUG) console.log("🎤 STT started");
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      options?.onListeningChange?.(false);  // ✅ ADD
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
        // options?.onListeningChange?.(true);  // ✅ ADD - explicitly set listening
      }

       if (!isSpeakingRef.current) {
      isSpeakingRef.current = true;
      options?.onUserSpeaking?.(true);
      if (DEBUG) console.log("🎤 User started speaking");
    }

     if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

     silenceTimerRef.current = setTimeout(() => {
      if (isSpeakingRef.current) {
        isSpeakingRef.current = false;
        options?.onUserSpeaking?.(false);
        if (DEBUG) console.log("🔇 User stopped speaking (silence detected)");
      }
    }, 1500);

      

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
        // console.log("Current chat sessionId:", chat);
        console.log("Current chat sessionId:", chat ? chat : (sessionId ? sessionId : null));
        send(
          JSON.stringify({
            type: "final_text",
            text: finalText.trim(),
            sessionId: chat ? chat : (sessionId ? sessionId : null),
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
      // ✅ Cleanup silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
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
