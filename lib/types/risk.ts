// ============================================
// RISK ASSESSMENT ENGINE TYPES (Task 12)
// ============================================
// These types match the backend DTOs exactly

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PolicyViolationDetail {
  policyId: string;
  policyName: string;
  ruleName: string;
  severity: number; // 1-10
  message: string;
  action: 'BLOCK' | 'WARN' | 'LOG';
  evidence?: any;
  autoBlock: boolean;
}

export interface FormulaComplexityAnalysis {
  platform: 'PowerApps' | 'Mendix';
  complexity: number; // 0-100
  riskLevel: RiskLevel;
  unsafeFunctions: string[];
  externalCalls: number;
  nestingDepth: number;
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  description: string;
}

export interface RiskScoreBreakdown {
  policyScore: number;
  complexityScore: number;
  formulaScore: number;
  breakingChangesScore: number;
  affectedComponentsScore: number;
  autoBlockPenalty: number;
  riskFactorsScore: number;
  totalScore: number; // 0-100
}

export interface EnhancedRiskAssessment {
  changeId: string;
  score: number; // 0-100
  level: RiskLevel;
  requiresApproval: boolean;
  autoBlockRules: PolicyViolationDetail[];
  policyViolations: PolicyViolationDetail[];
  formulaAnalysis?: FormulaComplexityAnalysis;
  impactAnalysis: {
    affectedComponents: number;
    breakingChanges: number;
    complexity: number;
  };
  scoreBreakdown: RiskScoreBreakdown;
  riskFactors: RiskFactor[];
  recommendations: string[];
  reviewers: string[]; // Recommended reviewer IDs
  evaluatedAt: string;
}

export interface RiskThresholds {
  low: { min: number; max: number };
  medium: { min: number; max: number };
  high: { min: number; max: number };
  critical: { min: number; max: number };
}

export const RISK_THRESHOLDS: RiskThresholds = {
  low: { min: 0, max: 29 },
  medium: { min: 30, max: 59 },
  high: { min: 60, max: 79 },
  critical: { min: 80, max: 100 },
};

export function getRiskLevel(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.low.max) return 'low';
  if (score <= RISK_THRESHOLDS.medium.max) return 'medium';
  if (score <= RISK_THRESHOLDS.high.max) return 'high';
  return 'critical';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'orange';
    case 'critical':
      return 'red';
  }
}

export function getRiskBadgeColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
  }
}
