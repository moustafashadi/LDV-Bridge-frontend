// ============================================
// POLICY CARD COMPONENT
// ============================================

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Policy, PolicyAction } from '@/lib/types/policies';
import { PolicyStatusBadge } from './policy-status-badge';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, FileText, Edit, Trash2, Play, Pause } from 'lucide-react';

interface PolicyCardProps {
  policy: Policy;
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  onActivate?: (policy: Policy) => void;
  onDeactivate?: (policy: Policy) => void;
  onTest?: (policy: Policy) => void;
}

export function PolicyCard({
  policy,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onTest,
}: PolicyCardProps) {
  // Get unique actions from rules
  const actions = Array.from(new Set(policy.rules.map(r => r.action)));

  const actionIcons: Record<PolicyAction, React.ReactNode> = {
    [PolicyAction.BLOCK]: <AlertTriangle className="h-3 w-3" />,
    [PolicyAction.WARN]: <Shield className="h-3 w-3" />,
    [PolicyAction.LOG]: <FileText className="h-3 w-3" />,
  };

  const actionColors: Record<PolicyAction, string> = {
    [PolicyAction.BLOCK]: 'destructive',
    [PolicyAction.WARN]: 'warning',
    [PolicyAction.LOG]: 'secondary',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{policy.name}</CardTitle>
            <CardDescription>{policy.description}</CardDescription>
          </div>
          <PolicyStatusBadge status={policy.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Platform & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{policy.targetPlatform}</Badge>
          {actions.map((action) => (
            <Badge key={action} variant={actionColors[action] as any} className="gap-1">
              {actionIcons[action]}
              {action}
            </Badge>
          ))}
        </div>

        {/* Rules Summary */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{policy.rules.length}</span> rule
          {policy.rules.length !== 1 ? 's' : ''} defined
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created by {policy.createdBy}</div>
          <div>
            Updated {new Date(policy.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        {onTest && (
          <Button variant="outline" size="sm" onClick={() => onTest(policy)}>
            <Shield className="h-4 w-4 mr-1" />
            Test
          </Button>
        )}
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(policy)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        {onActivate && policy.status !== 'ACTIVE' && (
          <Button variant="outline" size="sm" onClick={() => onActivate(policy)}>
            <Play className="h-4 w-4 mr-1" />
            Activate
          </Button>
        )}
        {onDeactivate && policy.status === 'ACTIVE' && (
          <Button variant="outline" size="sm" onClick={() => onDeactivate(policy)}>
            <Pause className="h-4 w-4 mr-1" />
            Deactivate
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(policy)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
