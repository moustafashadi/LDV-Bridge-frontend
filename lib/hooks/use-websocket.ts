// ============================================
// WEBSOCKET HOOK FOR REAL-TIME UPDATES
// ============================================

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  namespace?: string;
  autoConnect?: boolean;
}

interface SubscribeOptions {
  room: string;
  onMessage?: (event: string, data: any) => void;
}

export function useWebSocket(config: WebSocketConfig = {}) {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    const namespace = config.namespace || '';
    // Get base URL without /api/v1 suffix
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const serverUrl = apiUrl.replace(/\/api\/v1$/, ''); // Remove /api/v1 if present
    const socketUrl = `${serverUrl}${namespace}`;

    // Create socket connection
    socketRef.current = io(socketUrl, {
      autoConnect: config.autoConnect !== false,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log(`[WebSocket] Connected to ${namespace || 'default'} at ${socketUrl}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Disconnected from ${namespace || 'default'}`);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      listenersRef.current.clear();
    };
  }, [config.namespace, config.autoConnect]);

  /**
   * Subscribe to a room and listen for events
   */
  const subscribe = useCallback((options: SubscribeOptions) => {
    if (!socketRef.current) {
      console.warn('[WebSocket] Socket not initialized');
      return () => {};
    }

    const socket = socketRef.current;

    // Subscribe to room
    socket.emit('subscribe:sandbox', { sandboxId: options.room });

    console.log(`[WebSocket] Subscribed to room: ${options.room}`);

    // Return unsubscribe function
    return () => {
      socket.emit('unsubscribe:sandbox', { sandboxId: options.room });
      console.log(`[WebSocket] Unsubscribed from room: ${options.room}`);
    };
  }, []);

  /**
   * Listen to a specific event
   */
  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) {
      console.warn('[WebSocket] Socket not initialized');
      return () => {};
    }

    const socket = socketRef.current;
    socket.on(event, callback);
    listenersRef.current.set(event, callback);

    console.log(`[WebSocket] Listening to event: ${event}`);

    // Return cleanup function
    return () => {
      socket.off(event, callback);
      listenersRef.current.delete(event);
    };
  }, []);

  /**
   * Emit an event to the server
   */
  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current) {
      console.warn('[WebSocket] Socket not initialized');
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    subscribe,
    on,
    emit,
    isConnected: socketRef.current?.connected || false,
  };
}
