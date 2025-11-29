// ============================================
// APPS API CLIENT
// ============================================

import { apiClient } from './client';

// ============================================
// TYPES & INTERFACES
// ============================================

export type AppAccessLevel = 'VIEWER' | 'EDITOR' | 'OWNER';
export type AppStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'LIVE' | 'ARCHIVED';
export type PlatformType = 'POWERAPPS' | 'MENDIX';

export interface App {
  id: string;
  organizationId: string;
  connectorId: string;
  ownerId: string;
  externalId: string;
  name: string;
  description?: string | null;
  platform: PlatformType;
  status: AppStatus;
  version?: string | null;
  metadata?: any;
  lastSyncedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppPermission {
  id: string;
  appId: string;
  userId: string;
  accessLevel: AppAccessLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    role: string;
    status: string;
  };
  grantedByUser?: {
    id: string;
    email: string;
    displayName?: string | null;
  };
}

export interface UserAppAccess {
  id: string;
  name: string;
  description?: string | null;
  platform: PlatformType;
  status: AppStatus;
  version?: string | null;
  lastSyncedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  accessLevel: AppAccessLevel;
  grantedAt: Date;
  expiresAt?: Date | null;
}

export interface GrantAppAccessDto {
  userIds: string[];
  accessLevel: AppAccessLevel;
  expiresAt?: string;
}

export interface UpdateAppAccessDto {
  accessLevel: AppAccessLevel;
  expiresAt?: string;
}

// ============================================
// API METHODS
// ============================================

/**
 * Grant app access to one or more users
 */
export const grantAppAccess = (appId: string, data: GrantAppAccessDto) =>
  apiClient.post<AppPermission[]>(`/apps/${appId}/access`, data);

/**
 * Get all users with access to an app
 */
export const getAppAccess = (appId: string) =>
  apiClient.get<AppPermission[]>(`/apps/${appId}/access`);

/**
 * Update app access level for a user
 */
export const updateAppAccess = (appId: string, userId: string, data: UpdateAppAccessDto) =>
  apiClient.patch<AppPermission>(`/apps/${appId}/access/${userId}`, data);

/**
 * Revoke app access from a user
 */
export const revokeAppAccess = (appId: string, userId: string) =>
  apiClient.delete(`/apps/${appId}/access/${userId}`);

/**
 * Get all apps a specific user has access to
 */
export const getUserApps = (userId: string) =>
  apiClient.get<UserAppAccess[]>(`/users/${userId}/apps`);

/**
 * Get all apps the current user has access to
 */
export const getMyApps = () =>
  apiClient.get<UserAppAccess[]>(`/apps/me/apps`);

/**
 * Get all apps in the organization (Admin/Pro Developer only)
 */
export const getAllApps = () =>
  apiClient.get<App[]>(`/apps`);

/**
 * Create a new app
 */
export const createApp = (data: {
  name: string;
  description?: string;
  platform: 'POWERAPPS' | 'MENDIX';
  externalId?: string;
  connectorId?: string;
  status?: AppStatus;
  version?: string;
  metadata?: Record<string, any>;
}) =>
  apiClient.post<App>(`/apps`, data);

