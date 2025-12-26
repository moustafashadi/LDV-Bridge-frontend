// ============================================
// REVIEW WORKFLOW SYSTEM TYPES (Task 14)
// ============================================
// These types match the backend DTOs exactly

export enum ReviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export interface ReviewSLA {
  responseTime?: number; // hours
  reviewTime?: number; // hours
  isOverdue: boolean;
  expectedCompletionAt?: string;
}

export interface ReviewerInfo {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ChangeInfo {
  id: string;
  title: string;
  changeType: string;
  riskLevel?: string;
  riskScore?: number;
}

export interface Review {
  id: string;
  changeId: string;
  change: ChangeInfo;
  reviewerId: string;
  reviewer: ReviewerInfo;
  status: ReviewStatus;
  decision?: 'approve' | 'reject' | 'request_changes';
  feedback?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  sla: ReviewSLA;
}

export interface CreateReviewDto {
  changeId: string;
  reviewerId: string;
  notes?: string;
}

export interface SubmitForReviewDto {
  reviewerIds?: string[]; // Optional manual assignment
}

export interface SubmitForReviewResponse {
  message: string;
  change: any;
  reviews: Review[];
}

export interface ReviewDecisionDto {
  feedback?: string;
}

export interface ApproveReviewResponse {
  review: Review;
  changeStatus: string;
  allApproved: boolean;
}

export interface Comment {
  id: string;
  changeId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  content: string;
  parentId?: string;
  mentions: string[];
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  replyCount?: number;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
  mentions?: string[];
}

export interface UpdateCommentDto {
  content: string;
  mentions?: string[];
}

export interface RiskLevelMetrics {
  count: number;
  averageReviewTime: number;
  approvalRate: number;
}

export interface ReviewMetrics {
  totalReviews: number;
  pendingReviews: number;
  inProgressReviews: number;
  completedReviews: number;
  averageResponseTime: number; // hours
  averageReviewTime: number; // hours
  approvalRate: number; // 0-1
  rejectionRate: number; // 0-1
  changesRequestedRate: number; // 0-1
  overdueReviews: number;
  byRiskLevel?: {
    low?: RiskLevelMetrics;
    medium?: RiskLevelMetrics;
    high?: RiskLevelMetrics;
    critical?: RiskLevelMetrics;
  };
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PaginatedReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewFilters {
  changeId?: string;
  reviewerId?: string;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}

export interface ReviewWithComments extends Review {
  comments: Comment[];
  commentCount: number;
}

// ============================================
// REVIEW QUEUE TYPES (Pro Developer Queue)
// ============================================

export interface ReviewQueueSandbox {
  id: string;
  name: string;
  status: string;
  submittedAt: string;
  mendixBranch?: string;
  githubBranch?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface ReviewQueueApp {
  id: string;
  name: string;
  platform: 'MENDIX' | 'POWERAPPS';
  externalId?: string;
}

export interface ReviewQueueChange {
  id: string;
  title: string;
  changeType: string;
  riskScore?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  diffSummary?: {
    added: number;
    modified: number;
    deleted: number;
    totalChanges: number;
    categories?: {
      pages: number;
      microflows: number;
      nanoflows: number;
      domainModels: number;
      integrations: number;
      resources: number;
      other: number;
    };
  };
  createdAt: string;
}

export interface ReviewQueueReview {
  id: string;
  status: ReviewStatus;
  reviewerId: string;
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
  isAssignedToMe: boolean;
  createdAt: string;
  startedAt?: string;
}

export interface ReviewQueueSLA {
  isOverdue: boolean;
  hoursWaiting: number;
  threshold: number;
  expectedBy: string;
}

export interface ReviewQueueItem {
  sandbox: ReviewQueueSandbox;
  app: ReviewQueueApp | null;
  change: ReviewQueueChange | null;
  review: ReviewQueueReview | null;
  sla: ReviewQueueSLA;
}

export interface ReviewQueueMetrics {
  pending: number;
  inProgress: number;
  overdue: number;
  approved: number;
  rejected: number;
}

export interface ReviewQueueResponse {
  data: ReviewQueueItem[];
  total: number;
  metrics: ReviewQueueMetrics;
}

// Helper functions
export function getReviewStatusColor(status: ReviewStatus): string {
  switch (status) {
    case ReviewStatus.PENDING:
      return 'gray';
    case ReviewStatus.IN_PROGRESS:
      return 'blue';
    case ReviewStatus.APPROVED:
      return 'green';
    case ReviewStatus.REJECTED:
      return 'red';
    case ReviewStatus.CHANGES_REQUESTED:
      return 'yellow';
  }
}

export function getReviewStatusBadgeColor(status: ReviewStatus): string {
  switch (status) {
    case ReviewStatus.PENDING:
      return 'bg-gray-100 text-gray-800';
    case ReviewStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case ReviewStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case ReviewStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case ReviewStatus.CHANGES_REQUESTED:
      return 'bg-yellow-100 text-yellow-800';
  }
}
