'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { wsClient } from '@/lib/websocket/client';
import { connectorKeys } from '@/hooks/use-connectors';
import type { ConnectionStatusChangedEvent, AppSyncedEvent } from '@/lib/websocket/client';

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
        console.log('[WebSocketProvider] User not authenticated, disconnecting');
        wsClient.disconnect();
      }
      return;
    }

    // Connect to WebSocket when authenticated
    const connectWebSocket = async () => {
      try {
        const token = await getAccessTokenSilently();
        console.log('[WebSocketProvider] Connecting WebSocket');
        wsClient.connect(token);
      } catch (error) {
        console.error('[WebSocketProvider] Failed to get auth token:', error);
        // Connect without token (backend should handle this)
        wsClient.connect();
      }
    };

    connectWebSocket();

    // Setup event listeners for cache invalidation
    const unsubscribeStatusChanged = wsClient.onConnectionStatusChanged(
      (event: ConnectionStatusChangedEvent) => {
        console.log('[WebSocketProvider] Connection status changed:', event);

        // Invalidate status queries for the specific platform
        const platform = event.platform.toLowerCase();
        queryClient.invalidateQueries({
          queryKey: [...connectorKeys.all, platform, 'status'],
        });

        // If status is CONNECTED, also invalidate lists to fetch fresh data
        if (event.status === 'CONNECTED') {
          queryClient.invalidateQueries({
            queryKey: [...connectorKeys.all, platform],
          });
        }
      }
    );

    const unsubscribeAppSynced = wsClient.onAppSynced((event: AppSyncedEvent) => {
      console.log('[WebSocketProvider] App synced:', event);

      // Invalidate app lists for the specific platform
      const platform = event.platform.toLowerCase();
      queryClient.invalidateQueries({
        queryKey: [...connectorKeys.all, platform, 'apps'],
      });
    });

    // Cleanup on unmount
    return () => {
      console.log('[WebSocketProvider] Cleaning up WebSocket connection');
      unsubscribeStatusChanged();
      unsubscribeAppSynced();
      wsClient.disconnect();
    };
  }, [isAuthenticated, getAccessTokenSilently, queryClient]);

  return <>{children}</>;
}
