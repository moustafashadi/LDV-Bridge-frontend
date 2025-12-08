// ============================================
// CHANGE DETECTION ENGINE API CLIENT (Task 11)
// ============================================

import { apiClient } from './client';
import {
  Change,
  DetectChangesDto,
  DetectChangesResponse,
  UpdateChangeStatusDto,
  PaginatedChangesResponse,
  ChangeFilters,
  ChangeWithDetails,
  DiffOperation,
  ImpactAnalysis,
} from '../types/changes';

const BASE_PATH = '/changes';

/**
 * Detect changes in an app
 */
export async function detectChanges(
  appId: string,
  options?: {
    includeImpactAnalysis?: boolean;
    includeRiskAssessment?: boolean;
  }
): Promise<DetectChangesResponse> {
  const response = await apiClient.post<DetectChangesResponse>(
    `${BASE_PATH}/detect/${appId}`,
    options || {}
  );
  return response.data;
}

/**
 * Get all changes with optional filters
 */
export async function getChanges(
  filters?: ChangeFilters
): Promise<PaginatedChangesResponse> {
  const response = await apiClient.get<PaginatedChangesResponse>(BASE_PATH, {
    params: filters,
  });
  return response.data;
}

/**
 * Get a single change by ID
 */
export async function getChange(id: string): Promise<ChangeWithDetails> {
  const response = await apiClient.get<ChangeWithDetails>(`${BASE_PATH}/${id}`);
  return response.data;
}

/**
 * Update change status
 */
export async function updateChangeStatus(
  id: string,
  data: UpdateChangeStatusDto
): Promise<Change> {
  const response = await apiClient.put<Change>(
    `${BASE_PATH}/${id}/status`,
    data
  );
  return response.data;
}

/**
 * Get diff operations for a change
 */
export async function getChangeDiff(id: string): Promise<DiffOperation[]> {
  const response = await apiClient.get<DiffOperation[]>(
    `${BASE_PATH}/${id}/diff`
  );
  return response.data;
}

/**
 * Get impact analysis for a change
 */
export async function getChangeImpact(id: string): Promise<ImpactAnalysis> {
  const response = await apiClient.get<ImpactAnalysis>(
    `${BASE_PATH}/${id}/impact`
  );
  return response.data;
}

/**
 * Get changes for a specific app
 */
export async function getAppChanges(
  appId: string,
  filters?: Omit<ChangeFilters, 'appId'>
): Promise<PaginatedChangesResponse> {
  return getChanges({ ...filters, appId });
}

/**
 * Get user's changes
 */
export async function getMyChanges(
  userId: string,
  filters?: Omit<ChangeFilters, 'authorId'>
): Promise<PaginatedChangesResponse> {
  return getChanges({ ...filters, authorId: userId });
}

/**
 * Manually sync changes from a sandbox environment
 */
export async function syncSandbox(
  sandboxId: string
): Promise<{ success: boolean; message: string; changeCount: number }> {
  const response = await apiClient.post<{ success: boolean; message: string; changeCount: number }>(
    `${BASE_PATH}/sync/${sandboxId}`
  );
  return response.data;
}

/**
 * Undo a change (soft delete)
 */
export async function undoChange(changeId: string): Promise<Change> {
  const response = await apiClient.post<Change>(
    `${BASE_PATH}/${changeId}/undo`
  );
  return response.data;
}

/**
 * Restore a deleted change
 */
export async function restoreChange(changeId: string): Promise<Change> {
  const response = await apiClient.post<Change>(
    `${BASE_PATH}/${changeId}/restore`
  );
  return response.data;
}
