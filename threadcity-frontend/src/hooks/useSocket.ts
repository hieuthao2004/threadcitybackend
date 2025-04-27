import { useContext, useEffect } from 'react';
import { SocketContext } from '../contexts/SocketContext';

const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context;
};

export default useSocket;