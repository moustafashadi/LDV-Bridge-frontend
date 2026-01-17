import { io, Socket } from "socket.io-client";

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
}

/**
 * WebSocket client specifically for the /notifications namespace
 */
class NotificationsWebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isIntentionalDisconnect = false;

  /**
   * Connect to WebSocket server notifications namespace
   */
  connect(token?: string): void {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === "true";

    if (!isEnabled) {
      console.log(
        "[NotificationsWS] WebSocket disabled via environment variable"
      );
      return;
    }

    if (this.socket?.connected) {
      console.log("[NotificationsWS] Already connected");
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    const fullUrl = `${wsUrl}/notifications`;

    console.log("[NotificationsWS] Connecting to", fullUrl);

    this.socket = io(fullUrl, {
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
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

    console.log("[NotificationsWS] Disconnecting");
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
   * Setup internal event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[NotificationsWS] Connected", this.socket?.id);
      this.reconnectAttempts = 0;
      this.isIntentionalDisconnect = false;
    });

    this.socket.on("connected", (data) => {
      console.log("[NotificationsWS] Server confirmed connection:", data);
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts === 1) {
        console.warn("[NotificationsWS] Connection failed:", error.message);
      }
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn("[NotificationsWS] Reconnection attempts exhausted");
        this.disconnect();
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[NotificationsWS] Disconnected:", reason);
    });
  }

  /**
   * Subscribe to notification events
   */
  onNotification(
    callback: (notification: NotificationEvent) => void
  ): () => void {
    if (!this.socket) {
      console.warn("[NotificationsWS] Not connected. Call connect() first.");
      return () => {};
    }

    this.socket.on("notification", callback);

    return () => {
      this.socket?.off("notification", callback);
    };
  }

  /**
   * Subscribe to any event
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }
}

// Export singleton instance
export const notificationsWsClient = new NotificationsWebSocketClient();
