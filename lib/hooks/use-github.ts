// ============================================
// GITHUB HOOKS
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
  getGitHubStatus,
  connectGitHub,
  disconnectGitHub,
  createAppRepository,
  getFileDiff,
} from "../api/github-api";
import type {
  GitHubConnectionStatus,
  GitHubRepo,
  FileDiff,
} from "../types/github";

// Query Keys
export const githubKeys = {
  all: ["github"] as const,
  status: () => [...githubKeys.all, "status"] as const,
  diff: (repo: string, base: string, head: string) =>
    [...githubKeys.all, "diff", repo, base, head] as const,
};

/**
 * Get GitHub connection status
 */
export function useGitHubStatus(): UseQueryResult<
  GitHubConnectionStatus,
  Error
> {
  return useQuery({
    queryKey: githubKeys.status(),
    queryFn: async () => {
      const response = await getGitHubStatus();
      return response.data;
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });
}

/**
 * Connect GitHub to organization
 */
export function useConnectGitHub(): UseMutationResult<
  { success: boolean; message: string },
  Error,
  { installationId: string; organizationName?: string },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      installationId: string;
      organizationName?: string;
    }) => {
      const response = await connectGitHub(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
      toast.success("GitHub connected successfully!", {
        description: "You can now create repositories for your apps.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to connect GitHub", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Disconnect GitHub
 */
export function useDisconnectGitHub(): UseMutationResult<
  { success: boolean; message: string },
  Error,
  void,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await disconnectGitHub();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
      toast.success("GitHub disconnected");
    },
    onError: (error: any) => {
      toast.error("Failed to disconnect GitHub", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Create GitHub repository for an app
 */
export function useCreateAppRepository(): UseMutationResult<
  GitHubRepo,
  Error,
  { appId: string; repoName?: string },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { appId: string; repoName?: string }) => {
      const response = await createAppRepository(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast.success("Repository created!", {
        description: `Created ${data.name} on GitHub`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create repository", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Get file diff between branches
 */
export function useFileDiff(
  repo: string,
  base: string,
  head: string,
  enabled: boolean = true
): UseQueryResult<FileDiff[], Error> {
  return useQuery({
    queryKey: githubKeys.diff(repo, base, head),
    queryFn: async () => {
      const response = await getFileDiff({ repo, base, head });
      return response.data;
    },
    enabled: enabled && !!repo && !!base && !!head,
  });
}
