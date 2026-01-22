"use client";

import { useEffect, useRef, useState } from "react";

export let sessionId = "";

export function useWebSocket(url: string) {

  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastText, setLastText] = useState<string>("");


  useEffect(() => {

    if (!url) return;

    const ws = new WebSocket(url);

    wsRef.current = ws;


    ws.onopen = () => {
      setIsConnected(true);
      console.log("✅ WS connected");
    };


    ws.onmessage = (msg) => {

      if (typeof msg.data !== "string") return;

      const data = JSON.parse(msg.data);


      if (data.type === "session") {
        sessionId = data.sessionId;
      }


      if (data.type === "text") {
        setLastText(data.content);
      }


      if (data.type === "done") {
        console.log("🤖 Bot done");
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


  const send = (text: string) => {

    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: "text",
      text,
      sessionId,
    }));
  };


  return {
    isConnected,
    lastText,
    send,
  };
}
