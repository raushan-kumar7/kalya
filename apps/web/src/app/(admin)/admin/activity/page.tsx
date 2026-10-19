'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import type { AuditLog, AuditSeverity, BaseAuditSeverity, BaseAuditStatus } from '@kalya/types';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function AdminActivityPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<BaseAuditSeverity | ''>('');
  const [statusFilter, setStatusFilter] = useState<BaseAuditStatus | ''>('');
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [
      'admin',
      'activities',
      { page, search, severity: severityFilter, status: statusFilter },
    ],
    queryFn: () =>
      AdminService.getActivities({
        page,
        limit: 20,
        search: search.trim() || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
            <AlertCircle className="h-3 w-3" /> {severity}
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
            <AlertTriangle className="h-3 w-3" /> {severity}
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
            <Info className="h-3 w-3" /> {severity}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="h-6 w-6 text-rose-500" />
            Platform Activity & Audit Trail
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Immutable timeline of platform events, security mutations, user logins, and
            administrative actions.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing…' : 'Refresh Events'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, description, or actor email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value as BaseAuditSeverity | '');
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as BaseAuditStatus | '');
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
          >
            <option value="">All Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="ATTEMPT">ATTEMPT</option>
          </select>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl divide-y divide-white/[0.06]">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent mx-auto mb-2" />
            Loading audit timeline…
          </div>
        ) : !data?.logs || data.logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit log entries found matching criteria.
          </div>
        ) : (
          data.logs.map((log: AuditLog) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="p-5 hover:bg-white/[0.02] transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getSeverityBadge(log.severity)}
                    <span className="font-mono text-xs font-bold text-white">{log.action}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {log.entityType}
                    </span>
                    {log.status !== 'SUCCESS' && (
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                        {log.status}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-300">{log.description}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-4">
                    <span>
                      Actor:{' '}
                      <strong className="text-slate-400">
                        {log.actorEmail
                          ? `${log.actorEmail} [${log.actorRole || 'USER'}]`
                          : 'System Task'}
                      </strong>
                    </span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  </div>

                  {log.metadata && (
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="inline-flex items-center gap-1 font-semibold text-rose-400 hover:text-rose-300 transition"
                    >
                      {isExpanded ? (
                        <>
                          Hide Payload <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expandable JSON Metadata */}
                {isExpanded && log.metadata && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    <pre className="text-slate-300">{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination Footer */}
        {data?.meta && (
          <div className="flex items-center justify-between px-5 py-3.5 text-xs text-slate-400 bg-slate-950/40">
            <span>
              Showing {data.logs.length} of {data.meta.total} audit events
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.meta.hasPrev}
                className="rounded-lg border border-white/10 px-3 py-1 text-slate-300 disabled:opacity-30 hover:bg-white/5"
              >
                Previous
              </button>
              <span className="font-mono text-slate-300">
                Page {data.meta.currentPage} of {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.meta.hasNext}
                className="rounded-lg border border-white/10 px-3 py-1 text-slate-300 disabled:opacity-30 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
