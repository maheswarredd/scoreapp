import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000
    });

    socketInstance.on('connect', () => {
      // console.log('[Socket] Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      // console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinMatch = (matchId) => {
    if (socket) {
      socket.emit('join_match', matchId);
    }
  };

  const leaveMatch = (matchId) => {
    if (socket) {
      socket.emit('leave_match', matchId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinMatch, leaveMatch }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
