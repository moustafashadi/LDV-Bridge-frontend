// ============================================
// SYNC BUTTON COMPONENT
// ============================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSyncActions } from '@/lib/hooks/use-sync';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncButtonProps {
  appId: string;
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SyncButton({ appId, onSuccess, variant = 'default', size = 'default' }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const { triggerManualSync } = useSyncActions();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      setSyncing(true);
      await triggerManualSync(appId, true);
      toast({
        title: 'Sync Started',
        description: 'Manual sync has been triggered successfully',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to start sync',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={syncing}
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''} ${size !== 'icon' ? 'mr-2' : ''}`} />
      {size !== 'icon' && (syncing ? 'Syncing...' : 'Sync Now')}
    </Button>
  );
}
