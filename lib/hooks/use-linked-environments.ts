// ============================================
// LINKED ENVIRONMENTS HOOKS
// ============================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  linkEnvironment,
  getLinkedEnvironments,
  getLinkedEnvironment,
  getLinkedEnvironmentWithApps,
  unlinkEnvironment,
  syncAppToLDVBridge,
} from "../api/linked-environments-api";
import type {
  LinkedEnvironment,
  LinkedEnvironmentWithApps,
  CreateLinkedEnvironmentDto,
} from "../types/linked-environments";

// Query Keys
export const linkedEnvironmentKeys = {
  all: ["linked-environments"] as const,
  list: () => [...linkedEnvironmentKeys.all, "list"] as const,
  detail: (id: string) => [...linkedEnvironmentKeys.all, "detail", id] as const,
  withApps: (id: string) =>
    [...linkedEnvironmentKeys.all, "with-apps", id] as const,
};

/**
 * Get all linked environments
 */
export function useLinkedEnvironments(params?: {
  platform?: "POWERAPPS";
  isActive?: boolean;
}): UseQueryResult<LinkedEnvironment[], Error> {
  return useQuery({
    queryKey: [...linkedEnvironmentKeys.list(), params],
    queryFn: async () => {
      const response = await getLinkedEnvironments(params);
      return response.data;
    },
  });
}

/**
 * Get a specific linked environment
 */
export function useLinkedEnvironment(
  id: string
): UseQueryResult<LinkedEnvironment, Error> {
  return useQuery({
    queryKey: linkedEnvironmentKeys.detail(id),
    queryFn: async () => {
      const response = await getLinkedEnvironment(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get a linked environment with apps from the platform
 */
export function useLinkedEnvironmentWithApps(
  id: string
): UseQueryResult<LinkedEnvironmentWithApps, Error> {
  return useQuery({
    queryKey: linkedEnvironmentKeys.withApps(id),
    queryFn: async () => {
      const response = await getLinkedEnvironmentWithApps(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Link a new PowerApps environment
 */
export function useLinkEnvironment(): UseMutationResult<
  LinkedEnvironment,
  Error,
  CreateLinkedEnvironmentDto,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLinkedEnvironmentDto) => {
      const response = await linkEnvironment(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: linkedEnvironmentKeys.all });
      toast.success("Environment linked successfully!", {
        description: `${data.name} is now connected to LDV-Bridge`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to link environment", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Unlink an environment
 */
export function useUnlinkEnvironment(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await unlinkEnvironment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedEnvironmentKeys.all });
      toast.success("Environment unlinked");
    },
    onError: (error: any) => {
      toast.error("Failed to unlink environment", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Sync a PowerApp from environment to LDV-Bridge
 * This creates the App record if it doesn't exist, then syncs it
 */
export function useSyncAppToLDVBridge(): UseMutationResult<
  {
    success: boolean;
    appId: string;
    componentsCount: number;
    changesDetected: number;
    syncedAt: string;
  },
  Error,
  { externalAppId: string; appName: string; platform: "POWERAPPS" | "MENDIX" },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ externalAppId, platform }) => {
      const response = await syncAppToLDVBridge(externalAppId, platform);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: linkedEnvironmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["apps"] }); // Invalidate apps list
      toast.success(`App synced to LDV-Bridge!`, {
        description: `"${variables.appName}" is now being tracked. Changes will be detected automatically.`,
      });
    },
    onError: (error: any, variables) => {
      toast.error(`Failed to sync ${variables.appName}`, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}
