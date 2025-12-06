// ============================================
// DIFF VIEWER COMPONENT (Side-by-Side)
// ============================================

import { DiffOperation, DiffOperationType } from '@/lib/types/changes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  diff: DiffOperation[];
  title?: string;
}

export function DiffViewer({ diff, title = 'Changes' }: DiffViewerProps) {
  const getOperationColor = (op: DiffOperationType) => {
    switch (op) {
      case DiffOperationType.ADD:
        return 'bg-green-50 border-green-200';
      case DiffOperationType.REMOVE:
        return 'bg-red-50 border-red-200';
      case DiffOperationType.REPLACE:
        return 'bg-yellow-50 border-yellow-200';
      case DiffOperationType.MOVE:
      case DiffOperationType.COPY:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getOperationIcon = (op: DiffOperationType) => {
    switch (op) {
      case DiffOperationType.ADD:
        return '+';
      case DiffOperationType.REMOVE:
        return '-';
      case DiffOperationType.REPLACE:
        return '~';
      case DiffOperationType.MOVE:
        return '→';
      case DiffOperationType.COPY:
        return '⇒';
      default:
        return '•';
    }
  };

  const getOperationBadge = (op: DiffOperationType) => {
    const variants: Record<DiffOperationType, any> = {
      [DiffOperationType.ADD]: 'default',
      [DiffOperationType.REMOVE]: 'destructive',
      [DiffOperationType.REPLACE]: 'warning',
      [DiffOperationType.MOVE]: 'secondary',
      [DiffOperationType.COPY]: 'secondary',
      [DiffOperationType.TEST]: 'outline',
    };

    return (
      <Badge variant={variants[op]} className="text-xs">
        {op}
      </Badge>
    );
  };

  if (diff.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No changes to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {diff.map((operation, index) => (
            <div
              key={index}
              className={cn(
                'border-l-4 p-3 rounded',
                getOperationColor(operation.op)
              )}
            >
              <div className="flex items-start gap-3">
                {/* Operation Icon */}
                <span className="font-mono font-bold text-sm shrink-0 w-6">
                  {getOperationIcon(operation.op)}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Path */}
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                      {operation.path}
                    </code>
                    {getOperationBadge(operation.op)}
                  </div>

                  {/* Old Value */}
                  {operation.oldValue !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Old: </span>
                      <code className="bg-background px-2 py-1 rounded">
                        {JSON.stringify(operation.oldValue)}
                      </code>
                    </div>
                  )}

                  {/* New Value (value property) */}
                  {operation.value !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">New: </span>
                      <code className="bg-background px-2 py-1 rounded">
                        {JSON.stringify(operation.value)}
                      </code>
                    </div>
                  )}

                  {/* From (for MOVE operations) */}
                  {operation.from && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">From: </span>
                      <code className="bg-background px-2 py-1 rounded">
                        {operation.from}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
