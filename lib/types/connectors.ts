// Platform Connectors Types
// These types define the structure for PowerApps and Mendix connectors

export type PlatformType = "POWERAPPS" | "MENDIX" | "OUTSYSTEMS";

export type ConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR"
  | "EXPIRED";

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
  properties: {
    displayName: string;
    description?: string;
    environmentSku?: string;
    isDefault?: boolean;
  };
}

export interface PowerAppsApp {
  name: string; // Unique identifier
  id: string;
  type: string;
  properties: {
    displayName: string;
    description?: string;
    createdTime: string;
    lastModifiedTime: string;
    owner: {
      id: string;
      displayName?: string;
      email?: string;
    };
    appVersion?: string;
    isFeaturedApp?: boolean;
    bypassConsent?: boolean;
    environment?: {
      id: string;
      name: string;
    };
  };
}

export interface PowerAppsAppDetail extends PowerAppsApp {
  // Inherits all properties from PowerAppsApp
  // Additional detail fields can be added here if backend provides them
}

// Mendix Types
export interface MendixSetupInstructions {
  steps: string[];
  tokenUrl: string;
  scopes: string[];
}

export interface MendixConnectRequest {
  apiKey: string;
  pat: string;
  username: string;
}

export interface MendixConnectResponse {
  success: boolean;
  message: string;
}

export interface MendixProject {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  appId: string;
  url?: string;
}

export interface MendixApp {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  metadata: {
    projectId: string;
    appId: string;
    url?: string;
  };
}

export interface MendixAppDetail extends MendixApp {
  metadata: {
    projectId: string;
    appId: string;
    url?: string;
    environments?: Array<{
      Status: string;
      Url: string;
      Mode?: string;
      ProductionLevel?: string;
    }>;
  };
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
