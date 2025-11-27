'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { usePowerAppsApp, useSyncPowerAppsApp } from '@/hooks/use-connectors';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  Database, 
  Calendar,
  User,
  FileCode,
  Globe,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PowerAppsDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  // Fetch app details
  const { 
    data: app, 
    isLoading, 
    error,
    refetch 
  } = usePowerAppsApp(id);

  // Sync mutation
  const { mutate: syncApp, isPending: isSyncing } = useSyncPowerAppsApp();

  const handleSync = () => {
    syncApp(id, {
      onSuccess: () => {
        toast.success('App synced successfully');
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Failed to sync app: ${error.message}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="App Details" description="PowerApps application details" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load app details: {error.message}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="App Not Found" description="The requested app could not be found" />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apps
          </Button>
          <PageHeader
            title={app.properties.displayName}
            description={app.properties.description || 'PowerApps application'}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core application details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Tag className="h-4 w-4 mr-2" />
                    App Name
                  </div>
                  <p className="text-sm">{app.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <FileCode className="h-4 w-4 mr-2" />
                    App Type
                  </div>
                  <Badge variant="outline">
                    {app.type || 'Unknown'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created
                  </div>
                  <p className="text-sm">
                    {app.properties.createdTime 
                      ? new Date(app.properties.createdTime).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last Modified
                  </div>
                  <p className="text-sm">
                    {app.properties.lastModifiedTime 
                      ? new Date(app.properties.lastModifiedTime).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
                {app.properties.owner && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      Owner
                    </div>
                    <p className="text-sm">{app.properties.owner.displayName || app.properties.owner.id}</p>
                  </div>
                )}
              </div>

              {app.properties.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground">{app.properties.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {app.properties.appVersion && (
            <Card>
              <CardHeader>
                <CardTitle>Version Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Version: {app.properties.appVersion}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Metadata</CardTitle>
              <CardDescription>Technical details and properties</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                {JSON.stringify(app, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Details</CardTitle>
              <CardDescription>Environment configuration and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.properties.environment ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <Database className="h-4 w-4 mr-2" />
                      Environment ID
                    </div>
                    <p className="text-sm font-mono">{app.properties.environment.id}</p>
                  </div>
                  {app.properties.environment.name && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                        <Globe className="h-4 w-4 mr-2" />
                        Environment Name
                      </div>
                      <p className="text-sm">{app.properties.environment.name}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No environment information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
