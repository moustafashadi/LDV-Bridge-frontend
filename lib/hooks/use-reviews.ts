// ============================================
// REVIEW WORKFLOW HOOKS (Task 14)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Review,
  ReviewWithComments,
  Comment,
  ReviewMetrics,
  PaginatedReviewsResponse,
  ReviewFilters,
  SubmitForReviewDto,
  SubmitForReviewResponse,
  ReviewDecisionDto,
  ApproveReviewResponse,
  CreateCommentDto,
  UpdateCommentDto,
} from '../types/reviews';
import * as reviewsApi from '../api/reviews-api';

/**
 * Hook to fetch reviews with filters
 */
export function useReviews(filters?: ReviewFilters) {
  const [data, setData] = useState<PaginatedReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.getReviews(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.changeId,
    filters?.reviewerId,
    filters?.status,
    filters?.page,
    filters?.limit,
  ]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchReviews,
  };
}

/**
 * Hook to fetch a single review
 */
export function useReview(id: string | null) {
  const [data, setData] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReview = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.getReview(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  return {
    review: data,
    loading,
    error,
    refetch: fetchReview,
  };
}

/**
 * Hook to fetch review with comments (composite)
 */
export function useReviewWithComments(changeId: string | null) {
  const [data, setData] = useState<ReviewWithComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviewWithComments = useCallback(async () => {
    if (!changeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.getReviewWithComments(changeId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [changeId]);

  useEffect(() => {
    fetchReviewWithComments();
  }, [fetchReviewWithComments]);

  return {
    review: data || null,
    comments: data?.comments || [],
    loading,
    error,
    refetch: fetchReviewWithComments,
  };
}

/**
 * Hook to fetch review metrics
 */
export function useReviewMetrics(filters?: {
  from?: string;
  to?: string;
}) {
  const [data, setData] = useState<ReviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.getReviewMetrics(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters?.from, filters?.to]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics: data,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

/**
 * Hook for reviews assigned to the current user
 */
export function useMyReviews(userId: string, filters?: Omit<ReviewFilters, 'reviewerId'>) {
  const [data, setData] = useState<PaginatedReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.getMyReviews(userId, filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, filters?.changeId, filters?.status, filters?.page, filters?.limit]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  return {
    reviews: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchMyReviews,
  };
}

/**
 * Hook to fetch comments for a change
 */
export function useComments(changeId: string | null) {
  const [data, setData] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!changeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.getComments(changeId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [changeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments: data,
    loading,
    error,
    refetch: fetchComments,
  };
}

/**
 * Hook for review workflow actions
 */
export function useReviewActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitForReview = async (
    changeId: string,
    data?: SubmitForReviewDto
  ): Promise<SubmitForReviewResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.submitForReview(changeId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startReview = async (reviewId: string): Promise<Review> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.startReview(reviewId);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (
    reviewId: string,
    data: ReviewDecisionDto
  ): Promise<ApproveReviewResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.approveReview(reviewId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectReview = async (
    reviewId: string,
    data: ReviewDecisionDto
  ): Promise<Review> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.rejectReview(reviewId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestChanges = async (
    reviewId: string,
    data: ReviewDecisionDto
  ): Promise<Review> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.requestChanges(reviewId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitForReview,
    startReview,
    approveReview,
    rejectReview,
    requestChanges,
    loading,
    error,
  };
}

/**
 * Hook for comment actions
 */
export function useCommentActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createComment = async (
    changeId: string,
    data: CreateCommentDto
  ): Promise<Comment> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.createComment(changeId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (
    id: string,
    data: UpdateCommentDto
  ): Promise<Comment> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.updateComment(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await reviewsApi.deleteComment(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resolveComment = async (id: string): Promise<Comment> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.resolveComment(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unresolveComment = async (id: string): Promise<Comment> => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsApi.unresolveComment(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    loading,
    error,
  };
}
