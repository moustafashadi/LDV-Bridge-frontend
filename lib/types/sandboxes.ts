/**
 * Sandbox Management Types
 * Mirrors backend DTOs for type safety
 */

export enum SandboxPlatform {
  POWERAPPS = 'POWERAPPS',
  MENDIX = 'MENDIX',
}

export enum SandboxStatus {
  PROVISIONING = 'PROVISIONING',
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
  EXPIRED = 'EXPIRED',
  ERROR = 'ERROR',
}

export enum SandboxType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM',
  TRIAL = 'TRIAL',
}

export enum ProvisioningStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Sandbox response from API
 */
export interface Sandbox {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  description?: string;
  status: SandboxStatus;
  platform: SandboxPlatform;
  type: SandboxType;
  provisioningStatus: ProvisioningStatus;
  environmentId?: string;
  environmentUrl?: string;
  region?: string;
  appId?: string; // Linked application ID
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create sandbox request
 */
export interface CreateSandboxRequest {
  name: string;
  description?: string;
  platform: SandboxPlatform;
  type: SandboxType;
  expiresAt?: string;
  region?: string;
  sourceAppId?: string; // For cloning existing apps
}

/**
 * Update sandbox request
 */
export interface UpdateSandboxRequest {
  name?: string;
  description?: string;
  expiresAt?: string;
}

/**
 * Sandbox resource usage statistics
 */
export interface SandboxStats {
  sandboxId: string;
  appsCount: number;
  apiCallsUsed: number;
  storageUsed: number;
  quotas: {
    maxApps: number;
    maxApiCalls: number;
    maxStorage: number;
  };
  lastUpdated: string;
}

/**
 * Extend expiration request
 */
export interface ExtendExpirationRequest {
  days: number;
}

/**
 * List sandboxes response
 */
export interface ListSandboxesResponse {
  data: Sandbox[];
  total: number;
}

/**
 * Query filters for listing sandboxes
 */
export interface SandboxFilters {
  platform?: SandboxPlatform;
  status?: SandboxStatus;
  type?: SandboxType;
  page?: number;
  limit?: number;
}

/**
 * Sandbox quota check response
 */
export interface QuotaCheckResponse {
  canCreate: boolean;
  currentCount: number;
  maxAllowed: number;
  reason?: string;
}
