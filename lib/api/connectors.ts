import apiClient from './client';
import type {
  ConnectionStatusResponse,
  PowerAppsConnectResponse,
  PowerAppsEnvironment,
  PowerAppsApp,
  PowerAppsAppDetail,
  MendixSetupInstructions,
  MendixConnectRequest,
  MendixConnectResponse,
  MendixProject,
  MendixApp,
  MendixAppDetail,
  TestConnectionResponse,
  DisconnectResponse,
  SyncAppResponse,
  ExportAppResponse,
  PlatformType,
} from '../types/connectors';

const CONNECTORS_BASE = '/connectors';

// ============================================
// PowerApps Connector API
// ============================================

export const powerAppsApi = {
  /**
   * Initiate PowerApps OAuth connection flow
   * Returns authorization URL to redirect user to
   */
  async connect(): Promise<PowerAppsConnectResponse> {
    const response = await apiClient.post<PowerAppsConnectResponse>(
      `${CONNECTORS_BASE}/powerapps/connect`
    );
    return response.data;
  },

  /**
   * Handle OAuth callback after user authorizes
   * Called by the callback page with code and state from URL
   */
  async handleCallback(code: string, state: string): Promise<void> {
    await apiClient.get(`${CONNECTORS_BASE}/powerapps/callback`, {
      params: { code, state },
    });
  },

  /**
   * Disconnect PowerApps account
   */
  async disconnect(): Promise<DisconnectResponse> {
    const response = await apiClient.post<DisconnectResponse>(
      `${CONNECTORS_BASE}/powerapps/disconnect`
    );
    return response.data;
  },

  /**
   * Test PowerApps connection
   */
  async test(): Promise<TestConnectionResponse> {
    const response = await apiClient.post<TestConnectionResponse>(
      `${CONNECTORS_BASE}/powerapps/test`
    );
    return response.data;
  },

  /**
   * Get PowerApps connection status
   */
  async getStatus(): Promise<ConnectionStatusResponse> {
    const response = await apiClient.get<ConnectionStatusResponse>(
      `${CONNECTORS_BASE}/powerapps/status`
    );
    return response.data;
  },

  /**
   * List PowerApps environments
   */
  async listEnvironments(): Promise<PowerAppsEnvironment[]> {
    const response = await apiClient.get<PowerAppsEnvironment[]>(
      `${CONNECTORS_BASE}/powerapps/environments`
    );
    return response.data;
  },

  /**
   * List PowerApps apps (optionally filtered by environment)
   */
  async listApps(environmentId?: string): Promise<PowerAppsApp[]> {
    const response = await apiClient.get<PowerAppsApp[]>(
      `${CONNECTORS_BASE}/powerapps/apps`,
      { params: environmentId ? { environmentId } : undefined }
    );
    return response.data;
  },

  /**
   * Get PowerApps app details by ID
   */
  async getApp(appId: string): Promise<PowerAppsAppDetail> {
    const response = await apiClient.get<PowerAppsAppDetail>(
      `${CONNECTORS_BASE}/powerapps/apps/${appId}`
    );
    return response.data;
  },

  /**
   * Sync PowerApps app (import to platform)
   */
  async syncApp(appId: string): Promise<SyncAppResponse> {
    const response = await apiClient.post<SyncAppResponse>(
      `${CONNECTORS_BASE}/powerapps/apps/${appId}/sync`
    );
    return response.data;
  },

  /**
   * Export PowerApps app
   */
  async exportApp(appId: string): Promise<ExportAppResponse> {
    const response = await apiClient.get<ExportAppResponse>(
      `${CONNECTORS_BASE}/powerapps/apps/${appId}/export`
    );
    return response.data;
  },
};

// ============================================
// Mendix Connector API
// ============================================

