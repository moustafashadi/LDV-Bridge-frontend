// ============================================
// GITHUB API CLIENT
// ============================================

import { apiClient } from "./client";
import type {
  GitHubConnectionStatus,
  GitHubRepo,
  FileDiff,
} from "../types/github";

const BASE_PATH = "/github";

/**
 * Get GitHub connection status for the organization
 */
export const getGitHubStatus = () =>
  apiClient.get<GitHubConnectionStatus>(`${BASE_PATH}/status`);

/**
 * Connect GitHub (after OAuth/installation callback)
 */
export const connectGitHub = (data: {
  installationId: string;
  organizationName?: string;
}) =>
  apiClient.post<{ success: boolean; message: string }>(
    `${BASE_PATH}/connect`,
    data
  );

/**
 * Disconnect GitHub from organization
 */
export const disconnectGitHub = () =>
  apiClient.delete<{ success: boolean; message: string }>(
    `${BASE_PATH}/disconnect`
  );

/**
 * Create a GitHub repository for an app
 */
export const createAppRepository = (data: {
  appId: string;
  repoName?: string;
}) => apiClient.post<GitHubRepo>(`${BASE_PATH}/repos`, data);

/**
 * Get file diff between branches
 */
export const getFileDiff = (params: {
  repo: string;
  base: string;
  head: string;
}) => apiClient.get<FileDiff[]>(`${BASE_PATH}/diff`, { params });
