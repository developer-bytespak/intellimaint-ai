// "use client";
// import { useEffect, useRef, useState } from "react";

// export function useWebSocket(url: string) {
//   const wsRef = useRef<WebSocket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [messages, setMessages] = useState<any[]>([]);
//   const reconnectRef = useRef<NodeJS.Timeout | null>(null);

//   // SAFE SEND FUNCTION
//   const send = (data: any) => {
//     try {
//       if (wsRef.current?.readyState === WebSocket.OPEN) {
//         wsRef.current.send(data);
//         console.log("Sent data:", data); // Log sent data
//       } else {
//         console.warn("WebSocket not open. Cannot send data.");
//       }
//     } catch (err) {
//       console.error("WebSocket send error:", err);
//     }
//   };

//   const connect = () => {
//     try {
//       console.log("Attempting to connect to WebSocket...");
//       wsRef.current = new WebSocket(url);

//       wsRef.current.onopen = () => {
//         console.log("WebSocket connected!");
//         setIsConnected(true);

//         // Clear reconnect attempts
//         if (reconnectRef.current) clearTimeout(reconnectRef.current);
//       };

//       wsRef.current.onerror = (err) => {
//         console.error("WebSocket error:", err);
//       };

//       wsRef.current.onmessage = (msg) => {
//         try {
//           console.log("Received message:", msg.data); // Log received messages
//           setMessages((prev) => [...prev, msg.data]);
//         } catch (err) {
//           console.error("WS message handling error:", err);
//         }
//       };

//       wsRef.current.onclose = () => {
//         console.log("WebSocket disconnected");
//         setIsConnected(false);

//         // Auto reconnect after 2 seconds
//         reconnectRef.current = setTimeout(connect, 2000);
//         console.log("Reconnecting in 2 seconds...");
//       };

//     } catch (err) {
//       console.error("WebSocket creation error:", err);
//     }
//   };

//   useEffect(() => {
//     connect();
//     return () => {
//       wsRef.current?.close();
//       if (reconnectRef.current) clearTimeout(reconnectRef.current);
//     };
//   }, []);

//   return { isConnected, messages, send };
// }
