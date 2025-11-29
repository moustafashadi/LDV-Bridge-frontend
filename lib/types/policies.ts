// ============================================
// POLICY ENGINE TYPES (Task 13)
// ============================================
// These types match the backend DTOs exactly

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export enum PolicyAction {
  BLOCK = 'BLOCK',
  WARN = 'WARN',
  LOG = 'LOG',
}

export interface PolicyRuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'exists' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

export interface PolicyRule {
  name: string;
  description?: string;
  conditions: PolicyRuleCondition[];
  action: PolicyAction;
  severity?: number; // 1-10 scale
  message?: string;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  targetPlatform: 'PowerApps' | 'Mendix' | 'ALL';
  rules: PolicyRule[];
  status: PolicyStatus;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyDto {
  name: string;
  description?: string;
  targetPlatform: 'PowerApps' | 'Mendix' | 'ALL';
  rules: PolicyRule[];
  status?: PolicyStatus;
}

export interface UpdatePolicyDto {
  name?: string;
  description?: string;
  targetPlatform?: 'PowerApps' | 'Mendix' | 'ALL';
  rules?: PolicyRule[];
  status?: PolicyStatus;
}

export interface EvaluatePolicyDto {
  changeId: string;
}

export interface PolicyViolation {
  policyId: string;
  policyName: string;
  ruleName: string;
  severity: number;
  message: string;
  action: PolicyAction;
  evidence?: any;
}

export interface PolicyEvaluationResult {
  changeId: string;
  violations: PolicyViolation[];
  passed: boolean;
  blockers: PolicyViolation[]; // Critical violations that block deployment
  warnings: PolicyViolation[]; // Non-blocking warnings
  evaluatedAt: string;
}

export interface PaginatedPoliciesResponse {
  data: Policy[];
  total: number;
  page: number;
  limit: number;
}
