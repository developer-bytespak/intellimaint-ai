// useSTT.ts - Fixed with proper interim/final detection

const DG_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_KEY!;

export async function startSTT(onFinalText: (text: string) => void) {
  console.log("🎤 Requesting mic...");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log("✅ Mic granted");

  // Deepgram WebSocket with interim results
  const ws = new WebSocket(
    "wss://api.deepgram.com/v1/listen" +
      "?model=nova-2" +
      "&language=en" +
      "&smart_format=true" +
      "&encoding=linear16" +
      "&sample_rate=16000" +
      "&interim_results=true" +  // ✅ Enable interim results
      "&endpointing=300",         // ✅ Wait 300ms of silence before finalizing
    ["token", DG_KEY]
  );

  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    console.log("✅ Deepgram STT connected");
  };

  ws.onerror = (e) => {
    console.error("❌ DG STT error", e);
  };

  ws.onclose = () => {
    console.log("🔌 DG STT closed");
  };

  // Track current transcript
  let currentTranscript = "";

  ws.onmessage = (msg) => {
    if (typeof msg.data !== "string") return;

    const data = JSON.parse(msg.data);
    const transcript = data.channel?.alternatives?.[0]?.transcript || "";
    const isFinal = data.is_final;
    const speechFinal = data.speech_final;

    if (!transcript.trim()) return;

    if (isFinal || speechFinal) {
      // ✅ User finished speaking
      console.log("✅ Final transcript:", transcript);
      currentTranscript = transcript;
      
      // Send to backend
      if (currentTranscript.trim()) {
        onFinalText(currentTranscript.trim());
        currentTranscript = "";
      }
    } else {
      // Interim result (user still speaking)
      console.log("⏳ Interim:", transcript);
      currentTranscript = transcript;
    }
  };

  // Audio pipeline
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const source = audioCtx.createMediaStreamSource(stream);
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);

  source.connect(processor);
  processor.connect(audioCtx.destination);

  processor.onaudioprocess = (e) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const input = e.inputBuffer.getChannelData(0);

    // Convert Float32 to Int16
    const pcm16 = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
    }

    ws.send(pcm16.buffer);
  };

  console.log("🎙️ Audio pipeline started");

  return {
    stop() {
      console.log("🧹 Stopping STT...");

      processor.disconnect();
      source.disconnect();
      audioCtx.close();

      stream.getTracks().forEach((t) => t.stop());

      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      console.log("✅ STT stopped");
    },
  };
}