// ============================================
// REVIEW LIST COMPONENT
// ============================================

import { Review } from '@/lib/types/reviews';
import { ReviewCard } from './review-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  error?: Error | null;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
  onRequestChanges?: (review: Review) => void;
  onViewDetails?: (review: Review) => void;
  showActions?: boolean;
}

export function ReviewList({
  reviews,
  loading,
  error,
  onApprove,
  onReject,
  onRequestChanges,
  onViewDetails,
  showActions,
}: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load reviews: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reviews found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onApprove={onApprove}
          onReject={onReject}
          onRequestChanges={onRequestChanges}
          onViewDetails={onViewDetails}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
