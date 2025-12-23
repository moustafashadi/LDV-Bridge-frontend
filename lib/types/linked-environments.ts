// ============================================
// LINKED ENVIRONMENTS TYPES
// ============================================

export type LinkedEnvironmentPlatform = "POWERAPPS" | "MENDIX";

export interface LinkedEnvironment {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  platform: LinkedEnvironmentPlatform;
  environmentId: string;
  environmentUrl?: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface LinkedEnvironmentWithApps extends LinkedEnvironment {
  apps: any[]; // PowerApps app objects from the platform
}

export interface CreateLinkedEnvironmentDto {
  name: string;
  description?: string;
  platform: LinkedEnvironmentPlatform;
  environmentId: string;
  environmentUrl?: string;
  region?: string;
}
