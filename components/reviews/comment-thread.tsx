// ============================================
// COMMENT THREAD COMPONENT
// ============================================

import { Comment } from '@/lib/types/reviews';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentThreadProps {
  comments: Comment[];
  onReply?: (parentId: string) => void;
  onResolve?: (commentId: string) => void;
}

export function CommentThread({ comments, onReply, onResolve }: CommentThreadProps) {
  // Build comment tree
  const rootComments = comments.filter(c => !c.parentId);
  
  const getReplies = (parentId: string) => {
    return comments.filter(c => c.parentId === parentId);
  };

  const renderComment = (comment: Comment, level: number = 0) => (
    <div key={comment.id} className={cn(level > 0 && 'ml-8 mt-4')}>
      <Card className={cn(comment.isResolved && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {comment.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                {comment.isResolved && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Resolved
                  </Badge>
                )}
              </div>

              <p className="text-sm">{comment.content}</p>

              {/* Mentions */}
              {comment.mentions && comment.mentions.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Mentioned: {comment.mentions.map((userId: string) => `@${userId}`).join(', ')}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
                {onResolve && !comment.isResolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResolve(comment.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      {getReplies(comment.id).map(reply => renderComment(reply, level + 1))}
    </div>
  );

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rootComments.map(comment => renderComment(comment))}
    </div>
  );
}
