// ============================================
// REVIEW WORKFLOW SYSTEM API CLIENT (Task 14)
// ============================================

import { apiClient } from './client';
import {
  Review,
  SubmitForReviewDto,
  SubmitForReviewResponse,
  ReviewDecisionDto,
  ApproveReviewResponse,
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  ReviewMetrics,
  PaginatedReviewsResponse,
  ReviewFilters,
  ReviewWithComments,
} from '../types/reviews';

const BASE_PATH = '/reviews';

// ============================================
// Review Management
// ============================================

/**
 * Submit a change for review
 */
export async function submitForReview(
  changeId: string,
  data?: SubmitForReviewDto
): Promise<SubmitForReviewResponse> {
  const response = await apiClient.post<SubmitForReviewResponse>(
    `${BASE_PATH}/submit/${changeId}`,
    data || {}
  );
  return response.data;
}

/**
 * Get all reviews with optional filters
 */
export async function getReviews(
  filters?: ReviewFilters
): Promise<PaginatedReviewsResponse> {
  const response = await apiClient.get<PaginatedReviewsResponse>(BASE_PATH, {
    params: filters,
  });
  return response.data;
}

/**
 * Get review metrics
 */
export async function getReviewMetrics(filters?: {
  from?: string;
  to?: string;
}): Promise<ReviewMetrics> {
  const response = await apiClient.get<ReviewMetrics>(
    `${BASE_PATH}/metrics`,
    {
      params: filters,
    }
  );
  return response.data;
}

/**
 * Get a single review by ID
 */
export async function getReview(id: string): Promise<Review> {
  const response = await apiClient.get<Review>(`${BASE_PATH}/${id}`);
  return response.data;
}

/**
 * Start a review (mark as IN_PROGRESS)
 */
export async function startReview(id: string): Promise<Review> {
  const response = await apiClient.post<Review>(`${BASE_PATH}/${id}/start`);
  return response.data;
}

/**
 * Approve a change
 */
export async function approveReview(
  id: string,
  data?: ReviewDecisionDto
): Promise<ApproveReviewResponse> {
  const response = await apiClient.post<ApproveReviewResponse>(
    `${BASE_PATH}/${id}/approve`,
    data || {}
  );
  return response.data;
}

/**
 * Reject a change
 */
export async function rejectReview(
  id: string,
  data: ReviewDecisionDto
): Promise<Review> {
  const response = await apiClient.post<Review>(
    `${BASE_PATH}/${id}/reject`,
    data
  );
  return response.data;
}

/**
 * Request changes
 */
export async function requestChanges(
  id: string,
  data: ReviewDecisionDto
): Promise<Review> {
  const response = await apiClient.post<Review>(
    `${BASE_PATH}/${id}/request-changes`,
    data
  );
  return response.data;
}

/**
 * Get reviews for a specific change
 */
export async function getChangeReviews(
  changeId: string
): Promise<Review[]> {
  const response = await getReviews({ changeId });
  return response.data;
}

/**
 * Get my assigned reviews
 */
export async function getMyReviews(
  reviewerId: string,
  filters?: Omit<ReviewFilters, 'reviewerId'>
): Promise<PaginatedReviewsResponse> {
  return getReviews({ ...filters, reviewerId });
}

// ============================================
// Comments
// ============================================

/**
 * Get all comments for a change (with threading)
 */
export async function getComments(changeId: string): Promise<Comment[]> {
  const response = await apiClient.get<Comment[]>(
    `${BASE_PATH}/${changeId}/comments`
  );
  return response.data;
}

/**
 * Add a comment to a change
 */
export async function createComment(
  changeId: string,
  data: CreateCommentDto
): Promise<Comment> {
  const response = await apiClient.post<Comment>(
    `${BASE_PATH}/${changeId}/comments`,
    data
  );
  return response.data;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentDto
): Promise<Comment> {
  const response = await apiClient.put<Comment>(
    `${BASE_PATH}/comments/${commentId}`,
    data
  );
  return response.data;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/comments/${commentId}`);
}

/**
 * Resolve a comment
 */
export async function resolveComment(commentId: string): Promise<Comment> {
  const response = await apiClient.post<Comment>(
    `${BASE_PATH}/comments/${commentId}/resolve`
  );
  return response.data;
}

/**
 * Unresolve a comment
 */
export async function unresolveComment(commentId: string): Promise<Comment> {
  const response = await apiClient.post<Comment>(
    `${BASE_PATH}/comments/${commentId}/unresolve`
  );
  return response.data;
}

/**
 * Get review with comments
 */
export async function getReviewWithComments(
  reviewId: string
): Promise<ReviewWithComments> {
  const review = await getReview(reviewId);
  const comments = await getComments(review.changeId);

  return {
    ...review,
    comments,
    commentCount: comments.length,
  };
}
