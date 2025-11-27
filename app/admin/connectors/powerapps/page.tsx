'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePowerAppsEnvironments, usePowerAppsApps, useSyncPowerAppsApp } from '@/hooks/use-connectors';
import { Search, RefreshCw, ExternalLink, AlertCircle, Database, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function PowerAppsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');

  // Fetch environments
  const { 
    data: environments, 
    isLoading: environmentsLoading, 
    error: environmentsError 
  } = usePowerAppsEnvironments();

  // Fetch apps (filtered by environment if selected)
  const { 
    data: apps, 
    isLoading: appsLoading, 
    error: appsError,
    refetch: refetchApps 
  } = usePowerAppsApps(selectedEnvironment === 'all' ? undefined : selectedEnvironment);

  // Sync mutation
  const { mutate: syncApp, isPending: isSyncing } = useSyncPowerAppsApp();

  // Filter apps by search query
  const filteredApps = (Array.isArray(apps) ? apps : []).filter(app => 
    app.properties.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSync = (appId: string, appName: string) => {
    syncApp(appId, {
      onSuccess: () => {
        toast.success(`Synced ${appName} successfully`);
        refetchApps();
      },
      onError: (error: any) => {
        toast.error(`Failed to sync ${appName}: ${error.message}`);
      },
    });
  };

  const handleViewDetails = (appId: string) => {
    router.push(`/admin/connectors/powerapps/${appId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="PowerApps Applications"
        description="View and manage your PowerApps applications across all environments"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Applications</CardTitle>
          <CardDescription>Search and filter your PowerApps apps</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by app name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              {environmentsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                environments?.map((env) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.properties?.displayName || env.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => refetchApps()}
            disabled={appsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${appsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Error States */}
      {environmentsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load environments: {environmentsError.message}
          </AlertDescription>
        </Alert>
      )}

      {appsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load apps: {appsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Apps Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appsLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredApps.length === 0 ? (
          // Empty state
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Apps Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery || selectedEnvironment !== 'all'
                  ? 'No apps match your current filters. Try adjusting your search or environment filter.'
                  : 'No PowerApps applications found in your environments.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          // Apps cards
          filteredApps.map((app) => (
            <Card key={app.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{app.properties.displayName}</CardTitle>
                    <CardDescription className="truncate">{app.name}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {app.type || 'App'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* App Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Database className="h-4 w-4 mr-2" />
                    <span className="truncate">
                      {environments?.find(e => e.id === app.properties?.environment?.id)?.properties?.displayName || 'Unknown Environment'}
                    </span>
                  </div>
                  {app.properties?.createdTime && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Created {new Date(app.properties.createdTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {app.properties?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {app.properties.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(app.name)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSync(app.name, app.properties.displayName)}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      {!appsLoading && filteredApps.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredApps.length} of {apps?.length || 0} apps
        </div>
      )}
    </div>
  );
}
