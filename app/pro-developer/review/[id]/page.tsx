"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RoleLayout } from "@/components/layout/role-layout";
import { RiskIndicator } from "@/components/layout/risk-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { sandboxesApi } from "@/lib/api/sandboxes-api";
import {
  approveReview,
  rejectReview,
  requestChanges,
  createComment,
} from "@/lib/api/reviews-api";
import {
  getBridgeAIStatus,
  analyzeChange,
  getChangeAnalysis,
  getSeverityColor,
  getRiskLevelColor,
  type BridgeAIStatus,
  type AIAnalysisResult,
} from "@/lib/api/bridge-ai-api";
import type { SandboxReviewDetails } from "@/lib/types/sandboxes";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Sparkles,
  Bot,
  RefreshCw,
  Clock,
  Zap,
  Code,
  FileJson,
  GitBranch,
  GitCommit,
  ExternalLink,
  SplitSquareHorizontal,
  AlignJustify,
} from "lucide-react";

// Helper to parse unified diff into split view format
interface DiffLine {
  type: "added" | "removed" | "context" | "header";
  content: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

interface SplitDiffLine {
  left: DiffLine | null;
  right: DiffLine | null;
}

function parseUnifiedDiffToSplit(rawDiff: string): SplitDiffLine[] {
  const lines = rawDiff.split("\n");
  const result: SplitDiffLine[] = [];
  let leftLineNum = 0;
  let rightLineNum = 0;

  const pendingRemovals: DiffLine[] = [];
  const pendingAdditions: DiffLine[] = [];

  const flushPending = () => {
    const maxLen = Math.max(pendingRemovals.length, pendingAdditions.length);
    for (let i = 0; i < maxLen; i++) {
      result.push({
        left: pendingRemovals[i] || null,
        right: pendingAdditions[i] || null,
      });
    }
    pendingRemovals.length = 0;
    pendingAdditions.length = 0;
  };

  for (const line of lines) {
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("---") ||
      line.startsWith("+++")
    ) {
      flushPending();
      result.push({
        left: { type: "header", content: line },
        right: { type: "header", content: "" },
      });
    } else if (line.startsWith("@@")) {
      flushPending();
      // Parse line numbers from @@ -a,b +c,d @@
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        leftLineNum = parseInt(match[1], 10) - 1;
        rightLineNum = parseInt(match[2], 10) - 1;
      }
      result.push({
        left: { type: "header", content: line },
        right: { type: "header", content: "" },
      });
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      leftLineNum++;
      pendingRemovals.push({
        type: "removed",
        content: line.substring(1),
        leftLineNum,
      });
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      rightLineNum++;
      pendingAdditions.push({
        type: "added",
        content: line.substring(1),
        rightLineNum,
      });
    } else {
      flushPending();
      leftLineNum++;
      rightLineNum++;
      result.push({
        left: {
          type: "context",
          content: line.startsWith(" ") ? line.substring(1) : line,
          leftLineNum,
        },
        right: {
          type: "context",
          content: line.startsWith(" ") ? line.substring(1) : line,
          rightLineNum,
        },
      });
    }
  }

  flushPending();
  return result;
}

// Helper to get risk level from score
function getRiskLevel(
  riskScore: number | null | undefined
): "low" | "medium" | "high" | "critical" {
  if (!riskScore) return "low";
  if (riskScore >= 80) return "critical";
  if (riskScore >= 60) return "high";
  if (riskScore >= 30) return "medium";
  return "low";
}

