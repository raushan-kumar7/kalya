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
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Info,
  RefreshCw,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { EmptyState } from '@/components/ui/states/empty-state';
import { cn } from '@/libs/utils';

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
          <Badge
            variant="danger"
            size="sm"
            leadingIcon={<AlertCircle className="h-3 w-3" />}
            className="font-numeric uppercase"
          >
            {severity}
          </Badge>
        );
      case 'WARN':
        return (
          <Badge
            variant="warning"
            size="sm"
            leadingIcon={<AlertTriangle className="h-3 w-3" />}
            className="font-numeric uppercase"
          >
            {severity}
          </Badge>
        );
      case 'INFO':
      default:
        return (
          <Badge
            variant="secondary"
            size="sm"
            leadingIcon={<Info className="h-3 w-3" />}
            className="font-numeric uppercase"
          >
            {severity}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-md font-display font-bold tracking-tight text-text-primary flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            Platform Activity & Audit Trail
          </h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            Immutable timeline of platform events, security mutations, user logins, and
            administrative actions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />}
        >
          {isRefetching ? 'Refreshing…' : 'Refresh Events'}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="w-full md:w-96">
            <Input
              size="sm"
              placeholder="Search action, description, or actor email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
            />
          </div>

          {/* Segmented Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 shadow-xs">
              {[
                { id: '', label: 'All Severities' },
                { id: 'INFO', label: 'Info' },
                { id: 'WARN', label: 'Warn' },
                { id: 'ERROR', label: 'Error' },
                { id: 'CRITICAL', label: 'Critical' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSeverityFilter(tab.id as BaseAuditSeverity | '');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-md px-3 py-1 text-caption font-medium transition-colors whitespace-nowrap',
                    severityFilter === tab.id
                      ? 'bg-surface text-text-primary shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Outcome Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 shadow-xs">
              {[
                { id: '', label: 'All' },
                { id: 'SUCCESS', label: 'Success' },
                { id: 'FAILURE', label: 'Failure' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as BaseAuditStatus | '');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-md px-3 py-1 text-caption font-medium transition-colors whitespace-nowrap',
                    statusFilter === tab.id
                      ? 'bg-surface text-text-primary shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Stream */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {isLoading ? (
              <div className="py-20 text-center text-caption text-text-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
                Loading audit timeline…
              </div>
            ) : !data?.logs || data.logs.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="No audit events found"
                  description="No audit log entries found matching criteria."
                  icon={<Activity className="h-6 w-6 text-text-muted" />}
                />
              </div>
            ) : (
              data.logs.map((log: AuditLog) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="p-5 hover:bg-surface-raised/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getSeverityBadge(log.severity)}
                        <span className="font-numeric text-caption font-bold text-text-primary">
                          {log.action}
                        </span>
                        <Badge variant="subtle" size="sm" className="font-numeric text-[10px]">
                          {log.entityType}
                        </Badge>
                        {log.status !== 'SUCCESS' && (
                          <Badge variant="danger" size="sm" className="font-numeric text-[10px]">
                            {log.status}
                          </Badge>
                        )}
                      </div>
                      <span className="font-numeric text-[11px] text-text-muted">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-caption text-text-secondary">{log.description}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-text-muted gap-2">
                      <div className="flex items-center gap-4">
                        <span>
                          Actor:{' '}
                          <strong className="text-text-primary font-numeric font-semibold">
                            {log.actorEmail
                              ? `${log.actorEmail} [${log.actorRole || 'USER'}]`
                              : 'System Task'}
                          </strong>
                        </span>
                        {log.ipAddress && <span className="font-numeric">IP: {log.ipAddress}</span>}
                      </div>

                      {log.metadata && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => toggleExpand(log.id)}
                          className="h-7 px-2 font-semibold text-primary hover:text-primary-hover hover:bg-primary-subtle gap-1"
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
                        </Button>
                      )}
                    </div>

                    {/* Expandable JSON Metadata */}
                    {isExpanded && log.metadata && (
                      <div className="mt-4 rounded-xl border border-border bg-surface-raised p-4 text-[11px] font-numeric text-text-secondary overflow-x-auto">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Footer */}
          {data?.meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
              <span className="text-caption text-text-secondary font-numeric">
                Showing {data.logs.length} of {data.meta.total} audit events
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.meta.hasPrev}
                  leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Previous
                </Button>
                <span className="px-3 text-caption font-numeric text-text-primary">
                  Page {data.meta.currentPage} of {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.meta.hasNext}
                  rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
