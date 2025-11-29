// ============================================
// NOTIFICATION SYSTEM HOOKS (Task 15)
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  PaginatedNotificationsResponse,
  NotificationFilters,
  NotificationType,
  UnreadCountResponse,
} from '../types/notifications';
import * as notificationsApi from '../api/notifications-api';

/**
 * Hook to fetch notifications with filters
 */
export function useNotifications(filters?: NotificationFilters) {
  const [data, setData] = useState<PaginatedNotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationsApi.getNotifications(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.unreadOnly,
    filters?.type,
    filters?.page,
    filters?.limit,
  ]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications: data?.data || [],
    total: data?.total || 0,
    unreadCount: data?.unreadCount || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchNotifications,
  };
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationsApi.getUnreadCount();
      setCount(result.count);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  };
}

/**
 * Hook for notification actions
 */
export function useNotificationActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markAsRead = async (id: string): Promise<Notification> => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationsApi.markAsRead(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsUnread = async (id: string): Promise<Notification> => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationsApi.markAsUnread(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await notificationsApi.deleteNotification(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await notificationsApi.markAllAsRead();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllRead = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await notificationsApi.deleteAllRead();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    deleteAllRead,
    loading,
    error,
  };
}

/**
 * Hook for real-time notifications with WebSocket
 * This will connect to the WebSocket server and listen for new notifications
 */
export function useRealtimeNotifications(
  onNotification?: (notification: Notification) => void
) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Get WebSocket URL from environment or default
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    try {
      // Create WebSocket connection
      const ws = new WebSocket(`${wsUrl}/notifications`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          console.log('📬 New notification:', notification);
          onNotification?.(notification);
        } catch (err) {
          console.error('Failed to parse notification:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setConnected(false);
      };

      return () => {
        ws.close();
      };
    } catch (err) {
      setError(err as Error);
    }
  }, [onNotification]);

  return {
    connected,
    error,
  };
}
