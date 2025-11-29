// ============================================
// CHANGE DETECTION ENGINE TYPES (Task 11)
// ============================================
// These types match the backend DTOs exactly

export enum ChangeStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPLOYED = 'DEPLOYED',
}

export enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CONFIGURATION = 'CONFIGURATION',
}

export enum DiffOperationType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  REPLACE = 'REPLACE',
  MOVE = 'MOVE',
  COPY = 'COPY',
  TEST = 'TEST',
}

export interface DiffOperation {
  op: DiffOperationType;
  path: string;
  value?: any;
  oldValue?: any;
  from?: string; // For MOVE operations
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  total: number;
}

export interface ComponentDependency {
  componentId: string;
  componentName: string;
  componentType: string;
  dependencyType: 'USES' | 'USED_BY' | 'REFERENCES' | 'REFERENCED_BY';
}

export interface ImpactAnalysis {
  affectedComponents: string[];
  affectedScreens: string[];
  affectedDataSources: string[];
  dependencies: ComponentDependency[];
  breakingChanges: string[];
  complexity: number; // 0-100 scale
  estimatedEffort?: string; // e.g., "2 hours", "1 day"
}

export interface Change {
  id: string;
  title: string;
  description?: string;
  appId: string;
  appName?: string;
  organizationId: string;
  authorId: string;
  authorName?: string;
  changeType: ChangeType;
  status: ChangeStatus;
  diff: DiffOperation[];
  diffSummary: DiffSummary;
  impactAnalysis?: ImpactAnalysis;
  riskScore?: number; // 0-100 scale
  riskAssessment?: any; // Full risk assessment from Task 12
  metadata?: Record<string, any>;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetectChangesDto {
  appId: string;
  includeImpactAnalysis?: boolean;
  includeRiskAssessment?: boolean;
}

export interface DetectChangesResponse {
  success: boolean;
  message: string;
  changesDetected: number;
  changes: Change[];
}

export interface UpdateChangeStatusDto {
  status: ChangeStatus;
  notes?: string;
}

export interface PaginatedChangesResponse {
  data: Change[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangeFilters {
  appId?: string;
  status?: ChangeStatus;
  changeType?: ChangeType;
  authorId?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface ChangeWithDetails extends Change {
  app: {
    id: string;
    name: string;
    platform: 'PowerApps' | 'Mendix';
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviews?: any[]; // From Task 14
}
