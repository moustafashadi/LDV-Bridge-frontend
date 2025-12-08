// ============================================
// SANDBOX CHANGES HOOK WITH WEBSOCKET SUPPORT
// ============================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getChanges, 
  syncSandbox as apiSyncSandbox,
  undoChange as apiUndoChange,
  restoreChange as apiRestoreChange
} from '../api/changes-api';
import { useWebSocket } from './use-websocket';
import { ChangeStatus, ChangeType } from '../types/changes';
import type { Change, ChangeFilters } from '../types/changes';
import { toast } from 'sonner';

interface UseSandboxChangesOptions {
  sandboxId: string;
  appId?: string;
  enableRealTime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface GroupedChanges {
  [componentName: string]: Change[];
}

export function useSandboxChanges(options: UseSandboxChangesOptions) {
  const { sandboxId, appId, enableRealTime = true, autoRefresh = true, refreshInterval = 120000 } = options;

  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // WebSocket for real-time updates
  const { subscribe, on } = useWebSocket({
    namespace: '/changes',
    autoConnect: enableRealTime,
  });

  // Fetch changes from API
  const fetchChanges = useCallback(async () => {
    // Don't fetch if we don't have an appId yet
    if (!appId) {
      setChanges([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters: ChangeFilters = {
        appId,
        status: ChangeStatus.PENDING, // Only show pending changes
        // includeDeleted: false, // Exclude undone changes (backend filters this)
      };

      const response = await getChanges(filters);
      setChanges(response.data);
    } catch (err: any) {
      console.error('Failed to fetch changes:', err);
      setError(err);
      toast.error('Failed to load changes', {
        description: err.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  }, [appId]);

  // Manual sync trigger
  const syncChanges = useCallback(async () => {
    if (!sandboxId) return;

    try {
      setSyncing(true);
      toast.info('Syncing changes...', {
        description: 'Detecting changes from platform',
      });

      const result = await apiSyncSandbox(sandboxId);
      
      // Refresh changes after sync
      await fetchChanges();

      toast.success('Sync completed', {
        description: `${result.changeCount} change(s) detected`,
      });
    } catch (err: any) {
      console.error('Failed to sync changes:', err);
      toast.error('Sync failed', {
        description: err.response?.data?.message || 'Please try again',
      });
    } finally {
      setSyncing(false);
    }
  }, [sandboxId, fetchChanges]);

  // Undo a change
  const undoChange = useCallback(async (changeId: string) => {
    try {
      await apiUndoChange(changeId);
      
      // Remove from local state
      setChanges(prev => prev.filter(c => c.id !== changeId));

      toast.success('Change undone', {
        description: 'You can restore it later if needed',
      });
    } catch (err: any) {
      console.error('Failed to undo change:', err);
      toast.error('Failed to undo change', {
        description: err.response?.data?.message || 'Please try again',
      });
    }
  }, []);

  // Restore an undone change
  const restoreChange = useCallback(async (changeId: string) => {
    try {
      const restoredChange = await apiRestoreChange(changeId);
      
      // Add back to local state
      setChanges(prev => [...prev, restoredChange]);

      toast.success('Change restored', {
        description: 'Change is active again',
      });
    } catch (err: any) {
      console.error('Failed to restore change:', err);
      toast.error('Failed to restore change', {
        description: err.response?.data?.message || 'Please try again',
      });
    }
  }, []);

  // Discard all changes
  const discardAllChanges = useCallback(async () => {
    try {
      // Undo all pending changes
      await Promise.all(changes.map(change => undoChange(change.id)));

      toast.success('All changes discarded', {
        description: `${changes.length} changes removed`,
      });
    } catch (err: any) {
      console.error('Failed to discard changes:', err);
      toast.error('Failed to discard all changes', {
        description: 'Some changes may still be active',
      });
    }
  }, [changes, undoChange]);

  // Group changes by component name
  const groupedChanges = useMemo<GroupedChanges>(() => {
    return changes.reduce((groups, change) => {
      // Extract component name from metadata or title
      const componentName = (change.metadata as any)?.componentName || 
                           change.title ||
                           'Unknown Component';

      if (!groups[componentName]) {
        groups[componentName] = [];
      }
      groups[componentName].push(change);
      return groups;
    }, {} as GroupedChanges);
  }, [changes]);

  // Get change counts by type
  const changeStats = useMemo(() => {
    const stats = {
      modified: 0,
      added: 0,
      deleted: 0,
      total: changes.length,
    };

    changes.forEach(change => {
      if (change.changeType === ChangeType.UPDATE) stats.modified++;
      else if (change.changeType === ChangeType.CREATE) stats.added++;
      else if (change.changeType === ChangeType.DELETE) stats.deleted++;
    });

    return stats;
  }, [changes]);

  // Set up WebSocket subscriptions
  useEffect(() => {
    if (!enableRealTime || !sandboxId) return;

    // Subscribe to sandbox room
    const unsubscribe = subscribe({ room: sandboxId });

    // Listen for change events
    const cleanup1 = on('change:detected', (data) => {
      console.log('[Changes] New change detected:', data);
      fetchChanges(); // Refresh changes
      toast.info('New change detected', {
        description: 'Sandbox updated',
      });
    });

    const cleanup2 = on('change:updated', (data) => {
      console.log('[Changes] Change updated:', data);
      fetchChanges();
    });

    const cleanup3 = on('change:deleted', (data) => {
      console.log('[Changes] Change deleted:', data);
      setChanges(prev => prev.filter(c => c.id !== data.changeId));
    });

    const cleanup4 = on('change:restored', (data) => {
      console.log('[Changes] Change restored:', data);
      fetchChanges();
    });

    const cleanup5 = on('sync:started', () => {
      console.log('[Changes] Sync started');
      setSyncing(true);
    });

    const cleanup6 = on('sync:completed', (data) => {
      console.log('[Changes] Sync completed:', data);
      setSyncing(false);
      fetchChanges();
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      cleanup1();
      cleanup2();
      cleanup3();
      cleanup4();
      cleanup5();
      cleanup6();
    };
  }, [enableRealTime, sandboxId, subscribe, on, fetchChanges]);

  // Auto-refresh (polling fallback)
  useEffect(() => {
    if (!autoRefresh || enableRealTime) return; // Skip if WebSocket is enabled

    const interval = setInterval(() => {
      fetchChanges();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, enableRealTime, refreshInterval, fetchChanges]);

  // Initial fetch
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  return {
    changes,
    groupedChanges,
    changeStats,
    loading,
    syncing,
    error,
    syncChanges,
    undoChange,
    restoreChange,
    discardAllChanges,
    refresh: fetchChanges,
  };
}
