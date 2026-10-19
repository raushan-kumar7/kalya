'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Clock,
  Cpu,
  Database,
  HardDrive,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { toast } from '@/components/ui/feedback';

export default function AdminOverviewPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => AdminService.getOverview(),
    refetchInterval: 15000,
  });

  const {
    data: diagnostics,
    isLoading: isDiagnosticsLoading,
    refetch: refetchDiagnostics,
  } = useQuery({
    queryKey: ['admin', 'diagnostics'],
    queryFn: () => AdminService.getDiagnostics(),
    refetchInterval: 15000,
  });

  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ['admin', 'recent-activities'],
    queryFn: () => AdminService.getActivities({ limit: 5 }),
    refetchInterval: 15000,
  });

  const isLoading = isOverviewLoading || isDiagnosticsLoading;

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refetchOverview(),
        refetchDiagnostics(),
        refetchActivities(),
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      toast.success('Dashboard metrics refreshed');
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Title and Refresh Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-md font-display font-bold tracking-tight text-text-primary flex items-center gap-3">
            Command Center
            <Badge
              variant="subtle"
              size="sm"
              dot
              dotColor="primary"
              className="font-semibold uppercase tracking-wider text-[11px]"
            >
              Live
            </Badge>
          </h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            Platform governance, user metrics, real-time subsystem telemetry, and security events.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh Metrics'}
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card variant="default">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">Total Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-display-md font-display font-extrabold text-text-primary tracking-tight font-numeric">
                {isLoading ? '—' : overview?.totalUsers.toLocaleString()}
              </span>
              <span className="text-caption text-success font-medium">
                +{overview?.newUsersThisWeek ?? 0} this week
              </span>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">Registered platform profiles</p>
          </CardContent>
        </Card>

        {/* Active Users Today */}
        <Card variant="default">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">Active (24h)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-subtle text-success">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-display-md font-display font-extrabold text-text-primary tracking-tight font-numeric">
                {isLoading ? '—' : overview?.activeUsersToday.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">Authenticated requests in last 24h</p>
          </CardContent>
        </Card>

        {/* Suspended Users */}
        <Card variant="default">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">
                Suspended / Banned
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-subtle text-warning">
                <UserX className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-display-md font-display font-extrabold text-text-primary tracking-tight font-numeric">
                {isLoading ? '—' : overview?.suspendedUsers.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">Accounts restricted by admin</p>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card variant="default">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">Platform State</span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  overview?.systemStatus === 'operational'
                    ? 'bg-success-subtle text-success'
                    : 'bg-danger-subtle text-danger'
                }`}
              >
                <Server className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <Badge
                variant={overview?.systemStatus === 'operational' ? 'success' : 'danger'}
                size="md"
                dot
                dotColor={overview?.systemStatus === 'operational' ? 'success' : 'danger'}
                className="uppercase font-semibold tracking-wider font-numeric"
              >
                {isLoading ? 'Checking' : overview?.systemStatus}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              {diagnostics?.uptimeSeconds
                ? `Uptime: ${Math.floor(diagnostics.uptimeSeconds / 3600)}h ${Math.floor(
                    (diagnostics.uptimeSeconds % 3600) / 60
                  )}m`
                : 'Diagnostics active'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subsystem Health Status Matrix */}
      <Card variant="raised">
        <CardHeader
          className="pb-4 border-b border-border"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/admin/services"
                className="gap-1.5 text-primary text-caption font-semibold"
              >
                Deep Diagnostics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <div>
            <CardTitle className="text-body-md font-display flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Subsystem Live Health Matrix
            </CardTitle>
            <p className="text-caption text-text-secondary mt-0.5">
              Continuously monitored dependency states and connection latencies.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Database */}
            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-caption font-medium text-text-primary">
                  <Database className="h-4 w-4 text-primary" /> Database (SQLite)
                </span>
                <Badge
                  variant={
                    diagnostics?.checks.database?.status === 'healthy' ? 'success' : 'danger'
                  }
                  size="sm"
                >
                  {diagnostics?.checks.database?.status ?? 'Checking'}
                </Badge>
              </div>
              <div className="mt-3 flex justify-between text-caption text-text-secondary">
                <span>Mode: WAL</span>
                <span className="font-numeric font-semibold text-text-primary">
                  {diagnostics?.checks.database?.latencyMs !== undefined
                    ? `${diagnostics.checks.database.latencyMs} ms`
                    : '—'}
                </span>
              </div>
            </div>

            {/* File Storage */}
            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-caption font-medium text-text-primary">
                  <HardDrive className="h-4 w-4 text-accent" /> Local Storage
                </span>
                <Badge
                  variant={diagnostics?.checks.storage?.status === 'healthy' ? 'success' : 'danger'}
                  size="sm"
                >
                  {diagnostics?.checks.storage?.status ?? 'Checking'}
                </Badge>
              </div>
              <div className="mt-3 flex justify-between text-caption text-text-secondary">
                <span>Uploads: Writable</span>
                <span className="font-numeric font-semibold text-text-primary">
                  {diagnostics?.checks.storage?.latencyMs !== undefined
                    ? `${diagnostics.checks.storage.latencyMs} ms`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Mailer */}
            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-caption font-medium text-text-primary">
                  <Mail className="h-4 w-4 text-accent-strong" /> Mail Server
                </span>
                <Badge
                  variant={diagnostics?.checks.mail?.status === 'healthy' ? 'success' : 'warning'}
                  size="sm"
                >
                  {diagnostics?.checks.mail?.status ?? 'Checking'}
                </Badge>
              </div>
              <div className="mt-3 flex justify-between text-caption text-text-secondary">
                <span>Provider: SMTP</span>
                <span className="font-numeric font-semibold text-text-primary">
                  {diagnostics?.checks.mail?.latencyMs !== undefined
                    ? `${diagnostics.checks.mail.latencyMs} ms`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Job Worker */}
            <div className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-caption font-medium text-text-primary">
                  <Clock className="h-4 w-4 text-primary" /> Job Workers
                </span>
                <Badge variant="subtle" size="sm" className="font-numeric">
                  Active ({diagnostics?.jobQueue?.activeWorkers ?? 1})
                </Badge>
              </div>
              <div className="mt-3 flex justify-between text-caption text-text-secondary font-numeric">
                <span>Pending: {diagnostics?.jobQueue?.queueDepths.pending ?? 0}</span>
                <span className="text-text-primary font-medium">
                  Failed: {diagnostics?.jobQueue?.queueDepths.failed ?? 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Section: Quick Actions & Recent Platform Activities */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Quick Actions & Navigation Cards */}
        <div className="space-y-4">
          <h2 className="text-body-md font-display font-bold text-text-primary">
            Administrative Actions
          </h2>

          <Link
            href="/admin/database"
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-surface-raised group shadow-card"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary group-hover:scale-105 transition-transform">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-caption font-bold text-text-primary group-hover:text-primary transition-colors">
                  Database Studio & Disaster Recovery
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Live SQLite tables, schemas, hot snapshots
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-surface-raised group shadow-card"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent-strong group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-caption font-bold text-text-primary group-hover:text-accent-strong transition-colors">
                  Manage Users & Roles
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Promote roles, suspend, and view accounts
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent-strong group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/admin/activity"
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-surface-raised group shadow-card"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-caption font-bold text-text-primary group-hover:text-primary transition-colors">
                  Platform Audit Trail
                </h3>
                <p className="text-[11px] text-text-secondary">Security events and user actions</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/admin/services"
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-surface-raised group shadow-card"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-text-secondary group-hover:scale-105 transition-transform border border-border">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-caption font-bold text-text-primary group-hover:text-primary transition-colors">
                  Subsystem Diagnostics
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Memory stats, SQLite WAL status, queues
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Right Column: Recent Activities Stream */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader
            className="pb-4 border-b border-border"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/admin/activity"
                  className="gap-1.5 text-primary text-caption font-semibold"
                >
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            }
          >
            <div>
              <CardTitle className="text-body-md font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Recent Platform Activity
              </CardTitle>
              <p className="text-caption text-text-secondary mt-0.5">
                Latest recorded security and system events.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {!activitiesData?.logs || activitiesData.logs.length === 0 ? (
                <div className="py-8 text-center text-caption text-text-muted">
                  No activity events recorded yet.
                </div>
              ) : (
                activitiesData.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-surface-raised/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.severity === 'ERROR' || log.severity === 'CRITICAL'
                              ? 'danger'
                              : log.severity === 'WARN'
                                ? 'warning'
                                : 'secondary'
                          }
                          size="sm"
                          className="font-numeric uppercase tracking-wider text-[10px]"
                        >
                          {log.severity}
                        </Badge>
                        <span className="font-numeric text-caption font-semibold text-text-primary">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-caption text-text-secondary">{log.description}</p>
                      {log.actorEmail && (
                        <span className="text-[11px] font-numeric text-text-muted">
                          Actor: {log.actorEmail}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-numeric text-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
