import { apiClient } from "./client";
import type {
  Sandbox,
  CreateSandboxRequest,
  UpdateSandboxRequest,
  LinkExistingEnvironmentRequest,
  SandboxStats,
  ExtendExpirationRequest,
  ListSandboxesResponse,
  SandboxFilters,
  QuotaCheckResponse,
  CreateFeatureSandboxRequest,
  SandboxSyncResult,
  SandboxConflictCheck,
} from "../types/sandboxes";

const SANDBOXES_BASE = "/sandboxes";

/**
 * Sandbox Management API Client
 * Provides methods to interact with the sandboxes API
 */
export const sandboxesApi = {
  /**
   * Create a new sandbox with environment provisioning
   * @param data Sandbox creation data
   * @returns Created sandbox with provisioning status
   */
  async create(data: CreateSandboxRequest): Promise<Sandbox> {
    const response = await apiClient.post<Sandbox>(SANDBOXES_BASE, data);
    return response.data;
  },

  /**
   * Create a feature sandbox for a Mendix app
   * Creates branches in both Mendix Team Server and GitHub
   * @param data Feature sandbox creation data
   * @returns Created sandbox with branch information
   */
  async createFeatureSandbox(
    data: CreateFeatureSandboxRequest
  ): Promise<Sandbox> {
    const response = await apiClient.post<Sandbox>(
      `${SANDBOXES_BASE}/feature`,
      data
    );
    return response.data;
  },

  /**
   * Link an existing PowerApps/Mendix environment to LDV-Bridge
   * @param data Environment linking data
   * @returns Created sandbox record linked to existing environment
   */
  async linkExisting(data: LinkExistingEnvironmentRequest): Promise<Sandbox> {
    const response = await apiClient.post<Sandbox>(
      `${SANDBOXES_BASE}/link-existing`,
      data
    );
    return response.data;
  },

  /**
   * List all sandboxes in organization
   * @param filters Optional filters for platform, status, type, pagination
   * @returns List of sandboxes with total count
   */
  async list(filters?: SandboxFilters): Promise<ListSandboxesResponse> {
    const response = await apiClient.get<ListSandboxesResponse>(
      SANDBOXES_BASE,
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * List my sandboxes (current user)
   * @returns List of user's sandboxes with total count
   */
  async listMy(): Promise<ListSandboxesResponse> {
    const response = await apiClient.get<ListSandboxesResponse>(
      `${SANDBOXES_BASE}/my`
    );
    return response.data;
  },

  /**
   * Get sandboxes for a specific app
   * @param appId App ID
   * @returns List of sandboxes for this app
   */
  async getAppSandboxes(appId: string): Promise<Sandbox[]> {
    const response = await apiClient.get<Sandbox[]>(
      `${SANDBOXES_BASE}/app/${appId}`
    );
    return response.data;
  },

  /**
   * Get sandbox by ID
   * @param id Sandbox ID
   * @returns Sandbox details
   */
  async getById(id: string): Promise<Sandbox> {
    const response = await apiClient.get<Sandbox>(`${SANDBOXES_BASE}/${id}`);
    return response.data;
  },

  /**
   * Update sandbox metadata
   * @param id Sandbox ID
   * @param data Update data
   * @returns Updated sandbox
   */
  async update(id: string, data: UpdateSandboxRequest): Promise<Sandbox> {
    const response = await apiClient.patch<Sandbox>(
      `${SANDBOXES_BASE}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete sandbox and deprovision environment
   * @param id Sandbox ID
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${SANDBOXES_BASE}/${id}`);
  },

  /**
   * Sync sandbox - exports from Team Server and commits to GitHub
   * Triggers change detection, CI/CD pipeline, and risk analysis
   * @param id Sandbox ID
   * @param changeTitle Title for the change record
   * @returns Sync result with commit info and changes detected
   */
  async syncSandbox(
    id: string,
    changeTitle?: string
  ): Promise<SandboxSyncResult> {
    // Use a much longer timeout for sync operations (10 minutes)
    // as cloning and uploading to GitHub can take several minutes
    const response = await apiClient.post<SandboxSyncResult>(
      `${SANDBOXES_BASE}/${id}/sync`,
      { changeTitle },
      { timeout: 600000 } // 10 minutes
    );
    return response.data;
  },

  /**
   * Submit sandbox for review
   * Exports model, commits to GitHub, runs change detection
   * @param id Sandbox ID
   * @returns Updated sandbox
   */
  async submitForReview(id: string): Promise<Sandbox> {
    const response = await apiClient.post<Sandbox>(
      `${SANDBOXES_BASE}/${id}/submit`
    );
    return response.data;
  },

  /**
   * Check for conflicts with main branch
   * @param id Sandbox ID
   * @returns Conflict check result
   */
  async checkConflicts(id: string): Promise<SandboxConflictCheck> {
    const response = await apiClient.get<SandboxConflictCheck>(
      `${SANDBOXES_BASE}/${id}/conflicts`
    );
    return response.data;
  },

  /**
   * Abandon sandbox and delete branches
   * @param id Sandbox ID
   * @returns Updated sandbox with ABANDONED status
   */
  async abandonSandbox(id: string): Promise<Sandbox> {
    const response = await apiClient.post<Sandbox>(
      `${SANDBOXES_BASE}/${id}/abandon`
    );
    return response.data;
  },

  /**
   * Start sandbox environment (Mendix only)
   * @param id Sandbox ID
   */
  async start(id: string): Promise<void> {
    await apiClient.post(`${SANDBOXES_BASE}/${id}/start`);
  },

  /**
   * Stop sandbox environment (Mendix only)
   * @param id Sandbox ID
   */
  async stop(id: string): Promise<void> {
    await apiClient.post(`${SANDBOXES_BASE}/${id}/stop`);
  },

  /**
   * Get sandbox resource usage statistics
   * @param id Sandbox ID
   * @returns Resource usage stats
   */
  async getStats(id: string): Promise<SandboxStats> {
    const response = await apiClient.get<SandboxStats>(
      `${SANDBOXES_BASE}/${id}/stats`
    );
    return response.data;
  },

  /**
   * Extend sandbox expiration date
   * @param id Sandbox ID
   * @param days Number of days to extend
   * @returns Updated sandbox
   */
  async extendExpiration(id: string, days: number): Promise<Sandbox> {
    const response = await apiClient.post<Sandbox>(
      `${SANDBOXES_BASE}/${id}/extend`,
      { days } as ExtendExpirationRequest
    );
    return response.data;
  },

  /**
   * Check if user can create more sandboxes (quota check)
   */
  async checkQuota(): Promise<QuotaCheckResponse> {
    try {
      const { data, total } = await this.listMy();
      const maxAllowed = 5;
      return {
        canCreate: total < maxAllowed,
        currentCount: total,
        maxAllowed,
        reason: total >= maxAllowed ? "Quota limit reached" : undefined,
      };
    } catch (error) {
      console.error("Error checking sandbox quota:", error);
      return {
        canCreate: false,
        currentCount: 0,
        maxAllowed: 5,
        reason: "Error checking quota",
      };
    }
  },
};

export default sandboxesApi;
