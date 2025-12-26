/**
 * Sandbox Management Types
 * Mirrors backend DTOs for type safety
 */

export enum SandboxPlatform {
  POWERAPPS = "POWERAPPS",
  MENDIX = "MENDIX",
}

export enum SandboxStatus {
  // Provisioning states
  PROVISIONING = "PROVISIONING",
  ACTIVE = "ACTIVE",
  STOPPED = "STOPPED",
  EXPIRED = "EXPIRED",
  ERROR = "ERROR",
  // Workflow states (new)
  PENDING_REVIEW = "PENDING_REVIEW",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  MERGED = "MERGED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
  ABANDONED = "ABANDONED",
}

export enum SandboxType {
  PERSONAL = "PERSONAL",
  TEAM = "TEAM",
  TRIAL = "TRIAL",
}

export enum ProvisioningStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ConflictStatus {
  NONE = "NONE",
  POTENTIAL = "POTENTIAL",
  NEEDS_RESOLUTION = "NEEDS_RESOLUTION",
  RESOLVED = "RESOLVED",
}

export enum PipelineStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  PASSED = "PASSED",
  FAILED = "FAILED",
}

/**
 * Sandbox response from API
 */
export interface Sandbox {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  description?: string;
  status: SandboxStatus;
  platform: SandboxPlatform;
  type: SandboxType;
  provisioningStatus: ProvisioningStatus;
  environmentId?: string;
  environmentUrl?: string;
  region?: string;
  appId?: string;
  // Branch info (new)
  mendixBranch?: string;
  baseMendixRevision?: string;
  latestMendixRevision?: string;
  githubBranch?: string;
  baseGithubSha?: string;
  latestGithubSha?: string;
  // Conflict info (new)
  conflictStatus?: ConflictStatus;
  conflictingFiles?: string[];
  // Submission info (new)
  submittedAt?: string;
  reviewedAt?: string;
  mergedAt?: string;
  metadata?: {
    linkedExisting?: boolean;
    originalEnvironmentName?: string;
    lastSubmission?: {
      commitSha?: string;
      commitUrl?: string;
      changesDetected?: number;
      submittedAt?: string;
    };
    studioUrl?: string; // Mendix Portal URL to open branch in Studio Pro
    [key: string]: any;
  };
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  createdBy?: {
    id: string;
    email: string;
    name?: string;
  };
}

/**
 * Create sandbox request
 */
export interface CreateSandboxRequest {
  name: string;
  description?: string;
  platform: SandboxPlatform;
  type: SandboxType;
  expiresAt?: string;
  region?: string;
  sourceAppId?: string;
}

/**
 * Create feature sandbox request (new workflow)
 */
export interface CreateFeatureSandboxRequest {
  appId: string;
  featureName: string;
  description?: string;
}

/**
 * Link existing environment request
 */
export interface LinkExistingEnvironmentRequest {
  name: string;
  description?: string;
  platform: SandboxPlatform;
  environmentId: string;
  type: SandboxType;
  expiresAt?: string;
}

/**
 * Update sandbox request
 */
export interface UpdateSandboxRequest {
  name?: string;
  description?: string;
  expiresAt?: string;
}

/**
 * Sandbox sync result
 */
export interface SandboxSyncResult {
  success: boolean;
  message: string;
  commitSha?: string;
  commitUrl?: string;
  changesDetected: number;
  pipelineTriggered: boolean;
}

/**
 * Conflict check result
 */
export interface SandboxConflictCheck {
  hasConflicts: boolean;
  conflictStatus: ConflictStatus;
  conflictingFiles: string[];
  message: string;
}

/**
 * Sandbox resource usage statistics
 */
export interface SandboxStats {
  sandboxId: string;
  appsCount: number;
  apiCallsUsed: number;
  storageUsed: number;
  quotas: {
    maxApps: number;
    maxApiCalls: number;
    maxStorage: number;
  };
  lastUpdated: string;
}

/**
 * Extend expiration request
 */
export interface ExtendExpirationRequest {
  days: number;
}

/**
 * List sandboxes response
 */
export interface ListSandboxesResponse {
  data: Sandbox[];
  total: number;
}

/**
 * Query filters for listing sandboxes
 */
export interface SandboxFilters {
  platform?: SandboxPlatform;
  status?: SandboxStatus;
  type?: SandboxType;
  page?: number;
  limit?: number;
}

/**
 * Sandbox quota check response
 */
export interface QuotaCheckResponse {
  canCreate: boolean;
  currentCount: number;
  maxAllowed: number;
  reason?: string;
}

/**
 * Submitter statistics for review sidebar
 */
export interface SubmitterStats {
  totalSubmissions: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
}

/**
 * Review details for Pro Developer review page
 * Returned by GET /sandboxes/:id/review-details
 */
export interface SandboxReviewDetails {
  sandbox: {
    id: string;
    name: string;
    description: string | null;
    status: SandboxStatus;
    conflictStatus: ConflictStatus | null;
    mendixBranch: string | null;
    githubBranch: string | null;
    submittedAt: string | null;
    createdAt: string;
    createdBy: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  };
  app: {
    id: string;
    name: string;
    platform: string;
    externalId: string;
    githubRepoUrl: string | null;
  } | null;
  change: {
    id: string;
    title: string;
    description: string | null;
    changeType: string;
    status: string;
    riskScore: number | null;
    riskAssessment: any;
    diffSummary: {
      totalChanges?: number;
      additions?: number;
      deletions?: number;
      modifications?: number;
    } | null;
    beforeMetadata: any;
    afterMetadata: any;
    pipelineStatus: string | null;
    pipelineUrl: string | null;
    pipelineResults: any;
    createdAt: string;
  } | null;
  review: {
    id: string;
    status: string;
    decision: string | null;
    feedback: string | null;
    reviewerId: string;
    reviewer: {
      id: string;
      name: string | null;
      email: string;
    };
    isAssignedToMe: boolean;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
  } | null;
  comments: Array<{
    id: string;
    content: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
    parentId: string | null;
    isResolved: boolean;
    mentions: string[];
    createdAt: string;
    updatedAt: string;
    replies?: Array<{
      id: string;
      content: string;
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
      createdAt: string;
    }>;
  }>;
  submitterStats: SubmitterStats;
}
