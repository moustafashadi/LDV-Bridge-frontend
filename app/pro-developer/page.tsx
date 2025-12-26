"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RiskIndicator } from "@/components/layout/risk-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { sandboxesApi } from "@/lib/api/sandboxes-api";
import { getNotifications } from "@/lib/api/notifications-api";
import { getReviewMetrics } from "@/lib/api/reviews-api";
import type {
  ReviewQueueItem,
  ReviewQueueMetrics,
  ReviewMetrics,
} from "@/lib/types/reviews";
import type { Notification } from "@/lib/types/notifications";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// Calculate priority based on SLA and risk level
function getPriority(item: ReviewQueueItem): "high" | "medium" | "low" {
  // Overdue items are always high priority
  if (item.sla.isOverdue) return "high";

  // High/critical risk items are high priority
  const riskLevel = item.change?.riskLevel;
  if (riskLevel === "high" || riskLevel === "critical") return "high";

  // Medium risk or close to SLA threshold (>50% of time passed)
  if (riskLevel === "medium") return "medium";
  if (item.sla.hoursWaiting > item.sla.threshold * 0.5) return "medium";

  return "low";
}

// Format relative time from a date string
function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

// Map notification type to activity action text
function getActivityAction(type: string): string {
  switch (type) {
    case "REVIEW_APPROVED":
      return "Approved";
    case "REVIEW_REJECTED":
      return "Rejected";
    case "CHANGE_REQUESTED":
      return "Requested changes on";
    case "REVIEW_ASSIGNED":
      return "Was assigned to review";
    case "COMMENT_ADDED":
      return "Commented on";
    default:
      return "Updated";
  }
}

