// ============================================
// USERS HOOKS (React Query)
// ============================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import * as usersApi from "@/lib/api/users-api";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: usersApi.ListUsersParams) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
  invitations: () => [...userKeys.all, "invitations"] as const,
};

/**
 * Hook to fetch users list
 */
export function useUsers(params?: usersApi.ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.listUsers(params),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersApi.getCurrentUser(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single user
 */
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch pending invitations
 */
export function usePendingInvitations() {
  return useQuery({
    queryKey: userKeys.invitations(),
    queryFn: () => usersApi.getPendingInvitations(),
    staleTime: 30000,
  });
}

/**
 * Hook to invite a user
 */
export function useInviteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.invitations() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: "Invitation sent",
        description: "User invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: usersApi.UpdateUserDto }) =>
      usersApi.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: usersApi.UpdateUserRoleDto["role"];
    }) => usersApi.updateUserRole(id, { role }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update role",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to revoke invitation
 */
export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.invitations() });
      toast({
        title: "Invitation revoked",
        description: "User invitation has been revoked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to revoke invitation",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to deactivate a user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.deactivateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: "User deactivated",
        description: "User has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate user",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to reactivate a user
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.reactivateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: "User reactivated",
        description: "User has been reactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reactivate user",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to suspend a user
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersApi.suspendUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: "User suspended",
        description: "User has been suspended successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to suspend user",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
}
