// ============================================
// POLICY LIST COMPONENT
// ============================================

import { Policy } from '@/lib/types/policies';
import { PolicyCard } from './policy-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PolicyListProps {
  policies: Policy[];
  loading?: boolean;
  error?: Error | null;
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  onActivate?: (policy: Policy) => void;
  onDeactivate?: (policy: Policy) => void;
  onTest?: (policy: Policy) => void;
}

export function PolicyList({
  policies,
  loading,
  error,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onTest,
}: PolicyListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
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
          Failed to load policies: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No policies found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {policies.map((policy) => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onTest={onTest}
        />
      ))}
    </div>
  );
}
