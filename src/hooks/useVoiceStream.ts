// import { useRef } from "react";
// import { useWebSocket } from "./useWebSocket";

// export function useVoiceStream() {
//   const { send, isConnected } = useWebSocket("");
//   const recorderRef = useRef<MediaRecorder | null>(null);
//   const mediaStreamRef = useRef<MediaStream | null>(null);
//   const isStreamingRef = useRef<boolean>(false);

//   const startStreaming = async () => {
//     try {
//       if (!isConnected) {
//         console.warn("WebSocket not connected. Cannot start streaming.");
//         return;
//       }

//       if (isStreamingRef.current) {
//         console.warn("Already streaming. Ignoring duplicate start.");
//         return;
//       }

//       // Check if another media stream is already active
//       if (mediaStreamRef.current) {
//         console.warn("Device is already in use. Please stop the previous stream.");
//         return;
//       }

//       // Request access to the user's microphone with HIGH QUALITY settings
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           channelCount: 1,              // Mono audio
//           sampleRate: 48000,            // High sample rate
//           echoCancellation: true,       // Echo cancellation
//           noiseSuppression: true,       // Noise suppression
//           autoGainControl: true         // Auto gain control
//         }
//       });
//       mediaStreamRef.current = stream;

//       // Check supported MIME types
//       const mimeTypes = [
//         'audio/webm;codecs=opus',
//         'audio/webm',
//         'audio/ogg;codecs=opus',
//         'audio/ogg'
//       ];

//       let selectedMimeType = 'audio/webm;codecs=opus'; // default
//       for (const mimeType of mimeTypes) {
//         if (MediaRecorder.isTypeSupported(mimeType)) {
//           selectedMimeType = mimeType;
//           console.log('✓ Selected MIME type:', mimeType);
//           break;
//         }
//       }

//       // Initialize the media recorder with HIGH QUALITY
//       const recorder = new MediaRecorder(stream, {
//         mimeType: selectedMimeType,
//         audioBitsPerSecond: 128000 // 128 kbps - HIGH QUALITY
//       });
      
//       recorderRef.current = recorder;
//       isStreamingRef.current = true;

//       console.log('MediaRecorder created:', {
//         mimeType: recorder.mimeType,
//         audioBitsPerSecond: 128000
//       });

//       recorder.onstart = () => {
//         console.log("✓ Recording started for streaming...");
//       };

//       recorder.onerror = (e) => {
//         console.error("✗ Recorder error:", e);
//         isStreamingRef.current = false;
//         stopMediaStream();
//       };

//       // CRITICAL FIX: Convert Blob to ArrayBuffer before sending
//       recorder.ondataavailable = async (e) => {
//         if (e.data.size > 0 && isStreamingRef.current) {
//           try {
//             console.log(`📦 Chunk received: ${e.data.size} bytes`);
            
//             // Convert Blob to ArrayBuffer (CRITICAL!)
//             const arrayBuffer = await e.data.arrayBuffer();
//             console.log(`📤 Sending ArrayBuffer: ${arrayBuffer.byteLength} bytes`);
            
//             // Send only if connected and streaming
//             if (isConnected && isStreamingRef.current) {
//               send(arrayBuffer);
//             } else {
//               console.warn("⚠️ Cannot send - WebSocket not connected or streaming stopped");
//             }
//           } catch (err) {
//             console.error("✗ Send chunk error:", err);
//           }
//         } else if (e.data.size === 0) {
//           console.warn("⚠️ Empty chunk received");
//         }
//       };

//       recorder.onstop = () => {
//         console.log("✓ Recording stopped.");
//         isStreamingRef.current = false;
//         stopMediaStream();
//       };

//       // Start recording with 1000ms (1 second) chunks
//       recorder.start(1000);
//       console.log("✓ Recording started with 1 second chunks");
      
//     } catch (err: any) {
//       isStreamingRef.current = false;
      
//       if (err.name === 'NotReadableError') {
//         console.error("✗ Error: Microphone is already in use by another process.");
//         alert("The microphone is in use by another application. Please close other applications using the microphone.");
//       } else if (err.name === 'NotAllowedError') {
//         console.error("✗ Error: Microphone permission denied.");
//         alert("Microphone permission denied. Please allow microphone access in browser settings.");
//       } else {
//         console.error("✗ Error starting voice stream:", err);
//         alert("Cannot access the microphone. Please check your microphone permissions.");
//       }
//     }
//   };

//   const stopStreaming = () => {
//     try {
//       console.log("🛑 Stopping streaming...");
      
//       // First, set flag to false to immediately stop sending new chunks
//       isStreamingRef.current = false;

//       // Send stop signal to backend via WebSocket
//       if (isConnected) {
//         try {
//           const stopMessage = JSON.stringify({ 
//             type: "stop", 
//             action: "end_stream" 
//           });
//           send(stopMessage);
//           console.log("✓ Stop signal sent to backend");
//         } catch (err) {
//           console.error("✗ Error sending stop signal:", err);
//         }
//       }

//       // Stop the recorder (this will trigger onstop handler)
//       if (recorderRef.current && recorderRef.current.state !== "inactive") {
//         recorderRef.current.stop();
//         console.log("✓ Recorder stopped.");
//       }

//       // Stop media stream immediately (this will turn off the mic)
//       stopMediaStream();

//       // Clear recorder reference
//       recorderRef.current = null;
      
//       console.log("✓ Streaming stopped successfully");
      
//     } catch (err) {
//       console.error("✗ Stop streaming error:", err);
//       isStreamingRef.current = false;
//       stopMediaStream();
//       recorderRef.current = null;
//     }
//   };

//   const stopMediaStream = () => {
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach((track) => {
//         track.stop();
//         console.log("✓ Media track stopped:", track.kind);
//       });
//       mediaStreamRef.current = null;
//       console.log("✓ Media stream stopped and cleared.");
//     }
//   };

//   return { startStreaming, stopStreaming, isConnected };
// }