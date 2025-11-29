// ============================================
// ORGANIZATIONS HOOKS
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getInvitationCodes,
  createInvitationCode,
  deactivateInvitationCode,
  type ApproveJoinRequestDto,
  type RejectJoinRequestDto,
  type CreateInvitationCodeDto,
} from '../api/organizations-api';

// ============================================
// QUERY KEYS
// ============================================

const organizationsKeys = {
  all: ['organizations'] as const,
  joinRequests: (orgId: string) => [...organizationsKeys.all, 'join-requests', orgId] as const,
  invitationCodes: (orgId: string) => [...organizationsKeys.all, 'invitation-codes', orgId] as const,
};

// ============================================
// JOIN REQUESTS HOOKS
// ============================================

/**
 * Hook to fetch pending join requests
 */
export function useJoinRequests(organizationId: string, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.joinRequests(organizationId),
    queryFn: () => getPendingJoinRequests(organizationId),
    enabled: enabled && !!organizationId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to approve a join request
 */
export function useApproveJoinRequest(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ApproveJoinRequestDto }) =>
      approveJoinRequest(organizationId, requestId, data),
    onSuccess: () => {
      toast.success('Join request approved');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: organizationsKeys.joinRequests(organizationId) });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve join request');
    },
  });
}

/**
 * Hook to reject a join request
 */
export function useRejectJoinRequest(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: RejectJoinRequestDto }) =>
      rejectJoinRequest(organizationId, requestId, data),
    onSuccess: () => {
      toast.success('Join request rejected');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: organizationsKeys.joinRequests(organizationId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject join request');
    },
  });
}

// ============================================
// INVITATION CODES HOOKS
// ============================================

/**
 * Hook to fetch invitation codes
 */
export function useInvitationCodes(organizationId: string, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.invitationCodes(organizationId),
    queryFn: () => getInvitationCodes(organizationId),
    enabled: enabled && !!organizationId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to create invitation code
 */
export function useCreateInvitationCode(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationCodeDto) => createInvitationCode(organizationId, data),
    onSuccess: () => {
      toast.success('Invitation code created');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: organizationsKeys.invitationCodes(organizationId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invitation code');
    },
  });
}

/**
 * Hook to deactivate invitation code
 */
export function useDeactivateInvitationCode(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeId: string) => deactivateInvitationCode(organizationId, codeId),
    onSuccess: () => {
      toast.success('Invitation code deactivated');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: organizationsKeys.invitationCodes(organizationId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate invitation code');
    },
  });
}
