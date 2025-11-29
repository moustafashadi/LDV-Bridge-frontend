// ============================================
// POLICY ENGINE HOOKS (Task 13)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Policy,
  CreatePolicyDto,
  UpdatePolicyDto,
  EvaluatePolicyDto,
  PolicyEvaluationResult,
  PaginatedPoliciesResponse,
  PolicyStatus,
} from '../types/policies';
import * as policiesApi from '../api/policies-api';

/**
 * Hook to fetch all policies with filters
 */
export function usePolicies(filters?: {
  status?: PolicyStatus;
  targetPlatform?: 'PowerApps' | 'Mendix' | 'ALL';
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedPoliciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.getPolicies(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.targetPlatform, filters?.page, filters?.limit]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchPolicies,
  };
}

/**
 * Hook to fetch a single policy
 */
export function usePolicy(id: string | null) {
  const [data, setData] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPolicy = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.getPolicy(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  return {
    policy: data,
    loading,
    error,
    refetch: fetchPolicy,
  };
}

/**
 * Hook for policy CRUD operations
 */
export function usePolicyMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPolicy = async (data: CreatePolicyDto): Promise<Policy> => {
    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.createPolicy(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (id: string, data: UpdatePolicyDto): Promise<Policy> => {
    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.updatePolicy(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePolicy = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await policiesApi.deletePolicy(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const evaluatePolicy = async (
    policyId: string,
    data: EvaluatePolicyDto
  ): Promise<PolicyEvaluationResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.evaluatePolicy(policyId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activatePolicy = async (id: string): Promise<Policy> => {
    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.activatePolicy(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivatePolicy = async (id: string): Promise<Policy> => {
    try {
      setLoading(true);
      setError(null);
      const result = await policiesApi.deactivatePolicy(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPolicy,
    updatePolicy,
    deletePolicy,
    evaluatePolicy,
    activatePolicy,
    deactivatePolicy,
    loading,
    error,
  };
}
