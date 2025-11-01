import React, { useEffect, useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';

const WebSocketStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);

    connectWebSocket(handleConnection, handleDisconnection);

    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div>
      <h2>WebSocket Status</h2>
      <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
};

export default WebSocketStatus;