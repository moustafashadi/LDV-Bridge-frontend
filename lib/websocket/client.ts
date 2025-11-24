import { io, Socket } from 'socket.io-client';
import type { PlatformType, ConnectionStatus } from '../types/connectors';

// WebSocket event types
export interface ConnectionStatusChangedEvent {
  platform: PlatformType;
  userId: string;
  status: ConnectionStatus;
  timestamp: string;
}

export interface AppSyncedEvent {
  platform: PlatformType;
  appId: string;
  appName: string;
  timestamp: string;
}

// WebSocket client class
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced from 5
  private reconnectDelay = 1000; // Start with 1 second
  private isIntentionalDisconnect = false;
  private isWebSocketEnabled = false; // Feature flag

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): void {
    // Check if WebSocket is enabled via environment variable
    this.isWebSocketEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';
    
    if (!this.isWebSocketEnabled) {
      console.log('[WebSocket] WebSocket disabled via environment variable');
      return;
    }

    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

    console.log('[WebSocket] Connecting to', wsUrl);

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (!this.socket) return;

    console.log('[WebSocket] Disconnecting');
    this.isIntentionalDisconnect = true;
    this.socket.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatusChanged(
    callback: (event: ConnectionStatusChangedEvent) => void
  ): () => void {
    if (!this.socket) {
      console.warn('[WebSocket] Not connected. Call connect() first.');
      return () => {};
    }

    this.socket.on('connection-status-changed', callback);

    // Return unsubscribe function
    return () => {
      this.socket?.off('connection-status-changed', callback);
    };
  }

  /**
   * Subscribe to app synced events
   */
  onAppSynced(callback: (event: AppSyncedEvent) => void): () => void {
    if (!this.socket) {
      console.warn('[WebSocket] Not connected. Call connect() first.');
      return () => {};
    }

    this.socket.on('app-synced', callback);

    return () => {
      this.socket?.off('app-synced', callback);
    };
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected', this.socket?.id);
      this.reconnectAttempts = 0;
      this.isIntentionalDisconnect = false;
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;

      // Only log first error and max attempts to reduce console spam
      if (this.reconnectAttempts === 1) {
        console.warn('[WebSocket] Connection failed. WebSocket features disabled.');
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('[WebSocket] Reconnection attempts exhausted. Real-time updates disabled.');
        this.disconnect(); // Stop trying
      }
    });

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);

      // Don't attempt to reconnect if disconnect was intentional
      if (this.isIntentionalDisconnect) {
        console.log('[WebSocket] Intentional disconnect, not reconnecting');
        return;
      }

      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, reconnect manually
        console.log('[WebSocket] Server disconnected, attempting reconnect...');
        setTimeout(() => {
          if (!this.isIntentionalDisconnect) {
            this.socket?.connect();
          }
        }, this.reconnectDelay);
      }
      // For other reasons, socket.io will attempt to reconnect automatically
    });

    // Reconnection attempt (reduced logging)
    this.socket.io.on('reconnect_attempt', (attempt) => {
      // Silent - only log on first and last attempt
      if (attempt === 1 || attempt >= this.maxReconnectAttempts) {
        console.log(`[WebSocket] Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`);
      }
    });

    // Reconnection failed
    this.socket.io.on('reconnect_failed', () => {
      console.warn('[WebSocket] Reconnection failed - real-time updates disabled');
    });

    // Successfully reconnected
    this.socket.io.on('reconnect', (attempt) => {
      console.log(`[WebSocket] Reconnected after ${attempt} attempts`);
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Emit a custom event to server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot emit - not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Subscribe to any custom event
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) {
      console.warn('[WebSocket] Not connected. Call connect() first.');
      return () => {};
    }

    this.socket.on(event, callback);

    return () => {
      this.socket?.off(event, callback);
    };
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();

// Export default for convenience
export default wsClient;
