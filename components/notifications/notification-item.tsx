// ============================================
// NOTIFICATION ITEM COMPONENT
// ============================================

'use client';

import { Notification } from '@/lib/types/notifications';
import { useNotificationActions } from '@/lib/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onRead?: () => void;
  onDelete?: () => void;
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification, loading } = useNotificationActions();

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(notification.id);
      onRead?.();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification(notification.id);
      onDelete?.();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent transition-colors group',
        !notification.isRead && 'bg-accent/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMarkAsRead}
              disabled={loading}
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDelete}
            disabled={loading}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
