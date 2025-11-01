// ...existing code...
import { useEffect, useState } from 'react';

const DEFAULT_WEBSOCKET_URL = 'ws://localhost:3000';

let ws: WebSocket | null = null;
const messageListeners = new Set<(data: any) => void>();
const openListeners = new Set<() => void>();
const closeListeners = new Set<() => void>();

function createWebSocket(url = DEFAULT_WEBSOCKET_URL) {
  if (ws && ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
    return ws;
  }

  ws = new WebSocket(url);

  ws.addEventListener('open', () => {
    openListeners.forEach((l) => l());
    console.log('✅ WebSocket connected');
  });

  ws.addEventListener('close', () => {
    closeListeners.forEach((l) => l());
    console.log('❌ WebSocket disconnected');
    // keep ws reference until explicitly disconnected
  });

  ws.addEventListener('message', (event) => {
    let payload: any = event.data;
    try {
      payload = JSON.parse(event.data);
    } catch {
      // non-JSON message, pass raw
    }
    messageListeners.forEach((l) => l(payload));
    console.log('📩 Message received:', payload);
  });

  ws.addEventListener('error', (err) => {
    console.error('WebSocket error', err);
  });

  return ws;
}

export function connectWebSocket(url?: string, onMessage?: (data: any) => void) {
  if (onMessage) messageListeners.add(onMessage);
  const socket = createWebSocket(url);
  return socket;
}

export function disconnectWebSocket(removeListeners = true) {
  if (ws) {
    try {
      ws.close();
    } catch {}
    ws = null;
  }
  if (removeListeners) {
    messageListeners.clear();
    openListeners.clear();
    closeListeners.clear();
  }
}

export const useWebSocket = (url?: string) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const handleOpen = () => setConnected(true);
    const handleClose = () => setConnected(false);
    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    // add listeners and ensure socket exists
    openListeners.add(handleOpen);
    closeListeners.add(handleClose);
    messageListeners.add(handleMessage);

    const socket = createWebSocket(url);

    // if already open, set connected immediately
    if (socket && socket.readyState === WebSocket.OPEN) {
      setConnected(true);
    }

    return () => {
      // remove only these hook-specific listeners
      openListeners.delete(handleOpen);
      closeListeners.delete(handleClose);
      messageListeners.delete(handleMessage);
      // do not close global socket from hook cleanup (call disconnectWebSocket explicitly if desired)
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
    }
  };

  return { connected, messages, sendMessage };
};
// ...existing code...