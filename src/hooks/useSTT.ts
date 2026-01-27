const DG_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_KEY!;

// Configuration constants
const MIN_CONFIDENCE = 0.60; // 60% confidence threshold (lowered for better acceptance)
const MIN_WORDS = 1; // Minimum 1 word to consider as final
const FINAL_RESULT_DEBOUNCE_MS = 300; // Wait 300ms after last interim result

export function startSTT(
  onFinalText: (text: string) => void,  
  onDeegramConnected?: () => void
) {
  return new Promise<{
    stop: () => void;
    pause: () => void;
    resume: () => void;
  }>(async (resolve, reject) => {
    try {
      console.log("🎤 Requesting mic...");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Mic granted");

      // Track state
      let currentTranscript = "";
      let isPaused = false;
      let isActive = true;
      let keepAliveInterval: NodeJS.Timeout | null = null;
      let wsRef: WebSocket | null = null;
      let debounceTimeout: NodeJS.Timeout | null = null; // ✅ Debounce timer
      let lastInterimTime = 0; // ✅ Track last interim result time
      
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);

  // ✅ Function to create and reconnect WebSocket
  const createWebSocket = (): WebSocket => {
    const ws = new WebSocket(
      "wss://api.deepgram.com/v1/listen" +
        "?model=nova-2" +
        "&language=en" +
        "&smart_format=true" +
        "&encoding=linear16" +
        "&sample_rate=16000" +
        "&interim_results=true" +
        "&endpointing=1200",
      ["token", DG_KEY]
    );

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("✅ Deepgram STT connected");
      // 🔔 Notify that Deepgram is connected
      if (onDeegramConnected) onDeegramConnected();
      // ✅ Send keep-alive every 20 seconds
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      keepAliveInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && !isPaused) {
          ws.send(new ArrayBuffer(0)); // Keep connection alive
          console.log("💓 Keep-alive sent");
        }
      }, 20000);
    };

    ws.onerror = (e) => {
      console.error("❌ DG STT error", e);
    };

    ws.onclose = () => {
      console.log("🔌 DG STT closed");
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      // ✅ Auto-reconnect if still active
      if (isActive && !isPaused) {
        console.log("🔄 Reconnecting...");
        setTimeout(() => {
          if (isActive && wsRef) {
            wsRef = createWebSocket();
            // Reconnect audio pipeline
            source.connect(processor);
            processor.connect(audioCtx.destination);
          }
        }, 1000);
      }
    };

    ws.onmessage = (msg) => {
      if (typeof msg.data !== "string") return;
      if (isPaused) return;

      const data = JSON.parse(msg.data);
      const transcript = data.channel?.alternatives?.[0]?.transcript || "";
      const confidence = data.channel?.alternatives?.[0]?.confidence || 0;
      const isFinal = data.is_final;
      const speechFinal = data.speech_final;

      // ✅ Skip empty transcripts
      if (!transcript.trim()) return;

      const wordCount = transcript.trim().split(/\s+/).length;

      // ✅ INTERIM RESULTS - Only log if enough words (no callback)
      if (!isFinal && !speechFinal) {
        if (wordCount >= MIN_WORDS) {
          console.log(`⏳ Interim (${wordCount} words, ${(confidence * 100).toFixed(1)}%):`, transcript);
        }
        currentTranscript = transcript;
        lastInterimTime = Date.now();
        return;
      }

      // ✅ FINAL RESULTS - Accept most results with minimum quality
      if (isFinal || speechFinal) {
        // Skip only if VERY low confidence (< 50%) AND single word
        if (confidence < 0.50 && wordCount === 1) {
          console.log(`⚠️ Very low confidence (${(confidence * 100).toFixed(1)}%) - skipping:`, transcript);
          return;
        }

        currentTranscript = transcript;
        console.log(`✅ Final (${wordCount} words, ${(confidence * 100).toFixed(1)}%):`, transcript);

        // ✅ DEBOUNCE: Wait to ensure we got all final chunks
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          if (currentTranscript.trim() && !isPaused) {
            console.log("📤 Sending to callback:", currentTranscript);
            onFinalText(currentTranscript.trim());
            currentTranscript = "";
          }
        }, FINAL_RESULT_DEBOUNCE_MS);
      }
    };

    return ws;
  };

  wsRef = createWebSocket();

  source.connect(processor);
  processor.connect(audioCtx.destination);

  processor.onaudioprocess = (e) => {
    if (!wsRef || wsRef.readyState !== WebSocket.OPEN || isPaused) return;
    const input = e.inputBuffer.getChannelData(0);
    const pcm16 = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
    }
    wsRef.send(pcm16.buffer);
  };

  console.log("🎙️ Audio pipeline started");

      resolve({
        stop() {
          console.log("🧹 Stopping STT...");
          isActive = false;
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (debounceTimeout) clearTimeout(debounceTimeout);
          processor.disconnect();
          source.disconnect();
          audioCtx.close();
          stream.getTracks().forEach((t) => t.stop());
          if (wsRef && wsRef.readyState === WebSocket.OPEN) {
            wsRef.close();
          }
          console.log("✅ STT stopped");
        },

        pause() {
          isPaused = true;
          currentTranscript = ""; // Clear any partial transcript
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (debounceTimeout) clearTimeout(debounceTimeout);
          if (wsRef && wsRef.readyState === WebSocket.OPEN) {
            wsRef.close(); // Completely close WebSocket
            console.log("🔌 WebSocket closed during pause");
          }
          console.log("⏸️ STT paused");
        },

        resume() {
          isPaused = false;
          currentTranscript = ""; // Reset transcript on resume
          if (debounceTimeout) clearTimeout(debounceTimeout); // Clear any pending debounce
          console.log("▶️ STT resumed");
          // Create fresh WebSocket on resume
          wsRef = createWebSocket();
        },
      });
    } catch (err) {
      console.error("❌ STT Initialization Error:", err);
      reject(err);
    }
  });
}