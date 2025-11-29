import { useState, useCallback } from 'react';
import { sandboxesApi } from '@/lib/api/sandboxes-api';
import type {
  Sandbox,
  CreateSandboxRequest,
  UpdateSandboxRequest,
  SandboxFilters,
  SandboxStats,
  ListSandboxesResponse,
} from '@/lib/types/sandboxes';

export interface UseSandboxesResult {
  sandboxes: Sandbox[];
  loading: boolean;
  error: string | null;
  total: number;
  
  // CRUD operations
  fetchSandboxes: (filters?: SandboxFilters) => Promise<void>;
  fetchMySandboxes: () => Promise<void>;
  fetchSandbox: (id: string) => Promise<Sandbox | null>;
  createSandbox: (data: CreateSandboxRequest) => Promise<Sandbox | null>;
  updateSandbox: (id: string, data: UpdateSandboxRequest) => Promise<Sandbox | null>;
  deleteSandbox: (id: string) => Promise<boolean>;
  
  // Lifecycle operations
  startSandbox: (id: string) => Promise<boolean>;
  stopSandbox: (id: string) => Promise<boolean>;
  
  // Stats and management
  getSandboxStats: (id: string) => Promise<SandboxStats | null>;
  extendExpiration: (id: string, days: number) => Promise<Sandbox | null>;
  checkQuota: () => Promise<{ canCreate: boolean; currentCount: number; maxAllowed: number; reason?: string }>;
}

/**
 * Custom hook for sandbox management
 * Provides all CRUD and lifecycle operations for sandboxes
 */
export function useSandboxes(): UseSandboxesResult {
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  /**
   * Fetch all sandboxes with optional filters
   */
  const fetchSandboxes = useCallback(async (filters?: SandboxFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ListSandboxesResponse = await sandboxesApi.list(filters);
      setSandboxes(response.data);
      setTotal(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sandboxes';
      setError(message);
      console.error('Error fetching sandboxes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch current user's sandboxes
   */
  const fetchMySandboxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ListSandboxesResponse = await sandboxesApi.listMy();
      setSandboxes(response.data);
      setTotal(response.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch your sandboxes';
      setError(message);
      console.error('Error fetching my sandboxes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single sandbox by ID
   */
  const fetchSandbox = useCallback(async (id: string): Promise<Sandbox | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const sandbox = await sandboxesApi.getById(id);
      return sandbox;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sandbox';
      setError(message);
      console.error('Error fetching sandbox:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new sandbox
   */
  const createSandbox = useCallback(async (data: CreateSandboxRequest): Promise<Sandbox | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const sandbox = await sandboxesApi.create(data);
      
      // Update local state
      setSandboxes(prev => [sandbox, ...prev]);
      setTotal(prev => prev + 1);
      
      return sandbox;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create sandbox';
      setError(message);
      console.error('Error creating sandbox:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update sandbox metadata
   */
  const updateSandbox = useCallback(async (id: string, data: UpdateSandboxRequest): Promise<Sandbox | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await sandboxesApi.update(id, data);
      
      // Update local state
      setSandboxes(prev => prev.map(s => s.id === id ? updated : s));
      
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sandbox';
      setError(message);
      console.error('Error updating sandbox:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a sandbox
   */
  const deleteSandbox = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await sandboxesApi.delete(id);
      
      // Update local state
      setSandboxes(prev => prev.filter(s => s.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete sandbox';
      setError(message);
      console.error('Error deleting sandbox:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Start a sandbox (Mendix only)
   */
  const startSandbox = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await sandboxesApi.start(id);
      
      // Update local state
      setSandboxes(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'ACTIVE' as any } : s
      ));
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start sandbox';
      setError(message);
      console.error('Error starting sandbox:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Stop a sandbox (Mendix only)
   */
  const stopSandbox = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await sandboxesApi.stop(id);
      
      // Update local state
      setSandboxes(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'STOPPED' as any } : s
      ));
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop sandbox';
      setError(message);
      console.error('Error stopping sandbox:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get sandbox resource usage statistics
   */
  const getSandboxStats = useCallback(async (id: string): Promise<SandboxStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await sandboxesApi.getStats(id);
      return stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sandbox stats';
      setError(message);
      console.error('Error fetching sandbox stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Extend sandbox expiration
   */
  const extendExpiration = useCallback(async (id: string, days: number): Promise<Sandbox | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await sandboxesApi.extendExpiration(id, days);
      
      // Update local state
      setSandboxes(prev => prev.map(s => s.id === id ? updated : s));
      
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extend sandbox expiration';
      setError(message);
      console.error('Error extending expiration:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user can create more sandboxes
   */
  const checkQuota = useCallback(async () => {
    try {
      return await sandboxesApi.checkQuota();
    } catch (err) {
      console.error('Error checking quota:', err);
      return {
        canCreate: false,
        currentCount: 0,
        maxAllowed: 0,
        reason: 'Failed to check quota',
      };
    }
  }, []);

  return {
    sandboxes,
    loading,
    error,
    total,
    fetchSandboxes,
    fetchMySandboxes,
    fetchSandbox,
    createSandbox,
    updateSandbox,
    deleteSandbox,
    startSandbox,
    stopSandbox,
    getSandboxStats,
    extendExpiration,
    checkQuota,
  };
}

export default useSandboxes;
