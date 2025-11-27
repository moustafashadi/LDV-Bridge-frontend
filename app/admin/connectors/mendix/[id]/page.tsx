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
import { useMendixApp, useSyncMendixApp } from '@/hooks/use-connectors';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  FolderOpen, 
  Calendar,
  User,
  FileCode,
  Globe,
  Tag,
  ExternalLink,
  Server
} from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MendixDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  // Fetch app details
  const { 
    data: app, 
    isLoading, 
    error,
    refetch 
  } = useMendixApp(id);

  // Sync mutation
  const { mutate: syncApp, isPending: isSyncing } = useSyncMendixApp();

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
        <PageHeader title="App Details" description="Mendix application details" />
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
            title={app.name}
            description={app.description || 'Mendix application'}
          />
        </div>
        <div className="flex gap-2">
          {app.metadata.url && (
            <Button
              variant="outline"
              onClick={() => window.open(app.metadata.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open App
            </Button>
          )}
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
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
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
                    App ID
                  </div>
                  <p className="text-sm font-mono">{app.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Project ID
                  </div>
                  <p className="text-sm font-mono">{app.metadata.projectId}</p>
                </div>
                {app.metadata.url && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      URL
                    </div>
                    <a 
                      href={app.metadata.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      {app.metadata.url}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {app.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          {app.metadata.environments && app.metadata.environments.length > 0 ? (
            <div className="grid gap-4">
              {app.metadata.environments.map((env: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Server className="h-4 w-4 mr-2" />
                          {env.name || `Environment ${index + 1}`}
                        </CardTitle>
                        <CardDescription>
                          {env.Status || 'Unknown Status'}
                        </CardDescription>
                      </div>
                      {env.Mode && (
                        <Badge variant="outline">{env.Mode}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {env.Url && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <Globe className="h-4 w-4 mr-2" />
                            Environment URL
                          </div>
                          <a 
                            href={env.Url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            {env.Url}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {env.ProductionLevel && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm font-medium text-muted-foreground">
                            Production Level
                          </div>
                          <Badge>{env.ProductionLevel}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Environments</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  No environment information available for this application.
                </p>
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
      </Tabs>
    </div>
  );
}
