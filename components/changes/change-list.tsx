// ============================================
// CHANGE LIST COMPONENT
// ============================================

import { Change } from '@/lib/types/changes';
import { ChangeCard } from './change-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ChangeListProps {
  changes: Change[];
  loading?: boolean;
  error?: Error | null;
  onViewDetails?: (change: Change) => void;
  onViewDiff?: (change: Change) => void;
  onViewImpact?: (change: Change) => void;
}

export function ChangeList({
  changes,
  loading,
  error,
  onViewDetails,
  onViewDiff,
  onViewImpact,
}: ChangeListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load changes: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No changes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changes.map((change) => (
        <ChangeCard
          key={change.id}
          change={change}
          onViewDetails={onViewDetails}
          onViewDiff={onViewDiff}
          onViewImpact={onViewImpact}
        />
      ))}
    </div>
  );
}
