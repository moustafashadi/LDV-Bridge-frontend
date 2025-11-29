// ============================================
// POLICY STATUS BADGE COMPONENT
// ============================================

import { Badge } from '@/components/ui/badge';
import { PolicyStatus } from '@/lib/types/policies';

interface PolicyStatusBadgeProps {
  status: PolicyStatus;
  className?: string;
}

export function PolicyStatusBadge({ status, className }: PolicyStatusBadgeProps) {
  const variants: Record<PolicyStatus, { variant: any; label: string }> = {
    [PolicyStatus.ACTIVE]: { variant: 'default', label: 'Active' },
    [PolicyStatus.INACTIVE]: { variant: 'secondary', label: 'Inactive' },
    [PolicyStatus.DRAFT]: { variant: 'outline', label: 'Draft' },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
