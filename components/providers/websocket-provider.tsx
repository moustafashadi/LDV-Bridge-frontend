"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { wsClient } from "@/lib/websocket/client";
import { notificationsWsClient } from "@/lib/websocket/notifications-client";
import { connectorKeys } from "@/hooks/use-connectors";
import { toast } from "sonner";
import type {
  ConnectionStatusChangedEvent,
  AppSyncedEvent,
} from "@/lib/websocket/client";

/**
 * WebSocket Provider Component
 * Manages WebSocket connection lifecycle and cache invalidation
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if user is not authenticated
      if (wsClient.isConnected()) {
        console.log(
          "[WebSocketProvider] User not authenticated, disconnecting"
        );
        wsClient.disconnect();
      }
      return;
    }

    // Connect to WebSocket when authenticated
    const connectWebSocket = async () => {
      try {
        const token = await getAccessTokenSilently();
        console.log("[WebSocketProvider] Attempting WebSocket connection");
        wsClient.connect(token);

        // Also connect to notifications namespace
        notificationsWsClient.connect(token);

        // Setup event listeners AFTER connecting (when socket is initialized)
        // Small delay to ensure socket is ready
        setTimeout(() => {
          setupEventListeners();
          setupNotificationListeners();
        }, 100);
      } catch (error) {
        console.warn(
          "[WebSocketProvider] WebSocket connection skipped:",
          error
        );
        // Don't throw - WebSocket is optional for now
      }
    };

    // Setup event listeners for cache invalidation
    let unsubscribeStatusChanged: (() => void) | undefined;
    let unsubscribeAppSynced: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;

    // Setup notification listeners
    const setupNotificationListeners = () => {
      unsubscribeNotifications = notificationsWsClient.onNotification(
        (notification) => {
          console.log(
            "[WebSocketProvider] Received notification:",
            notification
          );

          // Show toast notification
          const getIcon = (type: string) => {
            switch (type) {
              case "REVIEW_APPROVED":
                return "✅";
              case "REVIEW_REJECTED":
                return "❌";
              case "REVIEW_ASSIGNED":
                return "📋";
              case "CHANGE_REQUESTED":
                return "🔄";
              case "COMMENT_ADDED":
              case "COMMENT_MENTION":
                return "💬";
              case "DEPLOYMENT_SUCCESS":
                return "🚀";
              case "DEPLOYMENT_FAILED":
                return "⚠️";
              case "SANDBOX_CREATED":
                return "📦";
              default:
                return "🔔";
            }
          };

          toast.info(`${getIcon(notification.type)} ${notification.title}`, {
            description: notification.message,
          });

          // Invalidate notifications cache to update the bell
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      );
    };

    const setupEventListeners = () => {
      unsubscribeStatusChanged = wsClient.onConnectionStatusChanged(
        (event: ConnectionStatusChangedEvent) => {
          console.log("[WebSocketProvider] Connection status changed:", event);

          // Invalidate status queries for the specific platform
          const platform = event.platform.toLowerCase();
          queryClient.invalidateQueries({
            queryKey: [...connectorKeys.all, platform, "status"],
          });

          // If status is CONNECTED, also invalidate lists to fetch fresh data
          if (event.status === "CONNECTED") {
            queryClient.invalidateQueries({
              queryKey: [...connectorKeys.all, platform],
            });
          }
        }
      );

      unsubscribeAppSynced = wsClient.onAppSynced((event: AppSyncedEvent) => {
        console.log("[WebSocketProvider] App synced:", event);

        // Invalidate app lists for the specific platform
        const platform = event.platform.toLowerCase();
        queryClient.invalidateQueries({
          queryKey: [...connectorKeys.all, platform, "apps"],
        });
      });
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      console.log("[WebSocketProvider] Cleaning up WebSocket connection");
      unsubscribeStatusChanged?.();
      unsubscribeAppSynced?.();
      unsubscribeNotifications?.();
      wsClient.disconnect();
      notificationsWsClient.disconnect();
    };
  }, [isAuthenticated, getAccessTokenSilently, queryClient]);

  return <>{children}</>;
}
