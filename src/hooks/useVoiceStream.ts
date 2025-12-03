import { useRef } from "react";
import { useWebSocket } from "./useWebSocket";

export function useVoiceStream() {
  const { send, isConnected } = useWebSocket("ws://localhost:8000/api/v1/stream");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isStreamingRef = useRef<boolean>(false);

  const startStreaming = async () => {
    try {
      if (!isConnected) {
        console.warn("WebSocket not connected. Cannot start streaming.");
        return;
      }

      if (isStreamingRef.current) {
        console.warn("Already streaming. Ignoring duplicate start.");
        return;
      }

      // Check if another media stream is already active
      if (mediaStreamRef.current) {
        console.warn("Device is already in use. Please stop the previous stream.");
        return;
      }

      // Request access to the user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Initialize the media recorder
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      isStreamingRef.current = true;

      recorder.onstart = () => {
        console.log("Recording started for streaming...");
      };

      recorder.onerror = (e) => {
        console.error("Recorder error:", e);
        isStreamingRef.current = false;
        stopMediaStream();
      };

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && isStreamingRef.current) {
          try {
            if (isConnected && isStreamingRef.current) {
              send(e.data);
            }
          } catch (err) {
            console.error("Send chunk error:", err);
          }
        }
      };

      recorder.onstop = () => {
        console.log("Recording stopped.");
        isStreamingRef.current = false;
        stopMediaStream();
      };

      recorder.start(1000); // Start recording with 1000ms chunks
    } catch (err: any) {
      isStreamingRef.current = false;
      if (err.name === 'NotReadableError') {
        console.error("Error: Microphone is already in use by another process.");
        alert("The microphone is in use by another application. Please close other applications using the microphone.");
      } else {
        console.error("Error starting voice stream:", err);
        alert("Cannot access the microphone. Please check your microphone permissions.");
      }
    }
  };

  const stopStreaming = () => {
    try {
      // First, set flag to false to immediately stop sending new chunks
      isStreamingRef.current = false;

      // Send stop signal to backend via WebSocket (if backend expects it)
      if (isConnected) {
        try {
          // Send a JSON message to indicate stream end
          // Note: If backend expects binary only, you may need to adjust this
          const stopMessage = JSON.stringify({ type: "stop", action: "end_stream" });
          send(stopMessage);
          console.log("Stop signal sent to backend");
        } catch (err) {
          console.error("Error sending stop signal:", err);
        }
      }

      // Stop the recorder (this will trigger onstop handler)
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
        console.log("Recorder stopped.");
      }

      // Stop media stream immediately (this will turn off the mic)
      stopMediaStream();

      // Clear recorder reference
      recorderRef.current = null;
    } catch (err) {
      console.error("Stop streaming error:", err);
      isStreamingRef.current = false;
      stopMediaStream();
      recorderRef.current = null;
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Media track stopped:", track.kind);
      });
      mediaStreamRef.current = null;
      console.log("Media stream stopped and cleared.");
    }
  };

  return { startStreaming, stopStreaming, isConnected };
}