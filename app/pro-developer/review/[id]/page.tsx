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
import type { SandboxReviewDetails } from "@/lib/types/sandboxes";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
                        <h3 className="text-lg font-semibold text-white mb-4">
                          {change.title}
                        </h3>
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

                        {/* Visual representation */}
                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                          {change.beforeMetadata || change.afterMetadata ? (
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
                              No detailed diff data available
                            </p>
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
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : riskLevel === "medium" ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
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
