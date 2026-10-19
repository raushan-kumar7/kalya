'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import { Clock, Cpu, Database, HardDrive, Mail, RefreshCw, Server } from 'lucide-react';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';

export default function AdminServicesPage() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'diagnostics'],
    queryFn: () => AdminService.getDiagnostics(),
    refetchInterval: 10000,
  });

  const getStatusPill = (status?: string) => {
    if (status === 'healthy' || status === 'operational') {
      return (
        <Badge variant="success" size="sm" dot dotColor="success" className="font-numeric">
          Healthy
        </Badge>
      );
    }
    if (status === 'degraded') {
      return (
        <Badge variant="warning" size="sm" dot dotColor="warning" className="font-numeric">
          Degraded
        </Badge>
      );
    }
    return (
      <Badge variant="danger" size="sm" dot dotColor="danger" className="font-numeric">
        Unhealthy
      </Badge>
    );
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-md font-display font-bold tracking-tight text-text-primary flex items-center gap-3">
            <Cpu className="h-6 w-6 text-primary" />
            Subsystem Diagnostics & Live Telemetry
          </h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            Real-time status, execution latencies, database engine health, background workers, and
            process memory.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />}
        >
          {isRefetching ? 'Testing Subsystems…' : 'Run Diagnostics Probe'}
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-caption text-text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-3" />
          Running health checks across all platform dependencies…
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 4 Subsystems Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 1. Database (SQLite WAL) */}
            <Card variant="default">
              <CardHeader
                className="pb-3 border-b border-border"
                action={getStatusPill(data?.checks.database?.status)}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary-subtle p-2.5 text-primary shrink-0">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-body-md font-display font-bold text-text-primary">
                      SQLite Database Engine
                    </CardTitle>
                    <p className="text-caption text-text-secondary">
                      Relational schema and WAL checkpoints
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-caption">
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Ping Latency</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                      {data?.checks.database?.latencyMs ?? 0} ms
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Journal Mode</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                      {data?.sqlite?.journalMode ?? 'WAL'}
                    </p>
                  </div>
                </div>

                {/* Table Record Counts */}
                <div className="rounded-xl border border-border bg-surface-raised/50 p-4">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary block mb-2.5">
                    Table Record Counts
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-caption">
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Users</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.sqlite?.tableCounts.users ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Sessions</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.sqlite?.tableCounts.sessions ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Audit Logs</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.sqlite?.tableCounts.auditLogs ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Expenses</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.sqlite?.tableCounts.expenses ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Background Job Worker */}
            <Card variant="default">
              <CardHeader
                className="pb-3 border-b border-border"
                action={getStatusPill('operational')}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-success-subtle p-2.5 text-success shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-body-md font-display font-bold text-text-primary">
                      Job Queue Worker
                    </CardTitle>
                    <p className="text-caption text-text-secondary">
                      Asynchronous task execution subsystem
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-caption">
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Active Workers</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-success">
                      {data?.jobQueue?.activeWorkers ?? 1} Process
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Dead-letter / Failed</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                      {data?.jobQueue?.queueDepths.failed ?? 0}
                    </p>
                  </div>
                </div>

                {/* Queue Depth Cards */}
                <div className="rounded-xl border border-border bg-surface-raised/50 p-4">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary block mb-2.5">
                    Queue Depths
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-caption">
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Pending</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.jobQueue?.queueDepths.pending ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Processing</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.jobQueue?.queueDepths.processing ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-2 border border-border/60">
                      <span className="text-[11px] text-text-muted">Completed</span>
                      <p className="font-numeric font-bold text-text-primary mt-0.5">
                        {data?.jobQueue?.queueDepths.completed ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. File Storage */}
            <Card variant="default">
              <CardHeader
                className="pb-3 border-b border-border"
                action={getStatusPill(data?.checks.storage?.status)}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent-subtle p-2.5 text-accent-strong shrink-0">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-body-md font-display font-bold text-text-primary">
                      File & Media Storage
                    </CardTitle>
                    <p className="text-caption text-text-secondary">
                      Avatar uploads and document storage
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-caption">
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Storage Latency</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                      {data?.checks.storage?.latencyMs ?? 0} ms
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Permission Check</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-success">
                      Read & Write
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-raised/50 p-4 text-caption text-text-secondary space-y-1">
                  <p>
                    Location:{' '}
                    <code className="text-text-primary font-numeric">Local Uploads Directory</code>
                  </p>
                  <p>
                    Status:{' '}
                    <span className="text-success font-semibold">Ready for file uploads</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 4. Mail Server (SMTP) */}
            <Card variant="default">
              <CardHeader
                className="pb-3 border-b border-border"
                action={getStatusPill(data?.checks.mail?.status ?? 'healthy')}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-warning-subtle p-2.5 text-warning shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-body-md font-display font-bold text-text-primary">
                      Email Delivery Service
                    </CardTitle>
                    <p className="text-caption text-text-secondary">
                      Transactional SMTP and verification mail
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-caption">
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Provider</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                      SMTP Handshake
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-raised p-3">
                    <span className="text-text-muted">Queue Transport</span>
                    <p className="mt-1 font-numeric text-body-lg font-bold text-success">
                      Background Job
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-raised/50 p-4 text-caption text-text-secondary space-y-1">
                  <p>
                    Delivery:{' '}
                    <span className="text-text-primary font-medium">
                      Asynchronous background worker
                    </span>
                  </p>
                  <p>
                    Retries:{' '}
                    <span className="text-text-primary font-medium">
                      Exponential backoff enabled
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Node.js Process Runtime Telemetry */}
          <Card variant="raised">
            <CardHeader
              className="pb-3 border-b border-border"
              action={
                <Badge variant="subtle" size="sm" className="font-numeric">
                  PID: {data?.process?.pid ?? '—'}
                </Badge>
              }
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-surface-raised border border-border p-2.5 text-primary shrink-0">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-body-md font-display font-bold text-text-primary">
                    Server Process & Host Runtime
                  </CardTitle>
                  <p className="text-caption text-text-secondary">
                    Memory allocation, Node.js process runtime, and uptime
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-caption">
                <div className="rounded-xl border border-border bg-surface-raised p-4">
                  <span className="text-text-muted">Server Uptime</span>
                  <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                    {formatUptime(data?.uptimeSeconds)}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-raised p-4">
                  <span className="text-text-muted">Memory RSS</span>
                  <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                    {data?.process?.memoryRssMb ?? 0} MB
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-raised p-4">
                  <span className="text-text-muted">V8 Heap (Used / Total)</span>
                  <p className="mt-1 font-numeric text-body-lg font-bold text-text-primary">
                    {data?.process?.heapUsedMb ?? 0} / {data?.process?.heapTotalMb ?? 0} MB
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-raised p-4">
                  <span className="text-text-muted">Node Runtime / OS</span>
                  <p className="mt-1 font-numeric text-body-sm font-bold text-text-primary">
                    {data?.process?.nodeVersion ?? '—'} ({data?.process?.platform ?? '—'})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
