// ============================================
// NOTIFICATION DROPDOWN COMPONENT
// ============================================

'use client';

import { useNotifications, useNotificationActions } from '@/lib/hooks/use-notifications';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCheck, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationDropdownProps {
  userId?: string;
  onClose?: () => void;
}

export function NotificationDropdown({ userId, onClose }: NotificationDropdownProps) {
  const { notifications, loading, error, refetch } = useNotifications({
    page: 1,
    limit: 10,
  });

  const { markAllAsRead, deleteAllRead, loading: actionLoading } =
    useNotificationActions();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllRead();
      refetch();
    } catch (err) {
      console.error('Failed to delete read notifications:', err);
    }
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-background border rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading || loading}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteAllRead}
              disabled={actionLoading || loading}
              title="Delete all read"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-96">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-destructive">
            Failed to load notifications
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={refetch}
                onDelete={refetch}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 text-center">
            <Button variant="link" size="sm" className="text-xs" onClick={onClose}>
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
