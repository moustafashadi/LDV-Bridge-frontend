// ============================================
// SYNC SERVICE API CLIENT (Task 9)
// ============================================

import { apiClient } from './client';
import {
  ManualSyncDto,
  ManualSyncResponse,
  AutomaticSyncConfigDto,
  AutomaticSyncResponse,
  SyncStatusResponse,
  PaginatedSyncHistoryResponse,
  SyncFilters,
} from '../types/sync';

const BASE_PATH = '/sync';

/**
 * Trigger a manual sync for an app
 */
export async function triggerManualSync(
  appId: string,
  includeMetadata: boolean = true
): Promise<ManualSyncResponse> {
  const response = await apiClient.post<ManualSyncResponse>(
    `${BASE_PATH}/manual/${appId}`,
    { includeMetadata }
  );
  return response.data;
}

/**
 * Enable automatic sync for an app
 */
export async function enableAutomaticSync(
  appId: string,
  schedule?: string
): Promise<AutomaticSyncResponse> {
  const response = await apiClient.post<AutomaticSyncResponse>(
    `${BASE_PATH}/automatic/${appId}/enable`,
    { schedule }
  );
  return response.data;
}

/**
 * Disable automatic sync for an app
 */
export async function disableAutomaticSync(
  appId: string
): Promise<AutomaticSyncResponse> {
  const response = await apiClient.post<AutomaticSyncResponse>(
    `${BASE_PATH}/automatic/${appId}/disable`
  );
  return response.data;
}

/**
 * Get sync status for an app
 */
export async function getSyncStatus(appId: string): Promise<SyncStatusResponse> {
  const response = await apiClient.get<SyncStatusResponse>(
    `${BASE_PATH}/status/${appId}`
  );
  return response.data;
}

/**
 * Get sync history for an app
 */
export async function getSyncHistory(
  appId: string,
  filters?: SyncFilters
): Promise<PaginatedSyncHistoryResponse> {
  const response = await apiClient.get<PaginatedSyncHistoryResponse>(
    `${BASE_PATH}/history/${appId}`,
    {
      params: filters,
    }
  );
  return response.data;
}