export default function ProDeveloperDashboard() {
  // Review queue state
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [queueMetrics, setQueueMetrics] = useState<ReviewQueueMetrics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Team activity state (from notifications)
  const [activity, setActivity] = useState<Notification[]>([]);

  // Review performance metrics
  const [performanceMetrics, setPerformanceMetrics] =
    useState<ReviewMetrics | null>(null);

  // Filters
  const [sortBy, setSortBy] = useState<"priority" | "date" | "name">(
    "priority"
  );
  const [platformFilter, setPlatformFilter] = useState<
    "all" | "powerApps" | "mendix"
  >("all");
  const [riskFilter, setRiskFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  // Fetch review queue data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch review queue (primary data)
      try {
        const queueResponse = await sandboxesApi.getReviewQueue();
        setReviewQueue(queueResponse?.data ?? []);
        setQueueMetrics(queueResponse?.metrics ?? null);
      } catch (err) {
        console.error("Failed to fetch review queue:", err);
        setError("Failed to load review queue. Please try again.");
        toast.error("Failed to load review queue");
      }

      // Fetch notifications for team activity (secondary, non-critical)
      try {
        const notificationsResponse = await getNotifications({ limit: 5 });
        setActivity(notificationsResponse?.data ?? []);
      } catch (err) {
        console.error("Failed to fetch team activity:", err);
        // Don't show error toast for secondary data
      }

      // Fetch performance metrics (secondary, non-critical)
      try {
        const metricsResponse = await getReviewMetrics();
        setPerformanceMetrics(metricsResponse ?? null);
      } catch (err) {
        console.error("Failed to fetch performance metrics:", err);
        // Don't show error toast for secondary data
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort the queue
  const filteredQueue = reviewQueue
    .filter((item) => {
      // Platform filter
      if (platformFilter !== "all") {
        const platform = item.app?.platform?.toLowerCase();
        if (platformFilter === "powerApps" && platform !== "powerapps")
          return false;
        if (platformFilter === "mendix" && platform !== "mendix") return false;
      }

      // Risk filter
      if (riskFilter !== "all") {
        const risk = item.change?.riskLevel;
        if (risk !== riskFilter) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[getPriority(a)] - priorityOrder[getPriority(b)];
      }
      if (sortBy === "date") {
        return (
          new Date(b.sandbox.submittedAt).getTime() -
          new Date(a.sandbox.submittedAt).getTime()
        );
      }
      if (sortBy === "name") {
        return (a.app?.name || a.sandbox.name).localeCompare(
          b.app?.name || b.sandbox.name
        );
      }
      return 0;
    });

  // Calculate pending count for header
  const pendingCount = queueMetrics?.pending ?? reviewQueue.length;

  return (
    <RoleLayout>
      <PageHeader
        title="Review Queue"
        description={loading ? "Loading..." : `${pendingCount} pending reviews`}
        actions={
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="name">Sort by App Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Bar */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <Select
                value={platformFilter}
                onValueChange={(v) =>
                  setPlatformFilter(v as typeof platformFilter)
                }
              >
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Apps</SelectItem>
                  <SelectItem value="powerApps">PowerApps</SelectItem>
                  <SelectItem value="mendix">Mendix</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={riskFilter}
                onValueChange={(v) => setRiskFilter(v as typeof riskFilter)}
              >
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Queue Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-slate-700">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12">
                          <Checkbox className="border-slate-600" />
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Priority
                        </TableHead>
                        <TableHead className="text-slate-300">
                          App Name
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Submitter
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Changes
                        </TableHead>
                        <TableHead className="text-slate-300">Risk</TableHead>
                        <TableHead className="text-slate-300">
                          Submitted
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, idx) => (
                          <TableRow
                            key={idx}
                            className="border-b border-slate-700"
                          >
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-6 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-12" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-slate-400"
                          >
                            <p>{error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={fetchData}
                            >
                              Retry
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : filteredQueue.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-slate-400"
                          >
                            {reviewQueue.length === 0
                              ? "No pending reviews. Great job! 🎉"
                              : "No reviews match your filters."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredQueue.map((item) => {
                          const priority = getPriority(item);
                          const appName = item.app?.name || item.sandbox.name;
                          const submitter =
                            item.sandbox.createdBy?.name ||
                            item.sandbox.createdBy?.email ||
                            "Unknown";
                          const changesCount =
                            item.change?.diffSummary?.totalChanges ?? 0;
                          const riskLevel = item.change?.riskLevel || "low";
                          const submittedAt = formatRelativeTime(
                            item.sandbox.submittedAt
                          );

                          return (
                            <TableRow
                              key={item.sandbox.id}
                              className="border-b border-slate-700 hover:bg-slate-700/50"
                            >
                              <TableCell>
                                <Checkbox className="border-slate-600" />
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`text-lg ${
                                    priority === "high"
                                      ? "text-red-400"
                                      : priority === "medium"
                                      ? "text-yellow-400"
                                      : "text-green-400"
                                  }`}
                                  title={
                                    item.sla.isOverdue
                                      ? "Overdue"
                                      : `${item.sla.hoursWaiting.toFixed(
                                          1
                                        )}h waiting`
                                  }
                                >
                                  {priority === "high"
                                    ? "🔴"
                                    : priority === "medium"
                                    ? "🟡"
                                    : "🟢"}
                                </span>
                              </TableCell>
                              <TableCell className="text-white font-medium">
                                {appName}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {submitter}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {changesCount}{" "}
                                {changesCount === 1 ? "change" : "changes"}
                              </TableCell>
                              <TableCell>
                                <RiskIndicator level={riskLevel as any} />
                              </TableCell>
                              <TableCell className="text-slate-400 text-sm">
                                {submittedAt}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {riskLevel === "low" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-slate-600 text-slate-300 bg-transparent"
                                    >
                                      Quick Approve
                                    </Button>
                                  )}
                                  <Link
                                    href={`/pro-developer/review/${item.sandbox.id}`}
                                  >
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      Review Now
                                    </Button>
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Team Activity */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="pb-4 border-b border-slate-700 last:border-0 last:pb-0"
                    >
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))
                ) : !activity || activity.length === 0 ? (
                  <p className="text-sm text-slate-400">No recent activity</p>
                ) : (
                  activity.map((item) => (
                    <div
                      key={item.id}
                      className="pb-4 border-b border-slate-700 last:border-0 last:pb-0"
                    >
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold">[Team]</span>{" "}
                        {getActivityAction(item.type)} "{item.title}"
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx}>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">
                        Avg Review Time
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {performanceMetrics?.averageReviewTime?.toFixed(1) ??
                          "N/A"}
                        h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">
                        Approval Rate
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {performanceMetrics?.approvalRate != null
                          ? `${Math.round(
                              performanceMetrics.approvalRate * 100
                            )}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">
                        Pending Reviews
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {queueMetrics?.pending ?? 0}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleLayout>
  );
}