export const mendixApi = {
  /**
   * Get Mendix setup instructions
   * Shows users how to generate a Personal Access Token
   */
  async getSetupInstructions(): Promise<MendixSetupInstructions> {
    const response = await apiClient.get<MendixSetupInstructions>(
      `${CONNECTORS_BASE}/mendix/setup-instructions`
    );
    return response.data;
  },

  /**
   * Connect Mendix account using Personal Access Token
   */
  async connect(credentials: MendixConnectRequest): Promise<MendixConnectResponse> {
    const response = await apiClient.post<MendixConnectResponse>(
      `${CONNECTORS_BASE}/mendix/connect`,
      credentials
    );
    return response.data;
  },

  /**
   * Disconnect Mendix account
   */
  async disconnect(): Promise<DisconnectResponse> {
    const response = await apiClient.post<DisconnectResponse>(
      `${CONNECTORS_BASE}/mendix/disconnect`
    );
    return response.data;
  },

  /**
   * Test Mendix connection
   */
  async test(): Promise<TestConnectionResponse> {
    const response = await apiClient.post<TestConnectionResponse>(
      `${CONNECTORS_BASE}/mendix/test`
    );
    return response.data;
  },

  /**
   * Get Mendix connection status
   */
  async getStatus(): Promise<ConnectionStatusResponse> {
    const response = await apiClient.get<ConnectionStatusResponse>(
      `${CONNECTORS_BASE}/mendix/status`
    );
    return response.data;
  },

  /**
   * List Mendix projects
   */
  async listProjects(): Promise<MendixProject[]> {
    const response = await apiClient.get<MendixProject[]>(
      `${CONNECTORS_BASE}/mendix/projects`
    );
    return response.data;
  },

  /**
   * List Mendix apps (optionally filtered by project)
   */
  async listApps(projectId?: string): Promise<MendixApp[]> {
    const response = await apiClient.get<MendixApp[]>(
      `${CONNECTORS_BASE}/mendix/apps`,
      { params: projectId ? { projectId } : undefined }
    );
    return response.data;
  },

  /**
   * Get Mendix app details by ID
   */
  async getApp(appId: string): Promise<MendixAppDetail> {
    const response = await apiClient.get<MendixAppDetail>(
      `${CONNECTORS_BASE}/mendix/apps/${appId}`
    );
    return response.data;
  },

  /**
   * Sync Mendix app (import to platform)
   */
  async syncApp(appId: string): Promise<SyncAppResponse> {
    const response = await apiClient.post<SyncAppResponse>(
      `${CONNECTORS_BASE}/mendix/apps/${appId}/sync`
    );
    return response.data;
  },

  /**
   * Export Mendix app (Note: May not be implemented in backend yet)
   */
  async exportApp(appId: string): Promise<ExportAppResponse> {
    const response = await apiClient.get<ExportAppResponse>(
      `${CONNECTORS_BASE}/mendix/apps/${appId}/export`
    );
    return response.data;
  },
};

// ============================================
// Generic Connector Status API
// ============================================

/**
 * Get connection status for any platform
 * @param platform - The platform type (POWERAPPS, MENDIX, etc.)
 */
export async function getConnectorStatus(
  platform: PlatformType
): Promise<ConnectionStatusResponse> {
  const platformLower = platform.toLowerCase();
  const response = await apiClient.get<ConnectionStatusResponse>(
    `${CONNECTORS_BASE}/${platformLower}/status`
  );
  return response.data;
}

/**
 * Test connection for any platform
 * @param platform - The platform type (POWERAPPS, MENDIX, etc.)
 */
export async function testConnectorConnection(
  platform: PlatformType
): Promise<TestConnectionResponse> {
  const platformLower = platform.toLowerCase();
  const response = await apiClient.post<TestConnectionResponse>(
    `${CONNECTORS_BASE}/${platformLower}/test`
  );
  return response.data;
}

/**
 * Disconnect from any platform
 * @param platform - The platform type (POWERAPPS, MENDIX, etc.)
 */
export async function disconnectConnector(
  platform: PlatformType
): Promise<DisconnectResponse> {
  const platformLower = platform.toLowerCase();
  const response = await apiClient.post<DisconnectResponse>(
    `${CONNECTORS_BASE}/${platformLower}/disconnect`
  );
  return response.data;
}
