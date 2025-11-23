'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { organizationsApi, usersApi, JoinRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/layout/page-header';

export default function JoinRequestsPage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user to get organization ID
      const { data: userData } = await usersApi.getMe();
      setUser(userData);

      // Load join requests
      const { data: requestsData } = await organizationsApi.getPendingJoinRequests(userData.organizationId);
      setRequests(requestsData);

      // Initialize selected roles with requested roles
      const roles: Record<string, string> = {};
      requestsData.forEach((req: JoinRequest) => {
        roles[req.id] = req.requestedRole;
      });
      setSelectedRole(roles);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    
    try {
      setProcessingId(requestId);
      setError(null);
      setSuccess(null);

      const role = selectedRole[requestId];
      await organizationsApi.approveJoinRequest(user.organizationId, requestId, role);

      setSuccess('Request approved successfully! User has been added to the organization.');
      
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error approving request:', err);
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user) return;

    try {
      setProcessingId(requestId);
      setError(null);
      setSuccess(null);

      const reason = rejectReason[requestId];
      await organizationsApi.rejectJoinRequest(user.organizationId, requestId, reason);

      setSuccess('Request rejected successfully.');
      
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'PRO_DEVELOPER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'CITIZEN_DEVELOPER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Join Requests"
        description="Review and manage pending requests to join your organization"
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground text-center max-w-md">
              There are currently no pending join requests. When users request to join your organization,
              they will appear here for approval.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
            </p>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              Refresh
            </Button>
          </div>

          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{request.name || 'No name provided'}</CardTitle>
                    <CardDescription>{request.email}</CardDescription>
                  </div>
                  <Badge className={getRoleBadgeColor(request.requestedRole)}>
                    {request.requestedRole.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.message && (
                  <div className="bg-muted p-4 rounded-lg">
                    <Label className="text-sm font-semibold mb-2 block">Message from applicant:</Label>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Submitted: {formatDate(request.createdAt)}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`role-${request.id}`}>Assign Role</Label>
                    <Select
                      value={selectedRole[request.id]}
                      onValueChange={(value) =>
                        setSelectedRole({ ...selectedRole, [request.id]: value })
                      }
                    >
                      <SelectTrigger id={`role-${request.id}`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="PRO_DEVELOPER">Pro Developer</SelectItem>
                        <SelectItem value="CITIZEN_DEVELOPER">Citizen Developer</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      You can override the requested role if needed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`reason-${request.id}`}>Rejection Reason (optional)</Label>
                    <Textarea
                      id={`reason-${request.id}`}
                      placeholder="Enter reason for rejection..."
                      value={rejectReason[request.id] || ''}
                      onChange={(e) =>
                        setRejectReason({ ...rejectReason, [request.id]: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1"
                    >
                      {processingId === request.id ? 'Processing...' : 'Approve & Add User'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1"
                    >
                      {processingId === request.id ? 'Processing...' : 'Reject Request'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
