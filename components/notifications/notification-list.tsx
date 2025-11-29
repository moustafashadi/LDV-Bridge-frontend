// ============================================
// NOTIFICATION LIST COMPONENT
// ============================================

import { Notification } from '@/lib/types/notifications';
import { NotificationItem } from './notification-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  error?: Error | null;
  onRefetch?: () => void;
}

export function NotificationList({
  notifications,
  loading,
  error,
  onRefetch,
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load notifications: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div className="divide-y border rounded-lg">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRefetch}
          onDelete={onRefetch}
        />
      ))}
    </div>
  );
}
