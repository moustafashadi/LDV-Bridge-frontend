// ============================================
// SYNC SERVICE TYPES (Task 9)
// ============================================
// These types match the backend DTOs exactly

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SyncTrigger {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  SCHEDULED = 'SCHEDULED',
}

export interface SyncHistory {
  id: string;
  appId: string;
  status: SyncStatus;
  trigger: SyncTrigger;
  startedAt: string;
  completedAt?: string;
  duration?: number; // milliseconds
  changesDetected?: number;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ManualSyncDto {
  appId: string;
  includeMetadata?: boolean;
}

export interface ManualSyncResponse {
  success: boolean;
  message: string;
  syncHistoryId: string;
  status: SyncStatus;
}

export interface AutomaticSyncConfigDto {
  appId: string;
  schedule?: string; // Cron expression
  enabled: boolean;
}

export interface AutomaticSyncResponse {
  success: boolean;
  message: string;
  appId: string;
  enabled: boolean;
  schedule?: string;
}

export interface SyncStatusResponse {
  appId: string;
  isAutoSyncEnabled: boolean;
  schedule?: string;
  lastSync?: SyncHistory;
  nextSync?: string;
  currentStatus?: SyncStatus;
}

export interface PaginatedSyncHistoryResponse {
  data: SyncHistory[];
  total: number;
  page: number;
  limit: number;
}

export interface SyncFilters {
  status?: SyncStatus;
  trigger?: SyncTrigger;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}
