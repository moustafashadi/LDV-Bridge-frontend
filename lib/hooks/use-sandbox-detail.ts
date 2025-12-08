// ============================================
// SANDBOX DETAIL HOOK
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { sandboxesApi } from '../api/sandboxes-api';
import type { Sandbox } from '../types/sandboxes';
import { toast } from 'sonner';

export function useSandboxDetail(sandboxId: string) {
  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSandbox = useCallback(async () => {
    if (!sandboxId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await sandboxesApi.getById(sandboxId);
      setSandbox(data);
    } catch (err: any) {
      console.error('Failed to fetch sandbox:', err);
      setError(err);
      toast.error('Failed to load sandbox', {
        description: err.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  }, [sandboxId]);

  useEffect(() => {
    fetchSandbox();
  }, [fetchSandbox]);

  const refresh = useCallback(() => {
    fetchSandbox();
  }, [fetchSandbox]);

  return {
    sandbox,
    loading,
    error,
    refresh,
  };
}
