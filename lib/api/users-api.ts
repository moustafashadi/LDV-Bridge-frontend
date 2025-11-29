// ============================================
// USERS API CLIENT
// ============================================

import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  organizationId: string;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  status?: 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  search?: string;
}

export interface InviteUserDto {
  email: string;
  role: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  message?: string;
}

export interface UpdateUserDto {
  name?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateUserRoleDto {
  role: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * List users with pagination and filtering
 */
export async function listUsers(params?: ListUsersParams): Promise<PaginatedUsersResponse> {
  const response = await apiClient.get('/users', { params });
  return response.data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/users/me');
  return response.data;
}

/**
 * Get user by ID
 */
export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

/**
 * Update user profile
 */
export async function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  const response = await apiClient.patch(`/users/${id}`, data);
  return response.data;
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(id: string, data: UpdateUserRoleDto): Promise<User> {
  const response = await apiClient.patch(`/users/${id}/role`, data);
  return response.data;
}

/**
 * Invite a new user (admin only)
 */
export async function inviteUser(data: InviteUserDto): Promise<void> {
  await apiClient.post('/users/invite', data);
}

/**
 * Get pending invitations (admin only)
 */
export async function getPendingInvitations(): Promise<Invitation[]> {
  const response = await apiClient.get('/users/invitations/pending');
  return response.data;
}

/**
 * Revoke invitation (admin only)
 */
export async function revokeInvitation(id: string): Promise<void> {
  await apiClient.delete(`/users/invitations/${id}`);
}

/**
 * Deactivate user (admin only)
 */
export async function deactivateUser(id: string): Promise<User> {
  const response = await apiClient.delete(`/users/${id}/deactivate`);
  return response.data;
}

/**
 * Reactivate user (admin only)
 */
export async function reactivateUser(id: string): Promise<User> {
  const response = await apiClient.post(`/users/${id}/reactivate`);
  return response.data;
}

/**
 * Suspend user (admin only)
 */
export async function suspendUser(id: string): Promise<User> {
  const response = await apiClient.post(`/users/${id}/suspend`);
  return response.data;
}
