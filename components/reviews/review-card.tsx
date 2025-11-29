// ============================================
// REVIEW CARD COMPONENT
// ============================================

import { Review } from '@/lib/types/reviews';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReviewStatusColor } from '@/lib/types/reviews';
import { CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
  onRequestChanges?: (review: Review) => void;
  onViewDetails?: (review: Review) => void;
  showActions?: boolean;
}

export function ReviewCard({
  review,
  onApprove,
  onReject,
  onRequestChanges,
  onViewDetails,
  showActions = true,
}: ReviewCardProps) {
  const statusColor = getReviewStatusColor(review.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">
              Review for Change #{review.changeId.slice(0, 8)}
            </CardTitle>
            <CardDescription>
              Assigned to {review.reviewer?.name || 'Unassigned'}
            </CardDescription>
          </div>
          <Badge variant={statusColor as any}>{review.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Change Info */}
        {review.change && (
          <div className="text-sm">
            <p className="font-medium">{review.change.title}</p>
            <p className="text-muted-foreground">
              Type: {review.change.changeType}
              {review.change.riskLevel && ` • Risk: ${review.change.riskLevel}`}
            </p>
          </div>
        )}

        {/* SLA Info */}
        {review.sla && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Expected: {review.sla.expectedCompletionAt ? new Date(review.sla.expectedCompletionAt).toLocaleDateString() : 'N/A'}
            </span>
            {review.sla.isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )}

        {/* Feedback */}
        {review.feedback && (
          <div className="text-sm bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Feedback:</p>
            <p className="text-muted-foreground">{review.feedback}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created: {new Date(review.createdAt).toLocaleString()}</div>
          {review.startedAt && (
            <div>Started: {new Date(review.startedAt).toLocaleString()}</div>
          )}
          {review.completedAt && (
            <div>Completed: {new Date(review.completedAt).toLocaleString()}</div>
          )}
        </div>
      </CardContent>

      {showActions && review.status === 'PENDING' && (
        <CardFooter className="flex gap-2 flex-wrap">
          {onApprove && (
            <Button variant="default" size="sm" onClick={() => onApprove(review)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          )}
          {onRequestChanges && (
            <Button variant="outline" size="sm" onClick={() => onRequestChanges(review)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Request Changes
            </Button>
          )}
          {onReject && (
            <Button variant="destructive" size="sm" onClick={() => onReject(review)}>
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          )}
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(review)}>
              View Details
            </Button>
          )}
        </CardFooter>
      )}

      {review.status !== 'PENDING' && onViewDetails && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(review)}>
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
