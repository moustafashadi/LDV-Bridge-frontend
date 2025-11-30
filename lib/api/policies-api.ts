// ============================================
// POLICY ENGINE API CLIENT (Task 13)
// ============================================

import { apiClient } from './client';
import {
  Policy,
  CreatePolicyDto,
  UpdatePolicyDto,
  EvaluatePolicyDto,
  PolicyEvaluationResult,
  PaginatedPoliciesResponse,
  PolicyStatus,
} from '../types/policies';

const BASE_PATH = '/policies';

/**
 * Get all policies with optional filters
 */
export async function getPolicies(filters?: {
  status?: PolicyStatus;
  targetPlatform?: 'PowerApps' | 'Mendix' | 'ALL';
  page?: number;
  limit?: number;
}): Promise<PaginatedPoliciesResponse> {
  const response = await apiClient.get<PaginatedPoliciesResponse>(BASE_PATH, {
    params: filters,
  });
  return response.data;
}

/**
 * Get a single policy by ID
 */
export async function getPolicy(id: string): Promise<Policy> {
  const response = await apiClient.get<Policy>(`${BASE_PATH}/${id}`);
  return response.data;
}

/**
 * Create a new policy
 */
export async function createPolicy(data: CreatePolicyDto): Promise<Policy> {
  const response = await apiClient.post<Policy>(BASE_PATH, data);
  return response.data;
}

/**
 * Update an existing policy
 */
export async function updatePolicy(
  id: string,
  data: UpdatePolicyDto
): Promise<Policy> {
  const response = await apiClient.patch<Policy>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

/**
 * Delete a policy
 */
export async function deletePolicy(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/**
 * Evaluate a policy against a change
 */
export async function evaluatePolicy(
  policyId: string,
  data: EvaluatePolicyDto
): Promise<PolicyEvaluationResult> {
  const response = await apiClient.post<PolicyEvaluationResult>(
    `${BASE_PATH}/${policyId}/evaluate`,
    data
  );
  return response.data;
}

/**
 * Activate a policy
 */
export async function activatePolicy(id: string): Promise<Policy> {
  return updatePolicy(id, { status: PolicyStatus.ACTIVE });
}

/**
 * Deactivate a policy
 */
export async function deactivatePolicy(id: string): Promise<Policy> {
  return updatePolicy(id, { status: PolicyStatus.INACTIVE });
}
