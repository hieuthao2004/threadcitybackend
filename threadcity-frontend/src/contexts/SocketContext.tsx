import React, { createContext, useState, useEffect, ReactNode } from 'react';
import socketService from '../services/socket.service';

interface SocketContextType {
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emit: <T>(event: string, data: T) => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: (event: string) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      setIsConnected(true);
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.disconnect();
    };
  }, []);

  const joinRoom = (room: string) => {
    socketService.joinRoom(room);
  };

  const leaveRoom = (room: string) => {
    socketService.leaveRoom(room);
  };

  const emit = <T,>(event: string, data: T) => {
    socketService.emit(event, data);
  };

  const on = <T,>(event: string, callback: (data: T) => void) => {
    socketService.on(event, callback);
  };

  const off = (event: string) => {
    socketService.off(event);
  };

  return (
    <SocketContext.Provider value={{ 
      isConnected,
      joinRoom,
      leaveRoom,
      emit,
      on,
      off
    }}>
      {children}
    </SocketContext.Provider>
  );
};