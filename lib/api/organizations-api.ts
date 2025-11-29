// ============================================
// ORGANIZATIONS API CLIENT
// ============================================

import { apiClient } from './client';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface JoinRequest {
  id: string;
  userId: string;
  organizationId: string;
  requestedRole: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  user: {
    email: string;
    name?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationCode {
  id: string;
  code: string;
  organizationId: string;
  role: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  maxUses?: number;
  currentUses: number;
  expiresAt?: Date;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApproveJoinRequestDto {
  role: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
}

export interface RejectJoinRequestDto {
  reason?: string;
}

export interface CreateInvitationCodeDto {
  role: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  maxUses?: number;
  expiresAt?: Date | string;
}

// ============================================
// JOIN REQUESTS API
// ============================================

/**
 * Get pending join requests for organization (admin only)
 */
export async function getPendingJoinRequests(
  organizationId: string
): Promise<JoinRequest[]> {
  const response = await apiClient.get(`/organizations/${organizationId}/join-requests`);
  return response.data;
}

/**
 * Approve a join request (admin only)
 */
export async function approveJoinRequest(
  organizationId: string,
  requestId: string,
  data: ApproveJoinRequestDto
): Promise<void> {
  await apiClient.post(
    `/organizations/${organizationId}/join-requests/${requestId}/approve`,
    data
  );
}

/**
 * Reject a join request (admin only)
 */
export async function rejectJoinRequest(
  organizationId: string,
  requestId: string,
  data: RejectJoinRequestDto
): Promise<void> {
  await apiClient.post(
    `/organizations/${organizationId}/join-requests/${requestId}/reject`,
    data
  );
}

// ============================================
// INVITATION CODES API
// ============================================

/**
 * Get all invitation codes for organization (admin only)
 */
export async function getInvitationCodes(
  organizationId: string
): Promise<InvitationCode[]> {
  const response = await apiClient.get(`/organizations/${organizationId}/invitation-codes`);
  return response.data;
}

/**
 * Create new invitation code (admin only)
 */
export async function createInvitationCode(
  organizationId: string,
  data: CreateInvitationCodeDto
): Promise<InvitationCode> {
  const response = await apiClient.post(
    `/organizations/${organizationId}/invitation-codes`,
    data
  );
  return response.data;
}

/**
 * Deactivate invitation code (admin only)
 */
export async function deactivateInvitationCode(
  organizationId: string,
  codeId: string
): Promise<void> {
  await apiClient.delete(`/organizations/${organizationId}/invitation-codes/${codeId}`);
}
