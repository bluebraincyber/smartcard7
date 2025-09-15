import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, Clock, Database } from "lucide-react";

async function getHealthStatus() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`, {
      next: { revalidate: 5 } // atualiza a cada 5 segundos
    });
    return await res.json();
  } catch (error) {
    return { 
      status: 'down',
      message: 'Failed to fetch health status'
    };
  }
}

export default async function HealthPage() {
  const health = await getHealthStatus();
  const isHealthy = health.status === 'ok';
  const timestamp = health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A';
  const uptime = health.uptimeSec ? new Date((health.uptimeSec || 0) * 1000).toISOString().substr(11, 8) : 'N/A';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Health</h1>
        <div className="flex items-center space-x-2">
          {getStatusIcon(health.status)}
          <span className="capitalize">{health.status || 'unknown'}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {health.status || 'unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: {timestamp}
            </p>
          </CardContent>
        </Card>

        {/* Uptime Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptime}</div>
            <p className="text-xs text-muted-foreground">
              Since last restart
            </p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {health.checks?.db || 'unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Connection status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Version Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-mono text-sm">
                {health.version || 'Not available'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Environment</p>
              <p className="font-mono text-sm">
                {process.env.NODE_ENV || 'development'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
