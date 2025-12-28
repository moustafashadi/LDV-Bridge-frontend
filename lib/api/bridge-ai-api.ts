// ============================================
// BRIDGE AI API CLIENT
// Multi-provider AI security analysis (Anthropic, OpenAI, Gemini)
// ============================================

import { apiClient } from "./client";

// ============================================
// Types
// ============================================

export type AIProviderName = "anthropic" | "openai" | "gemini";

export interface AIProviderInfo {
  name: AIProviderName;
  available: boolean;
  model: string;
}

export interface BridgeAIStatus {
  enabled: boolean;
  providers: AIProviderInfo[];
  activeProvider: {
    name: AIProviderName;
    model: string;
  } | null;
  features: string[];
  fallbackEnabled: boolean;
  message?: string;
}

export interface SecurityConcern {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  location?: string;
  recommendation: string;
  affectedFiles?: string[];
  remediation?: string;
}

export interface AIAnalysisResult {
  id: string;
  changeId: string;
  analyzedAt: string;
  provider?: string;
  model?: string;
  securityConcerns: SecurityConcern[];
  overallAssessment: "safe" | "warning" | "critical";
  summary: string;
  recommendations: string[];
  tokensUsed?: number;
  analysisTimeMs?: number;
}

export interface AnalyzeChangeResponse {
  success: boolean;
  analysis: AIAnalysisResult;
}

export interface GetAnalysisResponse {
  success: boolean;
  analysis: AIAnalysisResult | null;
  cached: boolean;
}

const BASE_PATH = "/ai";

// ============================================
// BridgeAI API Functions
// ============================================

/**
 * Check BridgeAI status and availability
 */
export async function getBridgeAIStatus(): Promise<BridgeAIStatus> {
  const response = await apiClient.get<BridgeAIStatus>(`${BASE_PATH}/status`);
  return response.data;
}

/**
 * Trigger AI analysis for a specific change
 * Supports multiple providers with automatic fallback
 */
export async function analyzeChange(
  changeId: string,
  preferredProvider?: AIProviderName
): Promise<AIAnalysisResult> {
  const params = preferredProvider ? `?provider=${preferredProvider}` : "";
  const response = await apiClient.post<AIAnalysisResult>(
    `${BASE_PATH}/analyze/${changeId}${params}`
  );
  return response.data;
}

/**
 * Get existing AI analysis for a change (if available)
 */
export async function getChangeAnalysis(
  changeId: string
): Promise<GetAnalysisResponse> {
  const response = await apiClient.get<GetAnalysisResponse>(
    `${BASE_PATH}/analysis/${changeId}`
  );
  return response.data;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get severity color for UI display
 */
export function getSeverityColor(
  severity: SecurityConcern["severity"]
): string {
  switch (severity) {
    case "critical":
      return "text-red-500 bg-red-500/10 border-red-500/50";
    case "high":
      return "text-orange-500 bg-orange-500/10 border-orange-500/50";
    case "medium":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/50";
    case "low":
      return "text-blue-500 bg-blue-500/10 border-blue-500/50";
    case "info":
      return "text-slate-400 bg-slate-500/10 border-slate-500/50";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/50";
  }
}

/**
 * Get severity badge label
 */
export function getSeverityLabel(
  severity: SecurityConcern["severity"]
): string {
  return severity.toUpperCase();
}

/**
 * Get risk level color for overall assessment
 */
export function getRiskLevelColor(
  level: AIAnalysisResult["overallAssessment"]
): string {
  switch (level) {
    case "critical":
      return "text-red-400 bg-red-900/20 border-red-700/50";
    case "warning":
      return "text-yellow-400 bg-yellow-900/20 border-yellow-700/50";
    case "safe":
      return "text-green-400 bg-green-900/20 border-green-700/50";
    default:
      return "text-slate-400 bg-slate-900/20 border-slate-700/50";
  }
}
