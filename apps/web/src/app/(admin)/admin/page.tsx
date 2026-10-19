'use client';

import { useQuery } from '@tanstack/react-query';
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
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
    isRefetching,
  } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => AdminService.getOverview(),
    refetchInterval: 15000, // Refresh every 15s
  });

  const { data: diagnostics, isLoading: isDiagnosticsLoading } = useQuery({
    queryKey: ['admin', 'diagnostics'],
    queryFn: () => AdminService.getDiagnostics(),
    refetchInterval: 15000,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['admin', 'recent-activities'],
    queryFn: () => AdminService.getActivities({ limit: 5 }),
    refetchInterval: 15000,
  });

  const isLoading = isOverviewLoading || isDiagnosticsLoading;

  return (
    <div className="space-y-8">
      {/* Header with Title and Refresh Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Command Center
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              Live
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Platform governance, user metrics, real-time subsystem telemetry, and security events.
          </p>
        </div>

        <button
          onClick={() => refetchOverview()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing…' : 'Refresh Metrics'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? '—' : overview?.totalUsers.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              +{overview?.newUsersThisWeek ?? 0} this week
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Registered platform profiles</p>
        </div>

        {/* Active Users Today */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active (24h)</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? '—' : overview?.activeUsersToday.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Authenticated requests in last 24h</p>
        </div>

        {/* Suspended Users */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Suspended / Banned</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? '—' : overview?.suspendedUsers.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Accounts restricted by admin</p>
        </div>

        {/* Platform Status */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Platform State</span>
            <div
              className={`rounded-lg p-2 ${
                overview?.systemStatus === 'operational'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-xl font-bold tracking-tight uppercase ${
                overview?.systemStatus === 'operational' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isLoading ? '—' : overview?.systemStatus}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {diagnostics?.uptimeSeconds
              ? `Uptime: ${Math.floor(diagnostics.uptimeSeconds / 3600)}h ${Math.floor(
                  (diagnostics.uptimeSeconds % 3600) / 60
                )}m`
              : 'Diagnostics active'}
          </p>
        </div>
      </div>

      {/* Subsystem Health Status Matrix */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-rose-400" />
              Subsystem Live Health Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously monitored dependency states and connection latencies.
            </p>
          </div>
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            Deep Diagnostics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Database */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Database className="h-4 w-4 text-blue-400" /> Database (SQLite)
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  diagnostics?.checks.database?.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {diagnostics?.checks.database?.status ?? 'Checking'}
              </span>
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>Mode: WAL</span>
              <span className="font-mono text-slate-200">
                {diagnostics?.checks.database?.latencyMs !== undefined
                  ? `${diagnostics.checks.database.latencyMs} ms`
                  : '—'}
              </span>
            </div>
          </div>

          {/* File Storage */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <HardDrive className="h-4 w-4 text-purple-400" /> Local Storage
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  diagnostics?.checks.storage?.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {diagnostics?.checks.storage?.status ?? 'Checking'}
              </span>
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>Uploads: Writable</span>
              <span className="font-mono text-slate-200">
                {diagnostics?.checks.storage?.latencyMs !== undefined
                  ? `${diagnostics.checks.storage.latencyMs} ms`
                  : '—'}
              </span>
            </div>
          </div>

          {/* Mailer */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Mail className="h-4 w-4 text-amber-400" /> Mail Server (SMTP)
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  diagnostics?.checks.mail?.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {diagnostics?.checks.mail?.status ?? 'Checking'}
              </span>
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>Provider: SMTP</span>
              <span className="font-mono text-slate-200">
                {diagnostics?.checks.mail?.latencyMs !== undefined
                  ? `${diagnostics.checks.mail.latencyMs} ms`
                  : '—'}
              </span>
            </div>
          </div>

          {/* Job Worker */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Clock className="h-4 w-4 text-emerald-400" /> Job Workers
              </span>
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active ({diagnostics?.jobQueue?.activeWorkers ?? 1})
              </span>
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>Pending: {diagnostics?.jobQueue?.queueDepths.pending ?? 0}</span>
              <span className="text-slate-300 font-medium">
                Failed: {diagnostics?.jobQueue?.queueDepths.failed ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Quick Actions & Recent Platform Activities */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Quick Actions & Navigation Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Administrative Actions</h2>

          <Link
            href="/admin/users"
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 transition hover:border-rose-500/40 hover:bg-slate-900/90 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                  Manage Users & Roles
                </h3>
                <p className="text-xs text-slate-400">Promote roles, suspend, and view accounts</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/admin/activity"
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 transition hover:border-rose-500/40 hover:bg-slate-900/90 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Platform Audit Trail
                </h3>
                <p className="text-xs text-slate-400">Security events and user actions</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/admin/services"
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 transition hover:border-rose-500/40 hover:bg-slate-900/90 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Subsystem Diagnostics
                </h3>
                <p className="text-xs text-slate-400">SQLite metrics, memory, queues</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Right Column: Recent Activities Stream */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" /> Recent Platform Activity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest recorded security and system events.
              </p>
            </div>
            <Link
              href="/admin/activity"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {!activitiesData?.logs || activitiesData.logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No activity events recorded yet.
              </div>
            ) : (
              activitiesData.logs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          log.severity === 'ERROR' || log.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : log.severity === 'WARN'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{log.description}</p>
                    {log.actorEmail && (
                      <span className="text-[11px] text-slate-500">Actor: {log.actorEmail}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
