// ============================================
// SYNC STATUS COMPONENT
// ============================================

'use client';

import { useSyncStatus } from '@/lib/hooks/use-sync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface SyncStatusProps {
  appId: string;
}

export function SyncStatus({ appId }: SyncStatusProps) {
  const { status, currentStatus, isAutoSyncEnabled, lastSync, loading } = useSyncStatus(appId);

  if (loading) {
    return <Skeleton className="h-32" />;
  }

  if (!status) {
    return null;
  }

  const statusIcons = {
    COMPLETED: <CheckCircle className="h-5 w-5 text-green-600" />,
    FAILED: <XCircle className="h-5 w-5 text-red-600" />,
    IN_PROGRESS: <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />,
    PENDING: <Clock className="h-5 w-5 text-yellow-600" />,
  };

  const statusColors: Record<string, string> = {
    COMPLETED: 'default',
    FAILED: 'destructive',
    IN_PROGRESS: 'secondary',
    PENDING: 'warning',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sync Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentStatus && (
          <div className="flex items-center gap-3">
            {statusIcons[currentStatus as keyof typeof statusIcons]}
            <div className="flex-1">
              <Badge variant={statusColors[currentStatus] as any}>
                {currentStatus}
              </Badge>
            </div>
          </div>
        )}

        {/* Auto Sync */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Auto Sync:</span>
          <Badge variant={isAutoSyncEnabled ? 'default' : 'secondary'}>
            {isAutoSyncEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {/* Last Sync */}
        {lastSync && (
          <div className="text-sm">
            <span className="text-muted-foreground">Last Sync: </span>
            <span>{new Date(lastSync.completedAt || lastSync.startedAt).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
