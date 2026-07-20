import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'https://projectpulse-backend.onrender.com';
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const joinRoom = (teamId) => {
    if (socket) {
      socket.emit('joinRoom', { teamId });
    }
  };

  const sendMessage = (teamId, senderId, text, file = null) => {
    if (socket) {
      socket.emit('sendMessage', { teamId, senderId, text, file });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinRoom, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
