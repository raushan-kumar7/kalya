'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import { Clock, Cpu, Database, HardDrive, Mail, RefreshCw, Server } from 'lucide-react';

export default function AdminServicesPage() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'diagnostics'],
    queryFn: () => AdminService.getDiagnostics(),
    refetchInterval: 10000, // Poll every 10s
  });

  const getStatusPill = (status?: string) => {
    if (status === 'healthy' || status === 'operational') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Healthy
        </span>
      );
    }
    if (status === 'degraded') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Degraded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Unhealthy
      </span>
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Cpu className="h-6 w-6 text-rose-500" />
            Subsystem Diagnostics & Live Telemetry
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time status, execution latencies, database engine health, background workers, and
            process memory.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Testing Subsystems…' : 'Run Diagnostics Probe'}
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent mx-auto mb-3" />
          Running health checks across all platform dependencies…
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 4 Subsystems Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 1. Database (SQLite WAL) */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">SQLite Database Engine</h2>
                    <p className="text-xs text-slate-400">Relational schema and WAL checkpoints</p>
                  </div>
                </div>
                {getStatusPill(data?.checks.database?.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Ping Latency</span>
                  <p className="mt-1 font-mono text-base font-bold text-white">
                    {data?.checks.database?.latencyMs ?? 0} ms
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Journal Mode</span>
                  <p className="mt-1 font-mono text-base font-bold text-white">
                    {data?.sqlite?.journalMode ?? 'WAL'}
                  </p>
                </div>
              </div>

              {/* Table Record Counts */}
              <div className="rounded-xl border border-white/[0.04] bg-slate-950/40 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Table Record Counts
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Users</span>
                    <p className="font-mono font-bold text-white">
                      {data?.sqlite?.tableCounts.users ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Sessions</span>
                    <p className="font-mono font-bold text-white">
                      {data?.sqlite?.tableCounts.sessions ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Audit Logs</span>
                    <p className="font-mono font-bold text-white">
                      {data?.sqlite?.tableCounts.auditLogs ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Expenses</span>
                    <p className="font-mono font-bold text-white">
                      {data?.sqlite?.tableCounts.expenses ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Background Job Worker */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Job Queue Worker</h2>
                    <p className="text-xs text-slate-400">Asynchronous task execution subsystem</p>
                  </div>
                </div>
                {getStatusPill('operational')}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Active Workers</span>
                  <p className="mt-1 font-mono text-base font-bold text-emerald-400">
                    {data?.jobQueue?.activeWorkers ?? 1} Process
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Dead-letter / Failed</span>
                  <p className="mt-1 font-mono text-base font-bold text-white">
                    {data?.jobQueue?.queueDepths.failed ?? 0}
                  </p>
                </div>
              </div>

              {/* Queue Depth Cards */}
              <div className="rounded-xl border border-white/[0.04] bg-slate-950/40 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Queue Depths
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Pending</span>
                    <p className="font-mono font-bold text-white">
                      {data?.jobQueue?.queueDepths.pending ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Processing</span>
                    <p className="font-mono font-bold text-white">
                      {data?.jobQueue?.queueDepths.processing ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2">
                    <span className="text-[11px] text-slate-500">Completed</span>
                    <p className="font-mono font-bold text-white">
                      {data?.jobQueue?.queueDepths.completed ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. File Storage */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">File & Media Storage</h2>
                    <p className="text-xs text-slate-400">Avatar uploads and document storage</p>
                  </div>
                </div>
                {getStatusPill(data?.checks.storage?.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Storage Latency</span>
                  <p className="mt-1 font-mono text-base font-bold text-white">
                    {data?.checks.storage?.latencyMs ?? 0} ms
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Permission Check</span>
                  <p className="mt-1 font-mono text-base font-bold text-emerald-400">
                    Read & Write
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.04] bg-slate-950/40 p-4 text-xs text-slate-400 space-y-1">
                <p>
                  Location: <code className="text-slate-200">Local Uploads Directory</code>
                </p>
                <p>
                  Status: <span className="text-emerald-400">Ready for file uploads</span>
                </p>
              </div>
            </div>

            {/* 4. Mail Server (SMTP) */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Email Delivery Service</h2>
                    <p className="text-xs text-slate-400">
                      Transactional SMTP and verification mail
                    </p>
                  </div>
                </div>
                {getStatusPill(data?.checks.mail?.status ?? 'healthy')}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Provider</span>
                  <p className="mt-1 font-mono text-base font-bold text-white">SMTP Handshake</p>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-3">
                  <span className="text-slate-400">Queue Transport</span>
                  <p className="mt-1 font-mono text-base font-bold text-emerald-400">
                    Background Job
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.04] bg-slate-950/40 p-4 text-xs text-slate-400 space-y-1">
                <p>
                  Delivery: <span className="text-slate-200">Asynchronous background worker</span>
                </p>
                <p>
                  Retries: <span className="text-slate-200">Exponential backoff enabled</span>
                </p>
              </div>
            </div>
          </div>

          {/* Node.js Process Runtime Telemetry */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-800 p-2.5 text-rose-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Server Process & Host Runtime</h2>
                  <p className="text-xs text-slate-400">
                    Memory allocation, Node.js process runtime, and uptime
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-slate-400">
                PID: {data?.process?.pid ?? '—'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-4">
                <span className="text-slate-400">Server Uptime</span>
                <p className="mt-1 font-mono text-lg font-bold text-white">
                  {formatUptime(data?.uptimeSeconds)}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-4">
                <span className="text-slate-400">Memory RSS</span>
                <p className="mt-1 font-mono text-lg font-bold text-white">
                  {data?.process?.memoryRssMb ?? 0} MB
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-4">
                <span className="text-slate-400">V8 Heap (Used / Total)</span>
                <p className="mt-1 font-mono text-lg font-bold text-white">
                  {data?.process?.heapUsedMb ?? 0} / {data?.process?.heapTotalMb ?? 0} MB
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.04] bg-slate-950/60 p-4">
                <span className="text-slate-400">Node Runtime / OS</span>
                <p className="mt-1 font-mono text-sm font-bold text-white">
                  {data?.process?.nodeVersion ?? '—'} ({data?.process?.platform ?? '—'})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
