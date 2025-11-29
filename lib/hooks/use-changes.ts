// ============================================
// CHANGE DETECTION HOOKS (Task 11)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Change,
  ChangeWithDetails,
  PaginatedChangesResponse,
  ChangeFilters,
  DetectChangesResponse,
  UpdateChangeStatusDto,
  DiffOperation,
  ImpactAnalysis,
} from '../types/changes';
import * as changesApi from '../api/changes-api';

/**
 * Hook to fetch changes with filters
 */
export function useChanges(filters?: ChangeFilters) {
  const [data, setData] = useState<PaginatedChangesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.getChanges(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.appId,
    filters?.status,
    filters?.changeType,
    filters?.authorId,
    filters?.riskLevel,
    filters?.search,
    filters?.from,
    filters?.to,
    filters?.page,
    filters?.limit,
  ]);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  return {
    changes: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchChanges,
  };
}

/**
 * Hook to fetch a single change with full details
 */
export function useChange(id: string | null) {
  const [data, setData] = useState<ChangeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChange = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.getChange(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChange();
  }, [fetchChange]);

  return {
    change: data,
    loading,
    error,
    refetch: fetchChange,
  };
}

/**
 * Hook to fetch change diff
 */
export function useChangeDiff(changeId: string | null) {
  const [data, setData] = useState<DiffOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDiff = useCallback(async () => {
    if (!changeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.getChangeDiff(changeId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [changeId]);

  useEffect(() => {
    fetchDiff();
  }, [fetchDiff]);

  return {
    diff: data,
    loading,
    error,
    refetch: fetchDiff,
  };
}

/**
 * Hook to fetch change impact analysis
 */
export function useChangeImpact(changeId: string | null) {
  const [data, setData] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchImpact = useCallback(async () => {
    if (!changeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.getChangeImpact(changeId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [changeId]);

  useEffect(() => {
    fetchImpact();
  }, [fetchImpact]);

  return {
    impact: data,
    loading,
    error,
    refetch: fetchImpact,
  };
}

/**
 * Hook for my changes (current user)
 */
export function useMyChanges(userId: string, filters?: Omit<ChangeFilters, 'authorId'>) {
  const [data, setData] = useState<PaginatedChangesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyChanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.getMyChanges(userId, filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    filters?.appId,
    filters?.status,
    filters?.changeType,
    filters?.riskLevel,
    filters?.search,
    filters?.from,
    filters?.to,
    filters?.page,
    filters?.limit,
  ]);

  useEffect(() => {
    fetchMyChanges();
  }, [fetchMyChanges]);

  return {
    changes: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchMyChanges,
  };
}

/**
 * Hook for change mutations
 */
export function useChangeMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detectChanges = async (
    appId: string,
    options?: {
      includeImpactAnalysis?: boolean;
      includeRiskAssessment?: boolean;
    }
  ): Promise<DetectChangesResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.detectChanges(appId, options);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateChangeStatus = async (
    id: string,
    data: UpdateChangeStatusDto
  ): Promise<Change> => {
    try {
      setLoading(true);
      setError(null);
      const result = await changesApi.updateChangeStatus(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    detectChanges,
    updateChangeStatus,
    loading,
    error,
  };
}
