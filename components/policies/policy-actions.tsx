// ============================================
// POLICY ACTIONS COMPONENT
// ============================================

import { Button } from '@/components/ui/button';
import { Policy, PolicyStatus } from '@/lib/types/policies';
import { Edit, Trash2, Play, Pause, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface PolicyActionsProps {
  policy: Policy;
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  onActivate?: (policy: Policy) => void;
  onDeactivate?: (policy: Policy) => void;
  onTest?: (policy: Policy) => void;
  variant?: 'buttons' | 'dropdown';
}

export function PolicyActions({
  policy,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onTest,
  variant = 'buttons',
}: PolicyActionsProps) {
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onTest && (
            <DropdownMenuItem onClick={() => onTest(policy)}>
              <Shield className="h-4 w-4 mr-2" />
              Test Policy
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(policy)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {onActivate && policy.status !== PolicyStatus.ACTIVE && (
            <DropdownMenuItem onClick={() => onActivate(policy)}>
              <Play className="h-4 w-4 mr-2" />
              Activate
            </DropdownMenuItem>
          )}
          {onDeactivate && policy.status === PolicyStatus.ACTIVE && (
            <DropdownMenuItem onClick={() => onDeactivate(policy)}>
              <Pause className="h-4 w-4 mr-2" />
              Deactivate
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(policy)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
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
      {onActivate && policy.status !== PolicyStatus.ACTIVE && (
        <Button variant="outline" size="sm" onClick={() => onActivate(policy)}>
          <Play className="h-4 w-4 mr-1" />
          Activate
        </Button>
      )}
      {onDeactivate && policy.status === PolicyStatus.ACTIVE && (
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
    </div>
  );
}
