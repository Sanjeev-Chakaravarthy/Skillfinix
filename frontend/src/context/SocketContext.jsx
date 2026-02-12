import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  // ✅ Prevent duplicate socket connections (React.StrictMode safe)
  const socketRef = useRef(null);
  const isConnecting = useRef(false);

  useEffect(() => {
    // Don't create socket if no user or token
    if (!user || !token) {
      if (socketRef.current) {
        console.log('🔴 Disconnecting socket - no user or token');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      setOnlineUsers(new Set());
      isConnecting.current = false;
      return;
    }

    // ✅ Prevent duplicate socket creation
    if (socketRef.current || isConnecting.current) {
      console.log('⚠️ Socket already exists or is connecting, skipping...');
      return;
    }

    isConnecting.current = true;

    console.log('🔌 Initializing socket connection for user:', user._id);

    // Get API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    console.log('🌐 Connecting to:', API_URL);

    // Create socket instance
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      auth: {
        token: token
      }
    });

    socketRef.current = newSocket;

    // ✅ Make socket available immediately (before connect event)
    setSocket(newSocket);

    // Connection event
    newSocket.on('connect', () => {
      console.log('✅ Socket CONNECTED');
      console.log('   Socket ID:', newSocket.id);
      setConnected(true);
      isConnecting.current = false;
      
      // Authenticate
      console.log('🔐 Authenticating...');
      newSocket.emit('authenticate', token);
    });

    // Authenticated event - CRITICAL: Get initial online users
    newSocket.on('authenticated', (data) => {
      console.log('✅ Socket AUTHENTICATED');
      console.log('   User ID:', data.userId);
      console.log('   Socket ID:', newSocket.id);

      // ✅ Join personal room for reliable delivery/read receipts
      newSocket.emit('join-room', data.userId);
      console.log('🏠 Joined socket room:', data.userId);

      // Request current online users after authentication
      newSocket.emit('get-online-users');
    });

    // Handle online users list
    newSocket.on('online-users', (data) => {
      console.log('👥 Received online users list:', data.userIds);
      setOnlineUsers(new Set(data.userIds));
    });

    // Authentication error
    newSocket.on('authentication-error', (data) => {
      console.error('❌ Authentication failed:', data.message);
      setConnected(false);
      isConnecting.current = false;
    });

    // User online
    newSocket.on('user-online', (data) => {
      console.log('🟢 User came online:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        console.log('   Total online users:', newSet.size);
        return newSet;
      });
    });

    // User offline
    newSocket.on('user-offline', (data) => {
      console.log('🔴 User went offline:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        console.log('   Total online users:', newSet.size);
        return newSet;
      });
    });

    // Disconnect event
    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected. Reason:', reason);
      setConnected(false);
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnected(false);
      isConnecting.current = false;
    });

    // Reconnect
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      newSocket.emit('authenticate', token);
    });

    // Cleanup
    return () => {
      console.log('🔴 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      setOnlineUsers(new Set());
      isConnecting.current = false;
    };
  }, [user?._id, token]);

  const value = {
    socket,
    onlineUsers,
    connected,
    isOnline: (userId) => {
      const online = onlineUsers.has(userId);
      return online;
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};