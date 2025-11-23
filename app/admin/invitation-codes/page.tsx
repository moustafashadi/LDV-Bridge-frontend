'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { organizationsApi, usersApi, InvitationCode } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/layout/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

export default function InvitationCodesPage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Create form state
  const [newCodeRole, setNewCodeRole] = useState('CITIZEN_DEVELOPER');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState('');
  const [newCodeExpiresInDays, setNewCodeExpiresInDays] = useState('30');

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

      // Load invitation codes
      const { data: codesData } = await organizationsApi.listInvitationCodes(userData.organizationId);
      setCodes(codesData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load invitation codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!user) return;

    try {
      setProcessingId('creating');
      setError(null);
      setSuccess(null);

      const expiresAt = newCodeExpiresInDays
        ? new Date(Date.now() + parseInt(newCodeExpiresInDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await organizationsApi.createInvitationCode(user.organizationId, {
        role: newCodeRole,
        maxUses: newCodeMaxUses ? parseInt(newCodeMaxUses) : undefined,
        expiresAt,
      });

      setSuccess('Invitation code created successfully!');
      setIsCreateDialogOpen(false);
      
      // Reset form
      setNewCodeRole('CITIZEN_DEVELOPER');
      setNewCodeMaxUses('');
      setNewCodeExpiresInDays('30');

      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error creating code:', err);
      setError(err.response?.data?.message || 'Failed to create invitation code');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    if (!user) return;

    try {
      setProcessingId(codeId);
      setError(null);

      await organizationsApi.updateInvitationCode(user.organizationId, codeId, {
        isActive: !isActive,
      });

      setSuccess(`Code ${!isActive ? 'activated' : 'deactivated'} successfully!`);
      
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error updating code:', err);
      setError(err.response?.data?.message || 'Failed to update invitation code');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this invitation code?')) return;

    try {
      setProcessingId(codeId);
      setError(null);

      await organizationsApi.deleteInvitationCode(user.organizationId, codeId);

      setSuccess('Invitation code deleted successfully!');
      
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error deleting code:', err);
      setError(err.response?.data?.message || 'Failed to delete invitation code');
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess('Code copied to clipboard!');
    setTimeout(() => setSuccess(null), 3000);
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

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
        title="Invitation Codes"
        description="Create and manage invitation codes for your organization"
      />

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          {codes.length} {codes.length === 1 ? 'code' : 'codes'} created
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Code</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Invitation Code</DialogTitle>
                <DialogDescription>
                  Generate a new invitation code that users can use to join your organization instantly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newCodeRole} onValueChange={setNewCodeRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="PRO_DEVELOPER">Pro Developer</SelectItem>
                      <SelectItem value="CITIZEN_DEVELOPER">Citizen Developer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Users who use this code will be assigned this role
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Maximum Uses (optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={newCodeMaxUses}
                    onChange={(e) => setNewCodeMaxUses(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for unlimited uses
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires In (days)</Label>
                  <Input
                    id="expiresIn"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={newCodeExpiresInDays}
                    onChange={(e) => setNewCodeExpiresInDays(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of days until the code expires
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={processingId === 'creating'}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCode}
                  disabled={processingId === 'creating'}
                >
                  {processingId === 'creating' ? 'Creating...' : 'Create Code'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

      {codes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold mb-2">No Invitation Codes</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Create invitation codes to allow users to join your organization instantly without requiring approval.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {codes.map((code) => (
            <Card key={code.id} className={!code.isActive || isExpired(code.expiresAt) ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className={getRoleBadgeColor(code.role)}>
                    {code.role.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {!code.isActive && (
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    )}
                    {isExpired(code.expiresAt) && (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all flex items-center justify-between gap-2">
                  <span>{code.code}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code.code)}
                    className="shrink-0"
                  >
                    📋
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-medium">
                      {code.usedCount}
                      {code.maxUses && ` / ${code.maxUses}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{formatDate(code.createdAt)}</span>
                  </div>
                  {code.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className={`font-medium ${isExpired(code.expiresAt) ? 'text-destructive' : ''}`}>
                        {formatDate(code.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${code.id}`}
                      checked={code.isActive}
                      onCheckedChange={() => handleToggleActive(code.id, code.isActive)}
                      disabled={processingId === code.id}
                    />
                    <Label htmlFor={`active-${code.id}`} className="text-sm cursor-pointer">
                      Active
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCode(code.id)}
                    disabled={processingId === code.id}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
