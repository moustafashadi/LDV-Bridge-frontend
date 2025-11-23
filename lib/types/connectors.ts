// Platform Connectors Types
// These types define the structure for PowerApps and Mendix connectors

export type PlatformType = 'POWERAPPS' | 'MENDIX' | 'OUTSYSTEMS';

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'EXPIRED';

export interface ConnectionStatusResponse {
  isConnected: boolean;
  status: ConnectionStatus;
  lastConnected?: string;
  error?: string;
}

// PowerApps Types
export interface PowerAppsConnectResponse {
  authorizationUrl: string;
}

export interface PowerAppsCallbackParams {
  code: string;
  state: string;
}

export interface PowerAppsEnvironment {
  id: string;
  name: string;
  location: string;
  type: string;
}

export interface PowerAppsApp {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  createdTime: string;
  lastModifiedTime: string;
  environment: string;
  owner?: string;
}

export interface PowerAppsAppDetail extends PowerAppsApp {
  version?: string;
  appOpenUri?: string;
  appPlayUri?: string;
}

// Mendix Types
export interface MendixSetupInstructions {
  steps: string[];
  tokenUrl: string;
  scopes: string[];
}

export interface MendixConnectRequest {
  apiKey: string;
  username: string;
}

export interface MendixConnectResponse {
  success: boolean;
  message: string;
}

export interface MendixProject {
  projectId: string;
  name: string;
  description?: string;
}

export interface MendixApp {
  appId: string;
  name: string;
  projectId: string;
  repositoryUrl?: string;
  description?: string;
}

export interface MendixAppDetail extends MendixApp {
  teamServerUrl?: string;
  revision?: string;
}

// Common Types
export interface TestConnectionResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface DisconnectResponse {
  success: boolean;
  message: string;
}

export interface SyncAppRequest {
  appId: string;
}

export interface SyncAppResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ExportAppResponse {
  exportUrl: string;
  format: string;
}

// Error Response
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
