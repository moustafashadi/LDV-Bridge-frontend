// ============================================
// LINKED ENVIRONMENTS API CLIENT
// ============================================

import { apiClient } from "./client";
import type {
  LinkedEnvironment,
  LinkedEnvironmentWithApps,
  CreateLinkedEnvironmentDto,
} from "../types/linked-environments";

const BASE_PATH = "/linked-environments";

/**
 * Link a PowerApps environment to LDV-Bridge
 * This does NOT create a sandbox - just tracks the environment
 */
export const linkEnvironment = (data: CreateLinkedEnvironmentDto) =>
  apiClient.post<LinkedEnvironment>(BASE_PATH, data);

/**
 * Get all linked environments for the organization
 */
export const getLinkedEnvironments = (params?: {
  platform?: "POWERAPPS";
  isActive?: boolean;
}) => apiClient.get<LinkedEnvironment[]>(BASE_PATH, { params });

/**
 * Get a specific linked environment by ID
 */
export const getLinkedEnvironment = (id: string) =>
  apiClient.get<LinkedEnvironment>(`${BASE_PATH}/${id}`);

/**
 * Get a linked environment with its apps from the platform
 */
export const getLinkedEnvironmentWithApps = (id: string) =>
  apiClient.get<LinkedEnvironmentWithApps>(`${BASE_PATH}/${id}/apps`);

/**
 * Unlink an environment (soft delete)
 */
export const unlinkEnvironment = (id: string) =>
  apiClient.delete(`${BASE_PATH}/${id}`);

// ============================================
// APP SYNC FROM ENVIRONMENT
// ============================================

/**
 * Sync a PowerApp from a linked environment to LDV-Bridge.
 * This creates the App record in our database if it doesn't exist,
 * then triggers a sync to fetch the latest metadata.
 */
export const syncPowerAppToLDVBridge = (externalAppId: string) =>
  apiClient.post<{
    success: boolean;
    appId: string;
    componentsCount: number;
    changesDetected: number;
    syncedAt: string;
    errors?: string[];
  }>(`/connectors/powerapps/apps/${externalAppId}/sync`);
