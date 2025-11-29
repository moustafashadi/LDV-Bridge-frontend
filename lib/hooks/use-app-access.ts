// ============================================
// APP ACCESS HOOKS (React Query)
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as appsApi from '../api/apps-api';

// ============================================
// QUERY KEYS
// ============================================

const appsKeys = {
  all: ['apps'] as const,
  access: (appId: string) => [...appsKeys.all, 'access', appId] as const,
  userApps: (userId: string) => [...appsKeys.all, 'user-apps', userId] as const,
  myApps: () => [...appsKeys.all, 'my-apps'] as const,
};

// ============================================
// APP ACCESS HOOKS
// ============================================

/**
 * Hook to fetch users with access to an app
 */
export function useAppAccess(appId: string, enabled = true) {
  return useQuery({
    queryKey: appsKeys.access(appId),
    queryFn: async () => {
      const response = await appsApi.getAppAccess(appId)
      return response.data
    },
    enabled: enabled && !!appId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to grant app access to users
 */
export function useGrantAppAccess(appId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: appsApi.GrantAppAccessDto) => appsApi.grantAppAccess(appId, data),
    onSuccess: (response) => {
      const permissions = response.data;
      queryClient.invalidateQueries({ queryKey: appsKeys.access(appId) });
      // Also invalidate user apps for each granted user
      permissions.forEach((permission) => {
        queryClient.invalidateQueries({ queryKey: appsKeys.userApps(permission.userId) });
      });
      toast.success('Access granted successfully', {
        description: `${permissions.length} user(s) now have access to this app`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to grant access', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to update app access level
 */
export function useUpdateAppAccess(appId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: appsApi.UpdateAppAccessDto }) =>
      appsApi.updateAppAccess(appId, userId, data),
    onSuccess: (response) => {
      const permission = response.data;
      queryClient.invalidateQueries({ queryKey: appsKeys.access(appId) });
      queryClient.invalidateQueries({ queryKey: appsKeys.userApps(permission.userId) });
      toast.success('Access level updated', {
        description: `User now has ${permission.accessLevel} access`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update access', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to revoke app access
 */
export function useRevokeAppAccess(appId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => appsApi.revokeAppAccess(appId, userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: appsKeys.access(appId) });
      queryClient.invalidateQueries({ queryKey: appsKeys.userApps(userId) });
      toast.success('Access revoked', {
        description: 'User no longer has access to this app',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to revoke access', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}

// ============================================
// USER APPS HOOKS
// ============================================

/**
 * Hook to fetch apps a user has access to
 */
export function useUserApps(userId: string, enabled = true) {
  return useQuery({
    queryKey: appsKeys.userApps(userId),
    queryFn: async () => {
      const response = await appsApi.getUserApps(userId)
      return response.data
    },
    enabled: enabled && !!userId,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch apps the current user has access to
 */
export function useMyApps(enabled = true) {
  return useQuery({
    queryKey: appsKeys.myApps(),
    queryFn: async () => {
      const response = await appsApi.getMyApps()
      return response.data
    },
    enabled,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch all apps in the organization (Admin/Pro Developer only)
 */
export function useAllApps(enabled = true) {
  return useQuery({
    queryKey: ['apps', 'all'],
    queryFn: async () => {
      const response = await appsApi.getAllApps()
      return response.data
    },
    enabled,
    staleTime: 30000,
  });
}

/**
 * Hook to create a new app
 */
export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof appsApi.createApp>[0]) => 
      appsApi.createApp(data),
    onSuccess: async (response) => {
      const app = response.data;
      // Invalidate all app-related queries
      await queryClient.invalidateQueries({ queryKey: ['apps'] });
      
      toast.success('App created successfully', {
        description: `${app.name} has been added to your organization`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create app', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}
