// ============================================
// SYNC SERVICE HOOKS (Task 9)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  SyncStatusResponse,
  PaginatedSyncHistoryResponse,
  SyncFilters,
  ManualSyncResponse,
  AutomaticSyncResponse,
} from '../types/sync';
import * as syncApi from '../api/sync-api';

/**
 * Hook to fetch sync status for an app
 */
export function useSyncStatus(appId: string | null) {
  const [data, setData] = useState<SyncStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!appId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await syncApi.getSyncStatus(appId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchStatus();

    // Poll every 10 seconds for active syncs
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    status: data,
    isAutoSyncEnabled: data?.isAutoSyncEnabled || false,
    lastSync: data?.lastSync,
    nextSync: data?.nextSync,
    currentStatus: data?.currentStatus,
    loading,
    error,
    refetch: fetchStatus,
  };
}

/**
 * Hook to fetch sync history for an app
 */
export function useSyncHistory(appId: string | null, filters?: SyncFilters) {
  const [data, setData] = useState<PaginatedSyncHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!appId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await syncApi.getSyncHistory(appId, filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [appId, filters?.status, filters?.trigger, filters?.page, filters?.limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchHistory,
  };
}

/**
 * Hook for sync actions
 */
export function useSyncActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const triggerManualSync = async (
    appId: string,
    includeMetadata: boolean = true
  ): Promise<ManualSyncResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await syncApi.triggerManualSync(appId, includeMetadata);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enableAutomaticSync = async (
    appId: string,
    schedule?: string
  ): Promise<AutomaticSyncResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await syncApi.enableAutomaticSync(appId, schedule);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disableAutomaticSync = async (
    appId: string
  ): Promise<AutomaticSyncResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await syncApi.disableAutomaticSync(appId);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    triggerManualSync,
    enableAutomaticSync,
    disableAutomaticSync,
    loading,
    error,
  };
}
