import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  powerAppsApi,
  mendixApi,
  getConnectorStatus,
  testConnectorConnection,
  disconnectConnector,
} from "../lib/api/connectors-api";
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
} from "../lib/types/connectors";

// Query Keys
export const connectorKeys = {
  all: ["connectors"] as const,
  powerApps: () => [...connectorKeys.all, "powerapps"] as const,
  powerAppsStatus: () => [...connectorKeys.powerApps(), "status"] as const,
  powerAppsEnvironments: () =>
    [...connectorKeys.powerApps(), "environments"] as const,
  powerAppsApps: (environmentId?: string) =>
    [...connectorKeys.powerApps(), "apps", environmentId ?? "all"] as const,
  powerAppsApp: (id: string) =>
    [...connectorKeys.powerApps(), "app", id] as const,

  mendix: () => [...connectorKeys.all, "mendix"] as const,
  mendixStatus: () => [...connectorKeys.mendix(), "status"] as const,
  mendixInstructions: () =>
    [...connectorKeys.mendix(), "instructions"] as const,
  mendixProjects: () => [...connectorKeys.mendix(), "projects"] as const,
  mendixApps: (projectId?: string) =>
    [...connectorKeys.mendix(), "apps", projectId ?? "all"] as const,
  mendixApp: (id: string) => [...connectorKeys.mendix(), "app", id] as const,
};

// ============================================
// PowerApps Hooks
// ============================================

/**
 * Get PowerApps connection status
 */
export function usePowerAppsStatus(): UseQueryResult<
  ConnectionStatusResponse,
  Error
> {
  return useQuery({
    queryKey: connectorKeys.powerAppsStatus(),
    queryFn: () => powerAppsApi.getStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Initiate PowerApps OAuth connection
 */
export function useConnectPowerApps(): UseMutationResult<
  PowerAppsConnectResponse,
  Error,
  void,
  unknown
> {
  return useMutation({
    mutationFn: () => powerAppsApi.connect(),
    onSuccess: (data) => {
      // Redirect to OAuth authorization URL
      window.location.href = data.authorizationUrl;
    },
    onError: (error) => {
      toast.error("Failed to connect PowerApps", {
        description: error.message,
      });
    },
  });
}

/**
 * Handle PowerApps OAuth callback
 */
export function usePowerAppsCallback(): UseMutationResult<
  void,
  Error,
  { code: string; state: string },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, state }) => powerAppsApi.handleCallback(code, state),
    onSuccess: () => {
      // Invalidate status to refetch
      queryClient.invalidateQueries({
        queryKey: connectorKeys.powerAppsStatus(),
      });
      toast.success("PowerApps connected successfully");
    },
    onError: (error) => {
      toast.error("Failed to complete PowerApps connection", {
        description: error.message,
      });
    },
  });
}

/**
 * Test PowerApps connection
 */
export function useTestPowerApps(): UseMutationResult<
  TestConnectionResponse,
  Error,
  void,
  unknown
> {
  return useMutation({
    mutationFn: () => powerAppsApi.test(),
    onSuccess: (data) => {
      toast.success("PowerApps connection test successful", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("PowerApps connection test failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Disconnect PowerApps
 */
export function useDisconnectPowerApps(): UseMutationResult<
  DisconnectResponse,
  Error,
  void,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => powerAppsApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.powerApps() });
      toast.success("PowerApps disconnected");
    },
    onError: (error) => {
      toast.error("Failed to disconnect PowerApps", {
        description: error.message,
      });
    },
  });
}

/**
 * List PowerApps environments
 */
export function usePowerAppsEnvironments(): UseQueryResult<
  PowerAppsEnvironment[],
  Error
> {
  const { data: status } = usePowerAppsStatus();

  console.log("[usePowerAppsEnvironments] Status:", status);
  console.log(
    "[usePowerAppsEnvironments] Enabled:",
    status?.isConnected === true
  );

  return useQuery({
    queryKey: connectorKeys.powerAppsEnvironments(),
    queryFn: () => powerAppsApi.listEnvironments(),
    enabled: status?.isConnected === true,
  });
}

/**
 * List PowerApps apps
 */
export function usePowerAppsApps(
  environmentId?: string
): UseQueryResult<PowerAppsApp[], Error> {
  const { data: status } = usePowerAppsStatus();

  return useQuery({
    queryKey: connectorKeys.powerAppsApps(environmentId),
    queryFn: () => powerAppsApi.listApps(environmentId),
    enabled: status?.isConnected === true && !!environmentId,
  });
}

/**
 * Get PowerApps app details
 */
export function usePowerAppsApp(
  appId: string
): UseQueryResult<PowerAppsAppDetail, Error> {
  return useQuery({
    queryKey: connectorKeys.powerAppsApp(appId),
    queryFn: () => powerAppsApi.getApp(appId),
    enabled: !!appId,
  });
}

/**
 * Sync PowerApps app
 */
export function useSyncPowerAppsApp(): UseMutationResult<
  SyncAppResponse,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => powerAppsApi.syncApp(appId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: connectorKeys.powerAppsApps(),
      });
      toast.success("App synced successfully", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Failed to sync app", {
        description: error.message,
      });
    },
  });
}