// Format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sandboxId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState("code");
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  // Data state
  const [data, setData] = useState<SandboxReviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // BridgeAI state
  const [aiStatus, setAiStatus] = useState<BridgeAIStatus | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Diff view mode: 'json' for model JSON, 'raw' for raw GitHub diff
  const [diffViewMode, setDiffViewMode] = useState<"json" | "raw">("json");

  // Raw diff display mode: 'unified' or 'split' view
  const [rawDiffDisplayMode, setRawDiffDisplayMode] = useState<
    "unified" | "split"
  >("unified");

  // Fetch review details
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await sandboxesApi.getReviewDetails(sandboxId);
      setData(details);
    } catch (err) {
      console.error("Failed to fetch review details:", err);
      setError("Failed to load review details. Please try again.");
      toast.error("Failed to load review details");
    } finally {
      setLoading(false);
    }
  }, [sandboxId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch BridgeAI status and existing analysis
  const fetchAIStatus = useCallback(async () => {
    try {
      const status = await getBridgeAIStatus();
      setAiStatus(status);
    } catch (err) {
      console.error("Failed to fetch AI status:", err);
      // Non-blocking - AI is optional
    }
  }, []);

  const fetchExistingAnalysis = useCallback(async (changeId: string) => {
    try {
      const response = await getChangeAnalysis(changeId);
      if (response.analysis) {
        setAiAnalysis(response.analysis);
      }
    } catch (err) {
      // Non-blocking - no existing analysis is fine
      console.error("Failed to fetch existing AI analysis:", err);
    }
  }, []);

  useEffect(() => {
    fetchAIStatus();
  }, [fetchAIStatus]);

  useEffect(() => {
    if (data?.change?.id) {
      fetchExistingAnalysis(data.change.id);
    }
  }, [data?.change?.id, fetchExistingAnalysis]);

  // Handle BridgeAI analysis trigger
  const handleAnalyzeWithAI = async () => {
    if (!data?.change?.id) {
      toast.error("No change data available for analysis");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await analyzeChange(data.change.id);
      setAiAnalysis(response.analysis);
      toast.success("BridgeAI analysis complete!");
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to analyze with BridgeAI";
      setAiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  // Action handlers
  const handleApprove = async () => {
    if (!data?.review?.id) {
      toast.error("No review found to approve");
      return;
    }

    setActionLoading("approve");
    try {
      await approveReview(data.review.id, {
        feedback: feedbackText || "Approved",
      });
      toast.success("Changes approved successfully!");
      router.push("/pro-developer");
    } catch (err) {
      console.error("Failed to approve:", err);
      toast.error("Failed to approve changes");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!data?.review?.id) {
      toast.error("No review found to reject");
      return;
    }

    if (!feedbackText.trim()) {
      toast.error("Please provide feedback for rejection");
      return;
    }

    setActionLoading("reject");
    try {
      await rejectReview(data.review.id, { feedback: feedbackText });
      toast.success("Changes rejected");
      router.push("/pro-developer");
    } catch (err) {
      console.error("Failed to reject:", err);
      toast.error("Failed to reject changes");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!data?.review?.id) {
      toast.error("No review found");
      return;
    }

    if (!feedbackText.trim()) {
      toast.error("Please provide feedback for the requested changes");
      return;
    }

    setActionLoading("request-changes");
    try {
      await requestChanges(data.review.id, { feedback: feedbackText });
      toast.success("Changes requested");
      router.push("/pro-developer");
    } catch (err) {
      console.error("Failed to request changes:", err);
      toast.error("Failed to request changes");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddComment = async () => {
    if (!data?.change?.id || !newComment.trim()) {
      return;
    }

    try {
      await createComment(data.change.id, { content: newComment });
      toast.success("Comment added");
      setNewComment("");
      setShowAnnotation(false);
      fetchData(); // Refresh to show new comment
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment");
    }
  };

  // Loading state
  if (loading) {
    return (
      <RoleLayout>
        <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32" />
            <div>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <main className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Skeleton className="h-12 w-full mb-6" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </RoleLayout>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <RoleLayout>
        <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
          <Link href="/pro-developer">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Queue
            </Button>
          </Link>
        </div>
        <main className="container mx-auto px-6 py-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Failed to Load Review
              </h2>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button onClick={fetchData}>Try Again</Button>
            </CardContent>
          </Card>
        </main>
      </RoleLayout>
    );
  }

  const { sandbox, app, change, review, comments, submitterStats } = data;
  const riskLevel = getRiskLevel(change?.riskScore);
  const diffSummary = change?.diffSummary;
  const riskAssessment = change?.riskAssessment;

  return (
    <RoleLayout>
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pro-developer">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Queue
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                Review: {sandbox.name}
              </h1>
              <p className="text-sm text-slate-400">
                Submitted by{" "}
                {sandbox.createdBy?.name || sandbox.createdBy?.email}{" "}
                {sandbox.submittedAt &&
                  `• ${formatRelativeTime(sandbox.submittedAt)}`}{" "}
                • Risk: <RiskIndicator level={riskLevel} inline />
              </p>
            </div>
          </div>
          {app?.githubRepoUrl && (
            <a
              href={app.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-slate-600">
                View on GitHub
              </Button>
            </a>
          )}
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
                <TabsTrigger
                  value="code"
                  className="text-slate-300 data-[state=active]:text-white"
                >
                  Code Diff
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="text-slate-300 data-[state=active]:text-white"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="text-slate-300 data-[state=active]:text-white"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="text-slate-300 data-[state=active]:text-white"
                >
                  Comments ({comments.length})
                </TabsTrigger>
              </TabsList>

              {/* Code Diff Tab */}
              <TabsContent value="code" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    {change ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            {change.title}
                          </h3>
                          {/* View Mode Toggle */}
                          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1">
                            <button
                              onClick={() => setDiffViewMode("json")}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                                diffViewMode === "json"
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <FileJson className="w-4 h-4" />
                              Model JSON
                            </button>
                            <button
                              onClick={() => setDiffViewMode("raw")}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                                diffViewMode === "raw"
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <Code className="w-4 h-4" />
                              Raw Diff
                            </button>
                          </div>
                        </div>

                        {change.description && (
                          <p className="text-slate-400 mb-4">
                            {change.description}
                          </p>
                        )}

                        {/* Diff Summary Stats */}
                        {diffSummary && (
                          <div className="flex gap-4 mb-6 text-sm">
                            <span className="text-green-400">
                              +{diffSummary.additions || 0} additions
                            </span>
                            <span className="text-red-400">
                              -{diffSummary.deletions || 0} deletions
                            </span>
                            <span className="text-yellow-400">
                              ~{diffSummary.modifications || 0} modifications
                            </span>
                            <span className="text-slate-400">
                              {diffSummary.totalChanges || 0} total changes
                            </span>
                          </div>
                        )}

                        {/* GitHub Link */}
                        {app?.githubRepoUrl && sandbox?.githubBranch && (
                          <div className="flex items-center gap-2 mb-4">
                            <a
                              href={`${app.githubRepoUrl}/tree/${sandbox.githubBranch}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                              <GitBranch className="w-4 h-4" />
                              View Branch on GitHub
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {change.gitCommit?.commitSha && (
                              <a
                                href={
                                  change.gitCommit.commitUrl ||
                                  `${app.githubRepoUrl}/commit/${change.gitCommit.commitSha}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 ml-4"
                              >
                                <GitCommit className="w-4 h-4" />
                                {change.gitCommit.commitSha.substring(0, 7)}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Diff Content based on view mode */}
                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                          {diffViewMode === "json" ? (
                            // Model JSON View
                            change.beforeMetadata || change.afterMetadata ? (
                              <div className="text-slate-400">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(
                                    {
                                      before: change.beforeMetadata,
                                      after: change.afterMetadata,
                                    },
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            ) : (
                              <p className="text-slate-500 text-center py-8">
                                No model metadata available
                              </p>
                            )
                          ) : // Raw Code Diff View (beforeCode vs afterCode)
                          change.beforeCode || change.afterCode ? (
                            <div className="text-slate-300">
                              {/* Show unified diff-style view */}
                              {change.beforeCode && (
                                <div className="mb-4">
                                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                                    <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                                      Before
                                    </span>
                                  </div>
                                  <div className="bg-red-900/10 rounded p-2 border border-red-900/30">
                                    {change.beforeCode
                                      .split("\n")
                                      .map((line: string, idx: number) => (
                                        <div
                                          key={`before-${idx}`}
                                          className="text-red-300/80 text-xs leading-relaxed"
                                        >
                                          <span className="text-red-500/50 select-none mr-2">
                                            {String(idx + 1).padStart(3, " ")}
                                          </span>
                                          {line || " "}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                              {change.afterCode && (
                                <div>
                                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                      After
                                    </span>
                                  </div>
                                  <div className="bg-green-900/10 rounded p-2 border border-green-900/30">
                                    {change.afterCode
                                      .split("\n")
                                      .map((line: string, idx: number) => (
                                        <div
                                          key={`after-${idx}`}
                                          className="text-green-300/80 text-xs leading-relaxed"
                                        >
                                          <span className="text-green-500/50 select-none mr-2">
                                            {String(idx + 1).padStart(3, " ")}
                                          </span>
                                          {line || " "}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : diffSummary?.rawDiff ? (
                            // Fallback to rawDiff from diffSummary if beforeCode/afterCode not available
                            <div className="text-slate-300">
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                  {rawDiffDisplayMode === "unified"
                                    ? "Unified Diff"
                                    : "Split Diff"}
                                </span>
                                {/* Unified/Split Toggle */}
                                <div className="flex items-center gap-1 bg-slate-900 rounded p-0.5">
                                  <button
                                    onClick={() =>
                                      setRawDiffDisplayMode("unified")
                                    }
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                      rawDiffDisplayMode === "unified"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-400 hover:text-white"
                                    }`}
                                    title="Unified view"
                                  >
                                    <AlignJustify className="w-3 h-3" />
                                    Unified
                                  </button>
                                  <button
                                    onClick={() =>
                                      setRawDiffDisplayMode("split")
                                    }
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                      rawDiffDisplayMode === "split"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-400 hover:text-white"
                                    }`}
                                    title="Split view"
                                  >
                                    <SplitSquareHorizontal className="w-3 h-3" />
                                    Split
                                  </button>
                                </div>
                              </div>

                              {rawDiffDisplayMode === "unified" ? (
                                // Unified diff view
                                <div className="bg-slate-800 rounded p-2 border border-slate-700">
                                  {diffSummary.rawDiff
                                    .split("\n")
                                    .map((line: string, idx: number) => {
                                      let lineClass = "text-slate-400";
                                      if (
                                        line.startsWith("+") &&
                                        !line.startsWith("+++")
                                      ) {
                                        lineClass =
                                          "text-green-400 bg-green-900/20";
                                      } else if (
                                        line.startsWith("-") &&
                                        !line.startsWith("---")
                                      ) {
                                        lineClass =
                                          "text-red-400 bg-red-900/20";
                                      } else if (line.startsWith("@@")) {
                                        lineClass =
                                          "text-blue-400 bg-blue-900/20";
                                      } else if (
                                        line.startsWith("diff --git")
                                      ) {
                                        lineClass =
                                          "text-yellow-400 font-bold mt-4";
                                      }
                                      return (
                                        <div
                                          key={idx}
                                          className={`${lineClass} text-xs leading-relaxed font-mono`}
                                        >
                                          {line || " "}
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                // Split diff view
                                <div className="bg-slate-800 rounded border border-slate-700 overflow-x-auto">
                                  <div className="grid grid-cols-2 divide-x divide-slate-700">
                                    {/* Left header */}
                                    <div className="px-2 py-1 bg-red-900/20 text-red-400 text-xs font-semibold border-b border-slate-700">
                                      Before (Removed)
                                    </div>
                                    {/* Right header */}
                                    <div className="px-2 py-1 bg-green-900/20 text-green-400 text-xs font-semibold border-b border-slate-700">
                                      After (Added)
                                    </div>
                                  </div>
                                  {parseUnifiedDiffToSplit(
                                    diffSummary.rawDiff
                                  ).map((row, idx) => (
                                    <div
                                      key={idx}
                                      className="grid grid-cols-2 divide-x divide-slate-700"
                                    >
                                      {/* Left side */}
                                      <div
                                        className={`px-2 py-0.5 text-xs font-mono min-h-[1.5rem] ${
                                          row.left?.type === "removed"
                                            ? "bg-red-900/20 text-red-400"
                                            : row.left?.type === "header"
                                            ? "bg-slate-900 text-yellow-400"
                                            : row.left?.type === "context"
                                            ? "text-slate-400"
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {row.left && (
                                          <span className="flex">
                                            {row.left.leftLineNum && (
                                              <span className="text-slate-600 select-none w-8 shrink-0">
                                                {row.left.leftLineNum}
                                              </span>
                                            )}
                                            <span className="whitespace-pre">
                                              {row.left.content || " "}
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                      {/* Right side */}
                                      <div
                                        className={`px-2 py-0.5 text-xs font-mono min-h-[1.5rem] ${
                                          row.right?.type === "added"
                                            ? "bg-green-900/20 text-green-400"
                                            : row.right?.type === "header"
                                            ? "bg-slate-900 text-yellow-400"
                                            : row.right?.type === "context"
                                            ? "text-slate-400"
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {row.right &&
                                          row.right.type !== "header" && (
                                            <span className="flex">
                                              {row.right.rightLineNum && (
                                                <span className="text-slate-600 select-none w-8 shrink-0">
                                                  {row.right.rightLineNum}
                                                </span>
                                              )}
                                              <span className="whitespace-pre">
                                                {row.right.content || " "}
                                              </span>
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Code className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                              <p className="text-slate-500">
                                No raw code diff available
                              </p>
                              <p className="text-slate-600 text-xs mt-2">
                                Raw code is captured during sync from GitHub
                              </p>
                            </div>
                          )}
                        </div>

                        {/* CI/CD Pipeline Status */}
                        {change.pipelineStatus && (
                          <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700">
                            <p className="text-sm text-slate-300">
                              <span className="font-semibold">
                                Pipeline Status:
                              </span>{" "}
                              <span
                                className={
                                  change.pipelineStatus === "PASSED"
                                    ? "text-green-400"
                                    : change.pipelineStatus === "FAILED"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }
                              >
                                {change.pipelineStatus}
                              </span>
                            </p>
                            {change.pipelineUrl && (
                              <a
                                href={change.pipelineUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 text-sm hover:underline"
                              >
                                View Pipeline Details →
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        No change data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 space-y-4">
                    {/* Risk Score Header */}
                    <div
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        riskLevel === "low"
                          ? "bg-green-900/20 border-green-700/50"
                          : riskLevel === "medium"
                          ? "bg-yellow-900/20 border-yellow-700/50"
                          : "bg-red-900/20 border-red-700/50"
                      }`}
                    >
                      {riskLevel === "low" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      ) : riskLevel === "medium" ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`font-semibold ${
                            riskLevel === "low"
                              ? "text-green-400"
                              : riskLevel === "medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          Risk Score: {change?.riskScore ?? "N/A"}/100 (
                          {riskLevel.toUpperCase()})
                        </p>
                      </div>
                    </div>

                    {/* Risk Assessment Details */}
                    {riskAssessment ? (
                      <div className="space-y-3">
                        {riskAssessment.factors &&
                          Array.isArray(riskAssessment.factors) && (
                            <div>
                              <p className="font-semibold text-slate-300 mb-2">
                                Risk Factors:
                              </p>
                              <div className="space-y-2">
                                {riskAssessment.factors.map(
                                  (factor: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="p-3 bg-slate-900 rounded border border-slate-700"
                                    >
                                      <p className="text-sm text-slate-300">
                                        {factor.name ||
                                          factor.description ||
                                          JSON.stringify(factor)}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {riskAssessment.summary && (
                          <div className="pt-4 border-t border-slate-700">
                            <p className="font-semibold text-slate-300 mb-2">
                              Summary:
                            </p>
                            <p className="text-sm text-slate-400">
                              {riskAssessment.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-4 bg-slate-900 rounded border border-slate-700">
                        <Info className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-400">
                          No detailed risk assessment available
                        </p>
                      </div>
                    )}

                    {/* BridgeAI Security Analysis Section */}
                    <div className="pt-6 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-purple-400" />
                          <h3 className="font-semibold text-white">
                            BridgeAI Security Analysis
                          </h3>
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                            AI-Powered
                          </span>
                        </div>
                        {aiStatus?.enabled && data?.change?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                            onClick={handleAnalyzeWithAI}
                            disabled={aiLoading}
                          >
                            {aiLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : aiAnalysis ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Re-analyze
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze with BridgeAI
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* AI Status Check */}
                      {!aiStatus?.enabled && (
                        <div className="p-4 bg-slate-900 rounded border border-slate-700">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Info className="w-4 h-4" />
                            <p className="text-sm">
                              BridgeAI is not configured. Contact your
                              administrator to enable AI-powered security
                              analysis.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* AI Error */}
                      {aiError && (
                        <div className="p-4 bg-red-900/20 rounded border border-red-700/50 mb-4">
                          <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">{aiError}</p>
                          </div>
                        </div>
                      )}

                      {/* AI Analysis Results */}
                      {aiAnalysis && (
                        <div className="space-y-4">
                          {/* Overall AI Risk Assessment */}
                          <div
                            className={`p-4 rounded-lg border ${getRiskLevelColor(
                              aiAnalysis.overallRiskLevel
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="font-semibold">
                                  AI Risk Level:{" "}
                                  {aiAnalysis.overallRiskLevel.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="w-3 h-3" />
                                {new Date(
                                  aiAnalysis.analyzedAt
                                ).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-sm text-slate-300">
                              {aiAnalysis.summary}
                            </p>
                          </div>

                          {/* Security Concerns */}
                          {aiAnalysis.securityConcerns.length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-300 mb-3">
                                Security Concerns (
                                {aiAnalysis.securityConcerns.length})
                              </p>
                              <div className="space-y-3">
                                {aiAnalysis.securityConcerns.map(
                                  (concern, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-4 rounded border ${getSeverityColor(
                                        concern.severity
                                      )}`}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded">
                                            {concern.severity}
                                          </span>
                                          <span className="text-sm font-medium text-white">
                                            {concern.category}
                                          </span>
                                        </div>
                                        {concern.location && (
                                          <span className="text-xs text-slate-400 font-mono">
                                            {concern.location}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-300 mb-2">
                                        {concern.description}
                                      </p>
                                      <div className="flex items-start gap-2 p-2 bg-slate-800/50 rounded">
                                        <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-400">
                                          <span className="font-semibold text-slate-300">
                                            Recommendation:{" "}
                                          </span>
                                          {concern.recommendation}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* AI Recommendations */}
                          {aiAnalysis.recommendations.length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-300 mb-3">
                                Overall Recommendations
                              </p>
                              <ul className="space-y-2">
                                {aiAnalysis.recommendations.map((rec, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 p-3 bg-slate-900 rounded border border-slate-700"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-300">
                                      {rec}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Analysis Metadata */}
                          <div className="flex items-center gap-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
                            <span>Model: {aiAnalysis.model}</span>
                            <span>Tokens: {aiAnalysis.tokensUsed}</span>
                            <span>Time: {aiAnalysis.analysisTimeMs}ms</span>
                          </div>
                        </div>
                      )}

                      {/* No Analysis Yet */}
                      {aiStatus?.enabled && !aiAnalysis && !aiLoading && (
                        <div className="p-6 bg-slate-900 rounded border border-slate-700 border-dashed text-center">
                          <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 mb-3">
                            Click &quot;Analyze with BridgeAI&quot; to get
                            AI-powered security insights
                          </p>
                          <p className="text-xs text-slate-500">
                            BridgeAI uses Anthropic Claude to analyze code
                            changes and identify potential security issues
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-2">
                        Changes Summary
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>
                          ✏️ Modifications: {diffSummary?.modifications ?? 0}
                        </li>
                        <li>➕ Additions: {diffSummary?.additions ?? 0}</li>
                        <li>🗑️ Deletions: {diffSummary?.deletions ?? 0}</li>
                        <li>
                          📊 Total Changes: {diffSummary?.totalChanges ?? 0}
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-sm font-semibold text-slate-300 mb-2">
                        Sandbox Details
                      </p>
                      <div className="space-y-2 text-sm text-slate-400">
                        <p>
                          <span className="text-slate-300">Status:</span>{" "}
                          {sandbox.status}
                        </p>
                        <p>
                          <span className="text-slate-300">App:</span>{" "}
                          {app?.name || "N/A"} ({app?.platform || "Unknown"})
                        </p>
                        {sandbox.mendixBranch && (
                          <p>
                            <span className="text-slate-300">
                              Mendix Branch:
                            </span>{" "}
                            {sandbox.mendixBranch}
                          </p>
                        )}
                        {sandbox.githubBranch && (
                          <p>
                            <span className="text-slate-300">
                              GitHub Branch:
                            </span>{" "}
                            {sandbox.githubBranch}
                          </p>
                        )}
                      </div>
                    </div>

                    {review && (
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm font-semibold text-slate-300 mb-2">
                          Review Status
                        </p>
                        <div className="space-y-2 text-sm text-slate-400">
                          <p>
                            <span className="text-slate-300">Status:</span>{" "}
                            {review.status}
                          </p>
                          {review.reviewer && (
                            <p>
                              <span className="text-slate-300">Reviewer:</span>{" "}
                              {review.reviewer.name || review.reviewer.email}
                            </p>
                          )}
                          {review.startedAt && (
                            <p>
                              <span className="text-slate-300">Started:</span>{" "}
                              {formatRelativeTime(review.startedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">
                        No comments yet
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded border ${
                            comment.isResolved
                              ? "bg-slate-900/50 border-slate-700/50"
                              : "bg-slate-900 border-slate-700"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-white">
                              {comment.user?.name || comment.user?.email}
                            </p>
                            <span className="text-xs text-slate-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${
                              comment.isResolved
                                ? "text-slate-500 line-through"
                                : "text-slate-300"
                            }`}
                          >
                            {comment.content}
                          </p>
                          {comment.isResolved && (
                            <span className="text-xs text-green-400 mt-1 inline-block">
                              ✓ Resolved
                            </span>
                          )}
                        </div>
                      ))
                    )}

                    {/* Add Comment */}
                    <div className="pt-4 border-t border-slate-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                        onClick={() => setShowAnnotation(!showAnnotation)}
                      >
                        {showAnnotation ? "Cancel" : "Add Comment"}
                      </Button>

                      {showAnnotation && (
                        <div className="mt-4 space-y-3">
                          <Textarea
                            placeholder="Add your comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                            >
                              Save Comment
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => setShowAnnotation(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Feedback & Action Buttons */}
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardContent className="p-4">
                <Textarea
                  placeholder="Add feedback or notes for the submitter..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 mb-4"
                  rows={3}
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-400 hover:text-red-300 bg-transparent"
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "reject" && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-600 text-yellow-400 hover:text-yellow-300 bg-transparent"
                    onClick={handleRequestChanges}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "request-changes" && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Request Changes
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "approve" && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Approve & Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Submitter Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {sandbox.createdBy?.name || sandbox.createdBy?.email}
                  </p>
                  <p className="text-xs text-slate-400">
                    {sandbox.createdBy?.role || "Citizen Developer"}
                  </p>
                </div>

                {sandbox.description && (
                  <div className="p-3 bg-slate-900 rounded border border-slate-700">
                    <p className="text-xs font-semibold text-slate-300 mb-2">
                      Description:
                    </p>
                    <p className="text-xs text-slate-400">
                      {sandbox.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    Submission Stats:
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>{submitterStats.totalSubmissions} total submissions</li>
                    <li>
                      {submitterStats.approvedCount} approved (
                      {Math.round(submitterStats.approvalRate * 100)}% rate)
                    </li>
                    <li>{submitterStats.rejectedCount} rejected</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleLayout>
  );
}
