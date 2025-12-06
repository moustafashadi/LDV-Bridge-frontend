// ============================================
// ENHANCED NOTIFICATION DROPDOWN WITH TABS
// ============================================

'use client';

import { useState } from 'react';
import { useNotifications, useNotificationActions } from '@/lib/hooks/use-notifications';
import { useJoinRequests, useApproveJoinRequest, useRejectJoinRequest } from '@/lib/hooks/use-organizations';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCheck, 
  Trash2, 
  Bell, 
  UserPlus, 
  Check, 
  X,
  Clock,
  Shield,
  Code,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { JoinRequest } from '@/lib/api/organizations-api';

interface NotificationDropdownEnhancedProps {
  userId?: string;
  organizationId: string;
  userRole?: 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER';
  onClose?: () => void;
}

export function NotificationDropdownEnhanced({ 
  userId, 
  organizationId,
  userRole,
  onClose 
}: NotificationDropdownEnhancedProps) {
  const [showAllRequestsModal, setShowAllRequestsModal] = useState(false);
  
  // Notifications
  const { notifications, loading: notifLoading, error: notifError, refetch: refetchNotifs } = useNotifications({
    page: 1,
    limit: 10,
  });

  const { markAllAsRead, deleteAllRead, loading: actionLoading } = useNotificationActions();

  // Join Requests (Admin only)
  const isAdmin = userRole === 'ADMIN';
  const { data: joinRequests = [], isLoading: requestsLoading, refetch: refetchRequests } = useJoinRequests(organizationId, isAdmin);
  const approveMutation = useApproveJoinRequest(organizationId);
  const rejectMutation = useRejectJoinRequest(organizationId);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingRequestsCount = isAdmin ? joinRequests.length : 0;

  // Handlers
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetchNotifs();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllRead();
      refetchNotifs();
    } catch (err) {
      console.error('Failed to delete read notifications:', err);
    }
  };

  const handleApprove = async (requestId: string, requestedRole: string) => {
    try {
      await approveMutation.mutateAsync({ 
        requestId, 
        data: { role: requestedRole as any } 
      });
      refetchRequests();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync({ 
        requestId, 
        data: { reason: 'Request declined by admin' } 
      });
      refetchRequests();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-3 w-3" />;
      case 'PRO_DEVELOPER':
        return <Code className="h-3 w-3" />;
      case 'CITIZEN_DEVELOPER':
        return <Briefcase className="h-3 w-3" />;
      default:
        return <UserPlus className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'PRO_DEVELOPER':
        return 'Pro Developer';
      case 'CITIZEN_DEVELOPER':
        return 'Citizen Developer';
      default:
        return role;
    }
  };

  const getInitials = (name: string | undefined | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (!email) return '??';
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString();
  };

  return (
    <>
      <div className="absolute right-0 top-12 w-[600px] bg-background border rounded-lg shadow-lg z-50">
        <Tabs defaultValue="notifications" className="w-full">
          {/* Tab Headers */}
          <div className="p-4 border-b">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="join-requests" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Join Requests
                  {pendingRequestsCount > 0 && (
                    <Badge variant="default" className="ml-1 h-5 min-w-5 px-1">
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="m-0">
            {/* Action Buttons */}
            <div className="px-4 py-2 border-b flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading || notifLoading}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAllRead}
                disabled={actionLoading || notifLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear read
              </Button>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[400px]">
              {notifLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : notifError ? (
                <div className="p-4 text-sm text-destructive">
                  Failed to load notifications
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={refetchNotifs}
                      onDelete={refetchNotifs}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Join Requests Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="join-requests" className="m-0">
              <ScrollArea className="h-[450px]">
              {requestsLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending join requests</p>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {joinRequests.slice(0, 5).map((request) => {
                      // Safety check for user data
                      if (!request.user) {
                        console.warn('Join request missing user data:', request.id);
                        return null;
                      }
                      
                      return (
                      <div key={request.id} className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(request.user?.name, request.user?.email || 'Unknown')}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">
                                  {request.user?.name || request.user?.email || 'Unknown User'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {request.user?.email || 'No email'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground f-0">
                                <Clock className="h-3 w-3" />
                                {formatDate(request.createdAt)}
                              </div>
                            </div>

                            {/* Requested Role */}
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {getRoleIcon(request.requestedRole)}
                                <span className="ml-1">{getRoleLabel(request.requestedRole)}</span>
                              </Badge>
                            </div>

                            {/* Message */}
                            {request.message && (
                              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                {request.message}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(request.id, request.requestedRole)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className="h-7"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className="h-7"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* View All Button */}
                  {joinRequests.length > 5 && (
                    <div className="p-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowAllRequestsModal(true)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View All {joinRequests.length} Requests
                      </Button>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Full Requests Modal */}
      <JoinRequestsModal
        open={showAllRequestsModal}
        onOpenChange={setShowAllRequestsModal}
        requests={joinRequests}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </>
  );
}

// ============================================
// JOIN REQUESTS MODAL (Full View)
// ============================================

interface JoinRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: JoinRequest[];
  onApprove: (requestId: string, role: string) => void;
  onReject: (requestId: string) => void;
  isLoading: boolean;
}

function JoinRequestsModal({
  open,
  onOpenChange,
  requests,
  onApprove,
  onReject,
  isLoading,
}: JoinRequestsModalProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-3 w-3" />;
      case 'PRO_DEVELOPER': return <Code className="h-3 w-3" />;
      case 'CITIZEN_DEVELOPER': return <Briefcase className="h-3 w-3" />;
      default: return <UserPlus className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'PRO_DEVELOPER': return 'Pro Developer';
      case 'CITIZEN_DEVELOPER': return 'Citizen Developer';
      default: return role;
    }
  };

  const getInitials = (name: string | undefined | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (!email) return '??';
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            All Join Requests ({requests.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {requests.map((request) => {
              // Safety check for user data
              if (!request.user) {
                console.warn('Join request missing user data in modal:', request.id);
                return null;
              }
              
              return (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 f-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(request.user?.name, request.user?.email || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {request.user?.name || request.user?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.user?.email || 'No email'}
                        </p>
                      </div>
                      <Badge variant="outline" className="f-0">
                        {getRoleIcon(request.requestedRole)}
                        <span className="ml-1">{getRoleLabel(request.requestedRole)}</span>
                      </Badge>
                    </div>

                    {request.message && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {request.message}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      Requested: {formatDate(request.createdAt)}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onApprove(request.id, request.requestedRole)}
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(request.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
