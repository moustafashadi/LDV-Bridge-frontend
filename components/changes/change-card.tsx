// ============================================
// CHANGE CARD COMPONENT
// ============================================

import { Change } from '@/lib/types/changes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskScoreBadge } from '@/components/risk';
import { Eye, GitCompare, AlertTriangle } from 'lucide-react';

interface ChangeCardProps {
  change: Change;
  onViewDetails?: (change: Change) => void;
  onViewDiff?: (change: Change) => void;
  onViewImpact?: (change: Change) => void;
}

export function ChangeCard({
  change,
  onViewDetails,
  onViewDiff,
  onViewImpact,
}: ChangeCardProps) {
  const statusColors: Record<string, string> = {
    DRAFT: 'secondary',
    PENDING: 'warning',
    APPROVED: 'default',
    REJECTED: 'destructive',
    DEPLOYED: 'default',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{change.title}</CardTitle>
            <CardDescription>{change.description}</CardDescription>
          </div>
          <Badge variant={statusColors[change.status] as any}>
            {change.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Change Type & Author */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{change.changeType}</Badge>
          <span className="text-sm text-muted-foreground">
            by {change.authorName}
          </span>
        </div>

        {/* Risk Score */}
        {change.riskAssessment && (
          <div className="flex items-center gap-2">
            <RiskScoreBadge score={change.riskAssessment.totalScore} />
            {change.riskAssessment.autoBlocked && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Auto-Blocked
              </Badge>
            )}
          </div>
        )}

        {/* Diff Summary */}
        {change.diffSummary && (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-4">
              <span className="text-green-600">+{change.diffSummary.added}</span>
              <span className="text-red-600">-{change.diffSummary.removed}</span>
              <span className="text-muted-foreground">
                {change.diffSummary.modified} modified
              </span>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          Detected: {new Date(change.detectedAt).toLocaleString()}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={() => onViewDetails(change)}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        )}
        {onViewDiff && (
          <Button variant="outline" size="sm" onClick={() => onViewDiff(change)}>
            <GitCompare className="h-4 w-4 mr-1" />
            View Diff
          </Button>
        )}
        {onViewImpact && change.impactAnalysis && (
          <Button variant="outline" size="sm" onClick={() => onViewImpact(change)}>
            <AlertTriangle className="h-4 w-4 mr-1" />
            View Impact
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
