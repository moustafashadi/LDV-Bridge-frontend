'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { onboardingApi } from '@/lib/api';
import { getRoleBasedRedirect } from '@/lib/redirect-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type OnboardingFlow = 'select' | 'create_org' | 'join_org' | 'use_code';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [flow, setFlow] = useState<OnboardingFlow>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [requestedRole, setRequestedRole] = useState('CITIZEN_DEVELOPER');
  const [message, setMessage] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      if (authLoading) return;
      
      try {
        const { data: status } = await onboardingApi.getStatus();
        
        if (status.onboarded && status.status === 'ACTIVE' && status.role) {
          router.push(getRoleBasedRedirect(status.role));
        } else if (status.status === 'pending_approval') {
          router.push('/pending-approval');
        }
      } catch (err: any) {
        console.error('Error checking onboarding status:', err);
        
        // If 401 Unauthorized or consent required, user needs to re-authenticate
        if (err.response?.status === 401 || err.message?.includes('consent') || err.message?.includes('login_required')) {
          console.log('Auth token expired or consent required. User needs to log in again.');
          setNeedsReauth(true);
          setError('Your session has expired. Please log in again to continue.');
          return;
        }
        
        // For other errors, show error message
        setError(err.response?.data?.message || 'Failed to check onboarding status. Please try logging in again.');
      }
    };

    checkStatus();
  }, [authLoading, router]);

  const searchOrganizations = async () => {
    if (!searchQuery) return;
    
    try {
      const { data } = await onboardingApi.searchOrganizations(searchQuery);
      setOrganizations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search organizations');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onboardingApi.complete({
        flow: 'create_org',
        email: user?.email || '',
        name: user?.name,
        createOrg: {
          name: orgName,
          domain: orgDomain || undefined,
          settings: {
            onboardingComplete: true,
          },
        },
      });

      // Fetch user status to get their role and redirect accordingly
      const { data: status } = await onboardingApi.getStatus();
      if (status.role) {
        router.push(getRoleBasedRedirect(status.role));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onboardingApi.complete({
        flow: 'join_org',
        email: user?.email || '',
        name: user?.name,
        joinOrg: {
          organizationId: selectedOrgId,
          requestedRole,
          message: message || undefined,
        },
      });

      router.push('/pending-approval');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit join request');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onboardingApi.complete({
        flow: 'use_code',
        email: user?.email || '',
        name: user?.name,
        invitationCode,
      });

      // Fetch user status to get their role and redirect accordingly
      const { data: status } = await onboardingApi.getStatus();
      if (status.role) {
        router.push(getRoleBasedRedirect(status.role));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation code');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show re-authentication UI if session expired
  if (needsReauth) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <CardTitle>Session Expired</CardTitle>
            </div>
            <CardDescription>
              Your authentication session has expired. Please log in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This can happen if you've been inactive for a while or if your browser cleared the session.
              </p>
              <p className="text-sm text-muted-foreground">
                Click the button below to securely log in again through Auth0.
              </p>
            </div>
            <Button 
              onClick={() => loginWithRedirect()}
              className="w-full"
              size="lg"
            >
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to LDV-Bridge!</h1>
        <p className="text-muted-foreground">
          Let's get you set up. Choose how you'd like to get started.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {flow === 'select' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFlow('create_org')}>
            <CardHeader>
              <div className="text-4xl mb-2">🏢</div>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>
                Start fresh - create a new organization and become the admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFlow('join_org')}>
            <CardHeader>
              <div className="text-4xl mb-2">👥</div>
              <CardTitle>Join Organization</CardTitle>
              <CardDescription>
                Request to join an existing organization (requires approval)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Find Organization</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFlow('use_code')}>
            <CardHeader>
              <div className="text-4xl mb-2">🎟️</div>
              <CardTitle>Invitation Code</CardTitle>
              <CardDescription>
                Have an invitation code? Enter it to join instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Enter Code</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {flow === 'create_org' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Your Organization</CardTitle>
            <CardDescription>
              You'll become the administrator with full access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrg} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="ACME Corporation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDomain">Email Domain (Optional)</Label>
                <Input
                  id="orgDomain"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  placeholder="acme.com"
                />
                <p className="text-sm text-muted-foreground">
                  Users with this email domain can request to join
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setFlow('select')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Organization'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {flow === 'join_org' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Join an Organization</CardTitle>
            <CardDescription>
              Search for your organization and request to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search">Search for Organization</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter organization name..."
                    onKeyPress={(e) => e.key === 'Enter' && searchOrganizations()}
                  />
                  <Button onClick={searchOrganizations} type="button">
                    Search
                  </Button>
                </div>
              </div>

              {organizations.length > 0 && (
                <div className="space-y-4">
                  <Label>Select Organization</Label>
                  <div className="space-y-2">
                    {organizations.map((org) => (
                      <div
                        key={org.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrgId === org.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedOrgId(org.id)}
                      >
                        <div className="font-semibold">{org.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {org.domain && `${org.domain} • `}
                          {org.userCount} members
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrgId && (
                <form onSubmit={handleJoinOrg} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Requested Role</Label>
                    <Select value={requestedRole} onValueChange={setRequestedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CITIZEN_DEVELOPER">Citizen Developer</SelectItem>
                        <SelectItem value="PRO_DEVELOPER">Pro Developer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message to Admin (Optional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the admin why you'd like to join..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setFlow('select')} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Submitting...' : 'Request to Join'}
                    </Button>
                  </div>
                </form>
              )}

              {!selectedOrgId && (
                <Button variant="outline" onClick={() => setFlow('select')} className="w-full">
                  Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {flow === 'use_code' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Enter Invitation Code</CardTitle>
            <CardDescription>
              Use the code provided by your organization admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUseCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Invitation Code</Label>
                <Input
                  id="code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="ORG-XXXXXX"
                  required
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Format: ORG-XXXXXXXXXX
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setFlow('select')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Join Organization'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