/**
 * Create a blank PowerApps Canvas App
 */
export function useCreatePowerAppsApp(): UseMutationResult<
  {
    success: boolean;
    message: string;
    studioUrl: string;
    instructions: string[];
  },
  Error,
  { environmentId: string; appName: string },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, appName }) =>
      powerAppsApi.createBlankApp(environmentId, appName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: connectorKeys.powerAppsApps(),
      });
    },
  });
}

// ============================================
// Mendix Hooks
// ============================================

/**
 * Get Mendix connection status
 */
export function useMendixStatus(): UseQueryResult<
  ConnectionStatusResponse,
  Error
> {
  return useQuery({
    queryKey: connectorKeys.mendixStatus(),
    queryFn: () => mendixApi.getStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get Mendix setup instructions
 */
export function useMendixInstructions(): UseQueryResult<
  MendixSetupInstructions,
  Error
> {
  return useQuery({
    queryKey: connectorKeys.mendixInstructions(),
    queryFn: () => mendixApi.getSetupInstructions(),
  });
}

/**
 * Connect Mendix account
 */
export function useConnectMendix(): UseMutationResult<
  MendixConnectResponse,
  Error,
  MendixConnectRequest,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => mendixApi.connect(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.mendixStatus() });
      toast.success("Mendix connected successfully");
    },
    onError: (error) => {
      toast.error("Failed to connect Mendix", {
        description: error.message,
      });
    },
  });
}

/**
 * Test Mendix connection
 */
export function useTestMendix(): UseMutationResult<
  TestConnectionResponse,
  Error,
  void,
  unknown
> {
  return useMutation({
    mutationFn: () => mendixApi.test(),
    onSuccess: (data) => {
      toast.success("Mendix connection test successful", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Mendix connection test failed", {
        description: error.message,
      });
    },
  });
}

/**
 * Disconnect Mendix
 */
export function useDisconnectMendix(): UseMutationResult<
  DisconnectResponse,
  Error,
  void,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mendixApi.disconnect(),
    onSuccess: () => {
      // Invalidate all Mendix-related queries
      queryClient.invalidateQueries({ queryKey: connectorKeys.mendix() });
      queryClient.invalidateQueries({ queryKey: connectorKeys.mendixStatus() });
      queryClient.invalidateQueries({
        queryKey: connectorKeys.mendixProjects(),
      });
      toast.success("Mendix disconnected");
    },
    onError: (error) => {
      toast.error("Failed to disconnect Mendix", {
        description: error.message,
      });
    },
  });
}

/**
 * List Mendix projects
 */
export function useMendixProjects(): UseQueryResult<MendixProject[], Error> {
  const { data: status } = useMendixStatus();

  return useQuery({
    queryKey: connectorKeys.mendixProjects(),
    queryFn: () => mendixApi.listProjects(),
    enabled: status?.isConnected === true,
  });
}

/**
 * List Mendix apps
 */
export function useMendixApps(
  projectId?: string
): UseQueryResult<MendixApp[], Error> {
  const { data: status } = useMendixStatus();

  return useQuery({
    queryKey: connectorKeys.mendixApps(projectId),
    queryFn: () => mendixApi.listApps(projectId),
    enabled: status?.isConnected === true,
  });
}

/**
 * Get Mendix app details
 */
export function useMendixApp(
  appId: string
): UseQueryResult<MendixAppDetail, Error> {
  return useQuery({
    queryKey: connectorKeys.mendixApp(appId),
    queryFn: () => mendixApi.getApp(appId),
    enabled: !!appId,
  });
}

/**
 * Sync Mendix app
 */
export function useSyncMendixApp(): UseMutationResult<
  SyncAppResponse,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => mendixApi.syncApp(appId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.mendixApps() });
      toast.success("App synced successfully", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Failed to sync app", {
        description: error.message,
      });
    },
  });
}

// ============================================
// Generic Connector Hooks
// ============================================

/**
 * Get connection status for any platform
 */
export function useConnectorStatus(
  platform: PlatformType
): UseQueryResult<ConnectionStatusResponse, Error> {
  return useQuery({
    queryKey: [...connectorKeys.all, platform.toLowerCase(), "status"],
    queryFn: () => getConnectorStatus(platform),
    refetchInterval: 30000,
  });
}

/**
 * Test connection for any platform
 */
export function useTestConnector(
  platform: PlatformType
): UseMutationResult<TestConnectionResponse, Error, void, unknown> {
  return useMutation({
    mutationFn: () => testConnectorConnection(platform),
    onSuccess: (data) => {
      toast.success(`${platform} connection test successful`, {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error(`${platform} connection test failed`, {
        description: error.message,
      });
    },
  });
}

/**
 * Disconnect from any platform
 */
export function useDisconnectConnector(
  platform: PlatformType
): UseMutationResult<DisconnectResponse, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => disconnectConnector(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...connectorKeys.all, platform.toLowerCase()],
      });
      toast.success(`${platform} disconnected`);
    },
    onError: (error) => {
      toast.error(`Failed to disconnect ${platform}`, {
        description: error.message,
      });
    },
  });
}
