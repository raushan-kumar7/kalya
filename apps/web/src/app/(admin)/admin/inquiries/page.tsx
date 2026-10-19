'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import type {
  ContactInquiryPriority,
  ContactInquiryStatus,
  ContactInquiryTopic,
} from '@kalya/types';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  HelpCircle,
  Inbox,
  Lightbulb,
  Lock,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/overlays/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { toast } from '@/components/ui/feedback';
import { EmptyState } from '@/components/ui/states/empty-state';
import { Skeleton } from '@/components/ui/states/skeleton';
import { cn } from '@/libs/utils';

export default function AdminInquiriesPage() {
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactInquiryStatus | ''>('');
  const [topicFilter, setTopicFilter] = useState<ContactInquiryTopic | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ContactInquiryPriority | ''>('');
  const [page, setPage] = useState(1);

  // Inspector Drawer State
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyType, setReplyType] = useState<'PUBLIC_REPLY' | 'INTERNAL_NOTE'>('PUBLIC_REPLY');
  const [replyMessage, setReplyMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Fetch Inquiries List
  const {
    data: inquiriesData,
    isLoading: isInquiriesLoading,
    refetch: refetchInquiries,
  } = useQuery({
    queryKey: [
      'admin',
      'inquiries',
      { page, search, status: statusFilter, topic: topicFilter, priority: priorityFilter },
    ],
    queryFn: () =>
      AdminService.getInquiries({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        topic: topicFilter || undefined,
        priority: priorityFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  // 2. Fetch KPI Stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'inquiry-stats'],
    queryFn: () => AdminService.getInquiryStats(),
    refetchInterval: 15000,
  });

  // 3. Fetch Single Inspected Inquiry Details
  const {
    data: inspectedInquiry,
    isLoading: isInspectingLoading,
    refetch: refetchInspected,
  } = useQuery({
    queryKey: ['admin', 'inquiry-detail', selectedInquiryId],
    queryFn: () => (selectedInquiryId ? AdminService.getInquiry(selectedInquiryId) : null),
    enabled: Boolean(selectedInquiryId),
  });

  // Mutation: Update Status
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactInquiryStatus }) =>
      AdminService.updateInquiryStatus(id, status),
    onSuccess: (updated) => {
      toast.success(`Inquiry status updated to ${updated.status}`);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inquiry-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inquiry-detail', updated.id] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update status');
    },
  });

  // Mutation: Add Reply or Note
  const replyMutation = useMutation({
    mutationFn: ({
      id,
      message,
      type,
    }: {
      id: string;
      message: string;
      type: 'PUBLIC_REPLY' | 'INTERNAL_NOTE';
    }) => AdminService.addInquiryReply(id, { message, type }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.type === 'PUBLIC_REPLY'
          ? 'Response email sent to visitor successfully'
          : 'Internal note added to thread'
      );
      setReplyMessage('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inquiry-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inquiry-detail', variables.id] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to record response');
    },
  });

  // Manual Refresh Handler with 600ms minimum spin
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refetchInquiries(),
        refetchStats(),
        selectedInquiryId ? refetchInspected() : Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      toast.success('Inquiries updated');
    } catch {
      toast.error('Failed to refresh inquiries');
    } finally {
      setIsRefreshing(false);
    }
  };

  // CSV Export Handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const allInquiries = await AdminService.exportInquiries();
      if (!allInquiries || allInquiries.length === 0) {
        toast.error('No inquiries available to export');
        return;
      }

      const headers = [
        'ID',
        'Reference Number',
        'Name',
        'Email',
        'Topic',
        'Status',
        'Priority',
        'SLA Due Date',
        'Created At',
        'Resolved At',
        'Message',
      ];

      const csvRows = [
        headers.join(','),
        ...allInquiries.map((inq) =>
          [
            `"${inq.id}"`,
            `"KAL-${inq.id.slice(0, 6).toUpperCase()}"`,
            `"${(inq.name || '').replace(/"/g, '""')}"`,
            `"${inq.email}"`,
            `"${inq.topic}"`,
            `"${inq.status}"`,
            `"${inq.priority}"`,
            `"${inq.slaDueDate}"`,
            `"${inq.createdAt}"`,
            `"${inq.resolvedAt || ''}"`,
            `"${(inq.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          ].join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `kalya_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allInquiries.length} inquiries to CSV`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export inquiries');
    } finally {
      setIsExporting(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: ContactInquiryStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <Badge variant="subtle" dot dotColor="primary" className="text-[11px] font-semibold">
            New
          </Badge>
        );
      case 'IN_REVIEW':
        return (
          <Badge
            variant="subtle"
            dot
            dotColor="warning"
            className="text-[11px] font-semibold text-warning"
          >
            In Review
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge
            variant="subtle"
            dot
            dotColor="success"
            className="text-[11px] font-semibold text-success"
          >
            Resolved
          </Badge>
        );
      case 'SPAM':
        return (
          <Badge
            variant="subtle"
            dot
            dotColor="danger"
            className="text-[11px] font-semibold text-danger"
          >
            Spam
          </Badge>
        );
      case 'ARCHIVED':
        return (
          <Badge variant="subtle" className="text-[11px] font-semibold text-text-muted">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="subtle">{status}</Badge>;
    }
  };

  // Priority Badge Helper
  const getPriorityBadge = (priority: ContactInquiryPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-danger px-2 py-0.5 rounded-full bg-danger-subtle border border-danger/30">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning px-2 py-0.5 rounded-full bg-warning-subtle border border-warning/30">
            High
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-text-secondary px-2 py-0.5 rounded-full bg-surface-raised border border-border">
            Normal
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-text-muted px-2 py-0.5 rounded-full bg-surface-raised/50 border border-border/60">
            Low
          </span>
        );
    }
  };

  // Topic Icon & Label Helper
  const getTopicMeta = (topic: ContactInquiryTopic) => {
    switch (topic) {
      case 'Privacy request':
        return {
          icon: ShieldAlert,
          label: 'Privacy Request',
          color: 'text-accent bg-accent-subtle border-accent/20',
        };
      case 'Report a problem':
        return {
          icon: Wrench,
          label: 'Problem Report',
          color: 'text-danger bg-danger-subtle border-danger/20',
        };
      case 'Feedback or idea':
        return {
          icon: Lightbulb,
          label: 'Feedback / Idea',
          color: 'text-warning bg-warning-subtle border-warning/20',
        };
      case 'Question':
        return {
          icon: HelpCircle,
          label: 'Question',
          color: 'text-primary bg-primary-subtle border-primary/20',
        };
      default:
        return {
          icon: Inbox,
          label: topic,
          color: 'text-text-secondary bg-surface-raised border-border',
        };
    }
  };

  // SLA Remaining Calculation Helper
  const formatSlaRemaining = (slaDueDate: string, status: ContactInquiryStatus) => {
    if (status === 'RESOLVED' || status === 'ARCHIVED') {
      return (
        <span className="inline-flex items-center gap-1 text-caption text-success font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      );
    }

    const due = new Date(slaDueDate).getTime();
    const now = Date.now();
    const diffHours = Math.round((due - now) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-caption font-bold text-danger font-numeric">
          <Clock className="h-3.5 w-3.5" />
          Breached ({Math.abs(diffHours)}h ago)
        </span>
      );
    }

    if (diffHours <= 12) {
      return (
        <span className="inline-flex items-center gap-1 text-caption font-bold text-warning font-numeric">
          <Clock className="h-3.5 w-3.5" />
          {diffHours}h left (At Risk)
        </span>
      );
    }

    if (diffHours <= 48) {
      return (
        <span className="inline-flex items-center gap-1 text-caption text-text-secondary font-medium font-numeric">
          <Clock className="h-3.5 w-3.5 text-text-muted" />
          {diffHours}h left
        </span>
      );
    }

    const days = Math.round(diffHours / 24);
    return (
      <span className="inline-flex items-center gap-1 text-caption text-text-muted font-numeric">
        <Clock className="h-3.5 w-3.5" />
        {days}d left
      </span>
    );
  };

  const inquiries = inquiriesData?.inquiries ?? [];
  const meta = inquiriesData?.meta;

  return (
    <div className="space-y-8">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-heading-md font-bold text-text-primary tracking-tight">
              Inquiries & Customer Support
            </h1>
            <Badge variant="subtle" size="sm" className="font-numeric text-[11px]">
              DPDP 2023 SLA
            </Badge>
          </div>
          <p className="text-body-sm text-text-secondary">
            Review incoming public contact inquiries, statutory privacy data requests, and compose
            direct email replies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card className="border-border bg-surface shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">Total Inquiries</span>
              <MessageSquare className="h-4 w-4 text-text-muted" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-numeric">
                {stats?.total ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">New / Unread</span>
              <span className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-primary font-numeric">
                {stats?.new ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">In Review</span>
              <span className="h-2 w-2 rounded-full bg-warning" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-warning font-numeric">
                {stats?.inReview ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">Resolved</span>
              <span className="h-2 w-2 rounded-full bg-success" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-success font-numeric">
                {stats?.resolved ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-2xs col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-secondary">Privacy Requests</span>
              <ShieldAlert className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-accent font-numeric">
                {stats?.privacyRequests ?? 0}
              </span>
              {Boolean(stats?.slaAtRisk && stats.slaAtRisk > 0) && (
                <span className="text-[11px] font-semibold text-danger">
                  ({stats?.slaAtRisk} at risk)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter Toolbar with Segmented Status Pills & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Status Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-raised p-1 overflow-x-auto no-scrollbar">
            {[
              { id: '', label: 'All', count: stats?.total },
              { id: 'NEW', label: 'New', count: stats?.new },
              { id: 'IN_REVIEW', label: 'In Review', count: stats?.inReview },
              { id: 'RESOLVED', label: 'Resolved', count: stats?.resolved },
              { id: 'SPAM', label: 'Spam' },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as ContactInquiryStatus | '');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-lg px-3 py-1 text-caption font-medium transition-all whitespace-nowrap cursor-pointer select-none',
                    isSelected
                      ? 'bg-surface text-text-primary shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && (
                    <span className="ml-1.5 font-numeric text-[11px] opacity-80">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2.5">
            {/* Topic Filter */}
            <Select
              value={topicFilter || 'ALL_TOPICS'}
              onValueChange={(val) => {
                setTopicFilter(val === 'ALL_TOPICS' ? '' : (val as ContactInquiryTopic));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 h-9 text-caption">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TOPICS">All Topics</SelectItem>
                <SelectItem value="Question">Question</SelectItem>
                <SelectItem value="Feedback or idea">Feedback or idea</SelectItem>
                <SelectItem value="Report a problem">Report a problem</SelectItem>
                <SelectItem value="Privacy request">Privacy request</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={priorityFilter || 'ALL_PRIORITIES'}
              onValueChange={(val) => {
                setPriorityFilter(val === 'ALL_PRIORITIES' ? '' : (val as ContactInquiryPriority));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 h-9 text-caption">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_PRIORITIES">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <Input
            placeholder="Search by sender name, email, or message keyword…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9.5 h-10 w-full bg-surface"
          />
        </div>
      </div>

      {/* 4. Interactive Inquiries Data Table */}
      <Card className="border-border bg-surface shadow-card overflow-hidden">
        {isInquiriesLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-6 h-6 text-text-muted" />}
            title="No inquiries found"
            description="No customer inquiries match your current status or filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-20">Priority</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="max-w-md">Message Preview</TableHead>
                  <TableHead className="w-36">SLA Countdown</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => {
                  const topicMeta = getTopicMeta(inq.topic);
                  const TopicIcon = topicMeta.icon;

                  return (
                    <TableRow
                      key={inq.id}
                      className="cursor-pointer hover:bg-surface-raised/60 transition-colors"
                      onClick={() => setSelectedInquiryId(inq.id)}
                    >
                      <TableCell>{getStatusBadge(inq.status)}</TableCell>
                      <TableCell>{getPriorityBadge(inq.priority)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-body-sm font-semibold text-text-primary">
                            {inq.name}
                          </span>
                          <span className="text-caption text-text-muted font-numeric">
                            {inq.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-lg border text-caption shrink-0',
                              topicMeta.color
                            )}
                          >
                            <TopicIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-body-sm text-text-secondary whitespace-nowrap">
                            {topicMeta.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-body-sm text-text-secondary truncate max-w-sm">
                          {inq.message}
                        </p>
                      </TableCell>
                      <TableCell>{formatSlaRemaining(inq.slaDueDate, inq.status)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInquiryId(inq.id)}
                          leadingIcon={<Eye className="h-3.5 w-3.5 text-text-muted" />}
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
            <span className="text-caption text-text-secondary font-numeric">
              Showing page <strong>{meta.currentPage}</strong> of <strong>{meta.totalPages}</strong>{' '}
              ({meta.total} records)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.currentPage <= 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.currentPage >= meta.totalPages}
                trailingIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Slide-Over Inspection Drawer */}
      <Drawer
        open={Boolean(selectedInquiryId)}
        onOpenChange={(open) => !open && setSelectedInquiryId(null)}
      >
        <DrawerContent
          side="right"
          size="xl"
          className="w-full sm:max-w-xl flex flex-col h-full bg-surface border-l border-border"
        >
          {isInspectingLoading || !inspectedInquiry ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              {/* Drawer Header */}
              <DrawerHeader className="border-b border-border/80 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary font-numeric px-2 py-0.5 rounded bg-primary-subtle border border-primary/20">
                        KAL-{inspectedInquiry.id.slice(0, 6).toUpperCase()}
                      </span>
                      {getStatusBadge(inspectedInquiry.status)}
                      {getPriorityBadge(inspectedInquiry.priority)}
                    </div>
                    <DrawerTitle className="font-display text-xl font-bold text-text-primary">
                      {inspectedInquiry.name}
                    </DrawerTitle>
                    <DrawerDescription className="text-caption text-text-muted font-numeric">
                      Submitted on {new Date(inspectedInquiry.createdAt).toLocaleString()}
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm">
                      &times;
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* SLA Notice Box */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised p-3.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <span className="text-caption text-text-secondary">SLA Target Due:</span>
                  </div>
                  <span className="text-caption font-semibold font-numeric">
                    {new Date(inspectedInquiry.slaDueDate).toLocaleString()}
                  </span>
                </div>

                {/* Sender Metadata Details */}
                <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-4 space-y-2.5">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                    Visitor Telemetry & Profile
                  </span>
                  <div className="grid grid-cols-2 gap-3 pt-1 text-body-sm">
                    <div>
                      <span className="text-caption text-text-muted block">Email</span>
                      <a
                        href={`mailto:${inspectedInquiry.email}`}
                        className="font-medium text-primary hover:underline font-numeric"
                      >
                        {inspectedInquiry.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-caption text-text-muted block">Topic</span>
                      <span className="font-medium text-text-primary">
                        {inspectedInquiry.topic}
                      </span>
                    </div>
                    <div>
                      <span className="text-caption text-text-muted block">IP Address</span>
                      <span className="font-mono text-caption text-text-secondary">
                        {inspectedInquiry.ipAddress || 'Unavailable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-caption text-text-muted block">Registered User</span>
                      <span className="text-caption text-text-secondary font-numeric">
                        {inspectedInquiry.userId ? 'Yes (Linked Account)' : 'No (Guest Visitor)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inquiry Message Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                      Original Message Body
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(inspectedInquiry.message);
                        toast.success('Message copied to clipboard');
                      }}
                      leadingIcon={<Copy className="h-3 w-3" />}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-raised p-4 font-body text-body-sm text-text-primary whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {inspectedInquiry.message}
                  </div>
                </div>

                {/* Conversation Thread & Internal Notes */}
                <div className="space-y-3">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                    Thread Activity & Notes ({inspectedInquiry.replies?.length ?? 0})
                  </span>

                  {!inspectedInquiry.replies || inspectedInquiry.replies.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-caption text-text-muted">
                      No staff responses or internal notes recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inspectedInquiry.replies.map((reply) => {
                        const isPublic = reply.type === 'PUBLIC_REPLY';
                        return (
                          <div
                            key={reply.id}
                            className={cn(
                              'rounded-xl border p-4 space-y-1.5 shadow-2xs',
                              isPublic
                                ? 'border-primary/30 bg-primary-subtle/30'
                                : 'border-warning/30 bg-warning-subtle/30'
                            )}
                          >
                            <div className="flex items-center justify-between text-caption">
                              <span className="font-bold text-text-primary">
                                {reply.senderName}{' '}
                                <span className="font-normal text-text-muted font-numeric">
                                  ({reply.senderEmail})
                                </span>
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                                  isPublic
                                    ? 'border-primary/30 text-primary bg-primary-subtle'
                                    : 'border-warning/30 text-warning bg-warning-subtle'
                                )}
                              >
                                {isPublic ? 'Public Reply' : 'Internal Note'}
                              </span>
                            </div>
                            <p className="text-body-sm text-text-primary whitespace-pre-wrap">
                              {reply.message}
                            </p>
                            <span className="text-[11px] text-text-muted block pt-1 font-numeric">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status Transition Quick Bar */}
                <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-2">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-muted block">
                    Update Lifecycle Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={inspectedInquiry.status === 'IN_REVIEW' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({ id: inspectedInquiry.id, status: 'IN_REVIEW' })
                      }
                      disabled={statusMutation.isPending || inspectedInquiry.status === 'IN_REVIEW'}
                    >
                      Mark In Review
                    </Button>
                    <Button
                      variant={inspectedInquiry.status === 'RESOLVED' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({ id: inspectedInquiry.id, status: 'RESOLVED' })
                      }
                      disabled={statusMutation.isPending || inspectedInquiry.status === 'RESOLVED'}
                      leadingIcon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    >
                      Resolve Ticket
                    </Button>
                    <Button
                      variant={inspectedInquiry.status === 'SPAM' ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({ id: inspectedInquiry.id, status: 'SPAM' })
                      }
                      disabled={statusMutation.isPending || inspectedInquiry.status === 'SPAM'}
                    >
                      Mark Spam
                    </Button>
                  </div>
                </div>

                {/* Compose Reply or Internal Note Form */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                      Compose Response
                    </span>
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-0.5">
                      <button
                        type="button"
                        onClick={() => setReplyType('PUBLIC_REPLY')}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                          replyType === 'PUBLIC_REPLY'
                            ? 'bg-surface text-primary shadow-2xs'
                            : 'text-text-muted hover:text-text-secondary'
                        )}
                      >
                        Email Visitor
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyType('INTERNAL_NOTE')}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                          replyType === 'INTERNAL_NOTE'
                            ? 'bg-surface text-warning shadow-2xs'
                            : 'text-text-muted hover:text-text-secondary'
                        )}
                      >
                        Internal Note
                      </button>
                    </div>
                  </div>

                  <Textarea
                    placeholder={
                      replyType === 'PUBLIC_REPLY'
                        ? `Write an official response to ${inspectedInquiry.email}…`
                        : 'Write a private note for other administrators…'
                    }
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-caption text-text-muted">
                      {replyType === 'PUBLIC_REPLY' ? (
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          Will be sent directly to {inspectedInquiry.email}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-text-muted">
                          <Lock className="h-3.5 w-3.5 text-warning" />
                          Visible only to administrators
                        </span>
                      )}
                    </span>

                    <Button
                      variant={replyType === 'PUBLIC_REPLY' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        if (!replyMessage.trim()) {
                          toast.error('Please enter a message before sending');
                          return;
                        }
                        replyMutation.mutate({
                          id: inspectedInquiry.id,
                          message: replyMessage.trim(),
                          type: replyType,
                        });
                      }}
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                      isLoading={replyMutation.isPending}
                      trailingIcon={<Send className="h-3.5 w-3.5" />}
                    >
                      {replyType === 'PUBLIC_REPLY' ? 'Send Email Reply' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <DrawerFooter className="border-t border-border/80 pt-3">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Close Inspector
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
