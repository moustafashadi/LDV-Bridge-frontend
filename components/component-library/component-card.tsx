// ============================================
// COMPONENT CARD COMPONENT
// ============================================

import { Component } from '@/lib/types/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, History, Copy } from 'lucide-react';

interface ComponentCardProps {
  component: Component;
  onViewDetails?: (component: Component) => void;
  onViewVersions?: (component: Component) => void;
  onDuplicate?: (component: Component) => void;
}

export function ComponentCard({
  component,
  onViewDetails,
  onViewVersions,
  onDuplicate,
}: ComponentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{component.name}</CardTitle>
            {component.description && (
              <CardDescription>{component.description}</CardDescription>
            )}
          </div>
          {component.isReusable && (
            <Badge variant="default">Reusable</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type & Platform */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{component.type}</Badge>
          <Badge variant="secondary">{component.platform}</Badge>
        </div>

        {/* Usage Count */}
        <div className="text-sm text-muted-foreground">
          Used {component.usageCount} time{component.usageCount !== 1 ? 's' : ''}
        </div>

        {/* Version */}
        <div className="text-sm text-muted-foreground">
          Version: {component.version}
        </div>

        {/* App Info */}
        {component.appName && (
          <div className="text-sm text-muted-foreground">
            From: {component.appName}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={() => onViewDetails(component)}>
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        )}
        {onViewVersions && (
          <Button variant="outline" size="sm" onClick={() => onViewVersions(component)}>
            <History className="h-4 w-4 mr-1" />
            Versions
          </Button>
        )}
        {onDuplicate && component.isReusable && (
          <Button variant="outline" size="sm" onClick={() => onDuplicate(component)}>
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
