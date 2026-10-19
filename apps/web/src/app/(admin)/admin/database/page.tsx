'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import type { DbBackupInfo, DbColumnDefinition, DbTableSummary } from '@kalya/types';
import { cn } from '@/libs/utils';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Database,
  Download,
  FileCode,
  HardDrive,
  Info,
  KeyRound,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Table2,
  Terminal,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import { Tabs, TabsContent } from '@/components/ui/navigation/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/overlays/drawer';
import { Skeleton } from '@/components/ui/states/skeleton';
import { EmptyState } from '@/components/ui/states/empty-state';
import { toast } from '@/components/ui/feedback';

type TableCategory = 'all' | 'auth' | 'finance' | 'system';

const AUTH_TABLES = new Set(['user', 'account', 'session', 'verification']);
const SYSTEM_TABLES = new Set([
  '__drizzle_migrations',
  'audit_logs',
  'job_queue',
  'alert',
  'notification',
  'push_subscription',
]);

function getTableCategory(tableName: string): 'auth' | 'finance' | 'system' {
  if (AUTH_TABLES.has(tableName)) return 'auth';
  if (SYSTEM_TABLES.has(tableName)) return 'system';
  return 'finance';
}

function getTableIcon(tableName: string) {
  const cat = getTableCategory(tableName);
  if (cat === 'auth') return Users;
  if (cat === 'system') return Terminal;
  return Coins;
}

export default function AdminDatabasePage() {
  const queryClient = useQueryClient();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'studio' | 'backups'>('studio');

  // Studio Table & Category Filter State
  const [selectedTable, setSelectedTable] = useState<string>('user');
  const [sidebarCategory, setSidebarCategory] = useState<TableCategory>('all');
  const [viewMode, setViewMode] = useState<'data' | 'schema'>('data');
  const [tableSearch, setTableSearch] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortCol, setSortCol] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Feedback & Copy State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspected Record (Drawer)
  const [inspectedRecord, setInspectedRecord] = useState<Record<string, unknown> | null>(null);
  const [inspectedFieldSearch, setInspectedFieldSearch] = useState('');

  // Backup & Restore State
  const [restoreModalBackup, setRestoreModalBackup] = useState<DbBackupInfo | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [deleteModalBackup, setDeleteModalBackup] = useState<DbBackupInfo | null>(null);
  const [downloadingBackup, setDownloadingBackup] = useState<string | null>(null);

  // Manual Refresh Indicators
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [isRefreshingTableData, setIsRefreshingTableData] = useState(false);
  const [isRefreshingBackupsList, setIsRefreshingBackupsList] = useState(false);

  // 1. Fetch Tables
  const {
    data: tables = [],
    isLoading: isTablesLoading,
    refetch: refetchTables,
  } = useQuery<DbTableSummary[]>({
    queryKey: ['admin', 'db-tables'],
    queryFn: () => AdminService.getDbTables(),
  });

  // Auto-sync selected table when tables load
  useEffect(() => {
    if (tables.length > 0) {
      const exists = tables.some((t) => t.name === selectedTable);
      if (!exists) {
        // Find 'user' table first, or first table with records, or first table
        const fallback =
          tables.find((t) => t.name === 'user') || tables.find((t) => t.rowCount > 0) || tables[0];
        if (fallback) {
          setSelectedTable(fallback.name);
        }
      }
    }
  }, [tables, selectedTable]);

  // 2. Fetch Schema for Selected Table
  const { data: schema = [], isLoading: isSchemaLoading } = useQuery<DbColumnDefinition[]>({
    queryKey: ['admin', 'db-schema', selectedTable],
    queryFn: () => AdminService.getDbTableSchema(selectedTable),
    enabled: Boolean(selectedTable),
  });

  // 3. Fetch Records for Selected Table
  const {
    data: recordsResult,
    isLoading: isRecordsLoading,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: [
      'admin',
      'db-records',
      selectedTable,
      { page, limit, search: recordSearch, sort: sortCol, order: sortOrder },
    ],
    queryFn: () =>
      AdminService.getDbTableRecords(selectedTable, {
        page,
        limit,
        search: recordSearch.trim() || undefined,
        sortBy: sortCol,
        sortOrder,
      }),
    enabled: Boolean(selectedTable),
  });

  // 4. Fetch Backups
  const {
    data: backups = [],
    isLoading: isBackupsLoading,
    refetch: refetchBackups,
  } = useQuery<DbBackupInfo[]>({
    queryKey: ['admin', 'db-backups'],
    queryFn: () => AdminService.getBackups(),
  });

  // 5. Create Backup Mutation
  const createBackupMutation = useMutation({
    mutationFn: () => AdminService.createBackup(),
    onSuccess: (newBackup) => {
      toast.success(`Hot snapshot created: ${newBackup.filename} (${newBackup.sizeFormatted})`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'db-backups'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create backup snapshot');
    },
  });

  // 6. Restore Backup Mutation
  const restoreBackupMutation = useMutation({
    mutationFn: (filename: string) => AdminService.restoreBackup(filename),
    onSuccess: (res) => {
      toast.success(
        `Database successfully restored! (Pre-restore snapshot: ${res.preRestoreBackup || 'captured'})`
      );
      setRestoreModalBackup(null);
      setRestoreConfirmText('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'db-backups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'db-tables'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'db-records'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Restore operation failed');
    },
  });

  // 7. Delete Backup Mutation
  const deleteBackupMutation = useMutation({
    mutationFn: (filename: string) => AdminService.deleteBackup(filename),
    onSuccess: () => {
      toast.success('Backup snapshot deleted');
      setDeleteModalBackup(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'db-backups'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete snapshot');
    },
  });

  // 8. Upload Backup Mutation
  const uploadBackupMutation = useMutation({
    mutationFn: (file: File) => AdminService.uploadBackup(file),
    onSuccess: (info) => {
      toast.success(`Snapshot uploaded: ${info.filename} (${info.sizeFormatted})`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'db-backups'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Snapshot upload failed');
    },
  });

  // Programmatic Authenticated Backup Download Handler
  const handleDownloadBackup = async (filename: string) => {
    try {
      setDownloadingBackup(filename);
      await AdminService.downloadBackup(filename);
      toast.success(`Backup snapshot "${filename}" downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download backup snapshot');
    } finally {
      setDownloadingBackup(null);
    }
  };

  // Dedicated Refresh Handlers with Guaranteed Spin Animation & Feedback
  const handleRefreshAll = async () => {
    try {
      setIsRefreshingAll(true);
      await Promise.all([
        refetchTables(),
        refetchRecords(),
        refetchBackups(),
        queryClient.invalidateQueries({ queryKey: ['admin', 'db-schema', selectedTable] }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      toast.success('Database explorer & backups refreshed');
    } catch {
      toast.error('Failed to refresh database state');
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const handleRefreshTableData = async () => {
    try {
      setIsRefreshingTableData(true);
      await Promise.all([
        refetchRecords(),
        queryClient.invalidateQueries({ queryKey: ['admin', 'db-schema', selectedTable] }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      toast.success(`Table "${selectedTable}" data refreshed`);
    } catch {
      toast.error(`Failed to refresh table "${selectedTable}"`);
    } finally {
      setIsRefreshingTableData(false);
    }
  };

  const handleRefreshBackups = async () => {
    try {
      setIsRefreshingBackupsList(true);
      await Promise.all([refetchBackups(), new Promise((resolve) => setTimeout(resolve, 600))]);
      toast.success('Backup snapshots refreshed');
    } catch {
      toast.error('Failed to refresh backups');
    } finally {
      setIsRefreshingBackupsList(false);
    }
  };

  // Category counts
  const authTablesCount = useMemo(
    () => tables.filter((t) => getTableCategory(t.name) === 'auth').length,
    [tables]
  );
  const financeTablesCount = useMemo(
    () => tables.filter((t) => getTableCategory(t.name) === 'finance').length,
    [tables]
  );
  const systemTablesCount = useMemo(
    () => tables.filter((t) => getTableCategory(t.name) === 'system').length,
    [tables]
  );

  // Filter Tables
  const filteredTables = useMemo(() => {
    return tables.filter((t: DbTableSummary) => {
      const matchesSearch = t.name.toLowerCase().includes(tableSearch.toLowerCase().trim());
      if (!matchesSearch) return false;
      if (sidebarCategory === 'all') return true;
      return getTableCategory(t.name) === sidebarCategory;
    });
  }, [tables, tableSearch, sidebarCategory]);

  // Sorting Handler
  const handleSort = (columnName: string) => {
    if (sortCol === columnName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(columnName);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Copy with Visual Feedback
  const copyToClipboard = (text: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
    toast.success('Copied to clipboard');
  };

  // Export Table Data
  const exportData = (format: 'json' | 'csv') => {
    if (!recordsResult || recordsResult.records.length === 0) {
      toast.error('No records to export');
      return;
    }
    const filename = `${selectedTable}_export_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(recordsResult.records, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${filename}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Exported ${recordsResult.records.length} records to JSON`);
    } else {
      const headers = Object.keys(recordsResult.records[0]);
      const csvRows = [
        headers.join(','),
        ...recordsResult.records.map((row: Record<string, unknown>) =>
          headers
            .map((h) => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
              return `"${strVal.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ];
      const csvStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvStr);
      downloadAnchor.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Exported ${recordsResult.records.length} records to CSV`);
    }
  };

  // Selected Table Summary Object
  const currentTableSummary = useMemo(
    () => tables.find((t) => t.name === selectedTable),
    [tables, selectedTable]
  );

  const totalRows = recordsResult?.meta?.total ?? currentTableSummary?.rowCount ?? 0;
  const currentColumns =
    schema.length > 0
      ? schema.map((s) => s.name)
      : recordsResult?.records.length
        ? Object.keys(recordsResult.records[0])
        : [];

  const totalPages = Math.ceil(totalRows / limit) || 1;

  // Filtered fields in Record Inspector Drawer
  const inspectedEntries = useMemo(() => {
    if (!inspectedRecord) return [];
    const entries = Object.entries(inspectedRecord);
    if (!inspectedFieldSearch.trim()) return entries;
    const q = inspectedFieldSearch.toLowerCase();
    return entries.filter(
      ([k, v]) =>
        k.toLowerCase().includes(q) ||
        (v !== null && v !== undefined && String(v).toLowerCase().includes(q))
    );
  }, [inspectedRecord, inspectedFieldSearch]);

  // Disaster Recovery Metrics
  const totalBackupSizeBytes = useMemo(
    () => backups.reduce((acc, b) => acc + (b.sizeBytes || 0), 0),
    [backups]
  );

  const formattedTotalBackupSize = useMemo(() => {
    if (totalBackupSizeBytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = totalBackupSizeBytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, [totalBackupSizeBytes]);

  const latestBackup = backups.length > 0 ? backups[0] : null;

  return (
    <div className="space-y-6">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-md font-display font-bold tracking-tight text-text-primary">
              Database Studio & Disaster Recovery
            </h1>
            <Badge variant="subtle" size="sm" dot dotColor="primary" className="font-numeric">
              WAL MODE
            </Badge>
          </div>
          <p className="mt-1 text-body-sm text-text-secondary">
            Inspect live SQLite schema & data, run zero-data-loss pre-deployment backups, and
            perform emergency restorations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshingAll}
            leftIcon={
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingAll ? 'animate-spin' : ''}`} />
            }
          >
            {isRefreshingAll ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'studio' | 'backups')}>
        {/* Main Navigation Tabs */}
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-raised p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-caption font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
              activeTab === 'studio'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
            )}
          >
            <Table2
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                activeTab === 'studio' ? 'text-primary' : 'text-text-muted'
              )}
            />
            <span>Database Studio (Explorer)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backups')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-caption font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
              activeTab === 'backups'
                ? 'bg-surface text-text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
            )}
          >
            <RotateCcw
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                activeTab === 'backups' ? 'text-primary' : 'text-text-muted'
              )}
            />
            <span>Disaster Recovery & Deploy Backups</span>
            {backups.length > 0 && (
              <span
                className={cn(
                  'ml-0.5 rounded-full px-2 py-0.5 font-numeric text-[11px] font-bold transition-colors',
                  activeTab === 'backups'
                    ? 'bg-primary-subtle text-primary'
                    : 'bg-surface text-text-muted border border-border/60'
                )}
              >
                {backups.length}
              </span>
            )}
          </button>
        </div>

        {/* =========================================================================
            TAB 1: DATABASE STUDIO (DRIZZLE / SQLITE EXPLORER)
            ========================================================================= */}
        <TabsContent value="studio" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Tables Directory */}
            <Card className="lg:col-span-3 overflow-hidden shadow-xs border-border">
              <CardHeader className="pb-3 border-b border-border/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <CardTitle className="text-body-md font-display font-semibold">
                      Tables ({tables.length})
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" size="sm" className="font-numeric text-[11px]">
                    SQLite
                  </Badge>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface-raised p-1 mt-2.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all' as const, label: 'All', count: tables.length },
                    { id: 'auth' as const, label: 'Auth', count: authTablesCount },
                    { id: 'finance' as const, label: 'Finance', count: financeTablesCount },
                    { id: 'system' as const, label: 'Ops', count: systemTablesCount },
                  ].map((cat) => {
                    const isCatActive = sidebarCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSidebarCategory(cat.id)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1.5 text-caption font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
                          isCatActive
                            ? 'bg-surface text-text-primary shadow-xs font-semibold'
                            : 'text-text-muted hover:text-text-secondary hover:bg-surface/50'
                        )}
                      >
                        <span className="text-[12px]">{cat.label}</span>
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.2 text-[10px] font-numeric font-semibold transition-colors',
                            isCatActive
                              ? 'bg-primary-subtle text-primary'
                              : 'bg-surface-raised text-text-muted border border-border/50'
                          )}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Table Filter Input */}
                <div className="relative mt-2">
                  <Input
                    size="sm"
                    placeholder="Filter tables…"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
                  />
                  {tableSearch && (
                    <button
                      type="button"
                      onClick={() => setTableSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-[640px] overflow-y-auto divide-y divide-border/50">
                  {isTablesLoading ? (
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ) : filteredTables.length === 0 ? (
                    <div className="p-6 text-center text-caption text-text-muted">
                      No tables found matching filter
                    </div>
                  ) : (
                    filteredTables.map((t: DbTableSummary) => {
                      const isSelected = selectedTable === t.name;
                      const IconComponent = getTableIcon(t.name);
                      return (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => {
                            setSelectedTable(t.name);
                            setPage(1);
                            setSortCol(undefined);
                            setRecordSearch('');
                          }}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors border-l-4',
                            isSelected
                              ? 'bg-primary-subtle/80 text-primary font-semibold border-primary'
                              : 'border-transparent hover:bg-surface-raised text-text-secondary hover:text-text-primary'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <IconComponent
                              className={cn(
                                'h-4 w-4 shrink-0',
                                isSelected ? 'text-primary' : 'text-text-muted'
                              )}
                            />
                            <span className="truncate text-caption font-numeric">{t.name}</span>
                          </div>
                          {t.rowCount > 0 ? (
                            <Badge
                              variant={isSelected ? 'default' : 'subtle'}
                              size="sm"
                              className="font-numeric text-[11px] shrink-0 ml-2"
                            >
                              {t.rowCount.toLocaleString()}
                            </Badge>
                          ) : (
                            <span className="text-[11px] font-numeric text-text-muted/50 shrink-0 ml-2 px-1">
                              0
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="px-3.5 py-2 border-t border-border/80 bg-surface-raised/40 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Showing {filteredTables.length} tables</span>
                  <span className="capitalize">{sidebarCategory}</span>
                </div>
              </CardContent>
            </Card>

            {/* Right Main Area: Unified Studio Workspace */}
            <div className="lg:col-span-9">
              <Card className="shadow-xs border-border overflow-hidden">
                {/* 1. Studio Workspace Header & Primary Controls */}
                <div className="p-4 sm:p-5 border-b border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Table Info & Badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary border border-primary/20">
                      <Table2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-body-lg font-display font-bold text-text-primary">
                          {selectedTable}
                        </h2>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedTable, 'table-name')}
                          title="Copy table name"
                          className="text-text-muted hover:text-text-primary transition-colors p-1"
                        >
                          {copiedKey === 'table-name' ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <Badge variant="subtle" size="sm" className="font-numeric">
                          {totalRows.toLocaleString()} {totalRows === 1 ? 'row' : 'rows'}
                        </Badge>
                        <Badge variant="secondary" size="sm" className="font-numeric">
                          {schema.length} columns
                        </Badge>
                        <Badge variant="outline" size="sm" className="capitalize text-[11px]">
                          {getTableCategory(selectedTable)}
                        </Badge>
                      </div>
                      <p className="text-caption text-text-muted mt-0.5">
                        Inspect schema definitions, raw records, and query SQLite via WAL mode.
                      </p>
                    </div>
                  </div>

                  {/* Top-Right Mode Switcher & Export Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* View Mode Toggle (Data Explorer vs Schema Definitions) */}
                    <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface-raised p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('data')}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-caption font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
                          viewMode === 'data'
                            ? 'bg-surface text-text-primary shadow-xs font-semibold'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                        )}
                      >
                        <Table2
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 transition-colors',
                            viewMode === 'data' ? 'text-primary' : 'text-text-muted'
                          )}
                        />
                        <span>Data Explorer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('schema')}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-caption font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
                          viewMode === 'schema'
                            ? 'bg-surface text-text-primary shadow-xs font-semibold'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                        )}
                      >
                        <FileCode
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 transition-colors',
                            viewMode === 'schema' ? 'text-primary' : 'text-text-muted'
                          )}
                        />
                        <span>Schema</span>
                        <span
                          className={cn(
                            'ml-0.5 rounded-full px-1.5 py-0.2 font-numeric text-[10px] font-bold transition-colors',
                            viewMode === 'schema'
                              ? 'bg-primary-subtle text-primary'
                              : 'bg-surface text-text-muted border border-border/60'
                          )}
                        >
                          {schema.length}
                        </span>
                      </button>
                    </div>

                    {/* Export Dropdown / Buttons */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData('csv')}
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData('json')}
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                    >
                      JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleRefreshTableData}
                      disabled={isRefreshingTableData}
                      title="Refresh current table data"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isRefreshingTableData ? 'animate-spin' : ''}`}
                      />
                    </Button>
                  </div>
                </div>

                {/* 2. Sub-Toolbar: Filter & Limit Bar (Only shown in Data Mode) */}
                {viewMode === 'data' && (
                  <div className="px-4 py-3 border-b border-border bg-surface-raised/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-sm">
                      <Input
                        size="sm"
                        placeholder={`Search in ${selectedTable}…`}
                        value={recordSearch}
                        onChange={(e) => {
                          setRecordSearch(e.target.value);
                          setPage(1);
                        }}
                        leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
                      />
                      {recordSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setRecordSearch('');
                            setPage(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {sortCol && (
                        <div className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary-subtle px-2 py-1 text-[11px] text-primary">
                          <span className="font-numeric">
                            Sorted: {sortCol} ({sortOrder.toUpperCase()})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSortCol(undefined);
                              setSortOrder('desc');
                            }}
                            className="text-primary hover:text-text-primary ml-1"
                            title="Clear sorting"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-caption text-text-secondary">
                        <span className="text-[12px] font-medium text-text-muted">Rows:</span>
                        <Select
                          value={String(limit)}
                          onValueChange={(val) => {
                            setLimit(Number(val));
                            setPage(1);
                          }}
                        >
                          <SelectTrigger size="sm" className="w-[84px] font-numeric">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Main Studio Body */}
                <div className="p-0">
                  {/* VIEW MODE: SCHEMA */}
                  {viewMode === 'schema' ? (
                    <div className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-surface-raised/40">
                            <TableHead className="w-14 text-center font-numeric">#</TableHead>
                            <TableHead>Column Name</TableHead>
                            <TableHead>SQLite Type</TableHead>
                            <TableHead>Constraints</TableHead>
                            <TableHead>Default Value</TableHead>
                            <TableHead className="w-24 text-center">Primary Key</TableHead>
                            <TableHead className="w-20 text-right">Copy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isSchemaLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell colSpan={7} className="p-3">
                                  <Skeleton className="h-7 w-full" />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : schema.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="py-12 text-center text-text-muted">
                                No schema column definitions found for table `{selectedTable}`.
                              </TableCell>
                            </TableRow>
                          ) : (
                            schema.map((col: DbColumnDefinition) => (
                              <TableRow key={col.cid} className="hover:bg-surface-raised/50">
                                <TableCell className="text-center font-numeric text-text-muted text-[11px]">
                                  {col.cid}
                                </TableCell>
                                <TableCell className="font-numeric font-semibold text-text-primary">
                                  <div className="flex items-center gap-2">
                                    {col.pk > 0 && (
                                      <KeyRound className="h-3.5 w-3.5 text-primary shrink-0" />
                                    )}
                                    <span>{col.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    size="sm"
                                    className="font-numeric text-[11px]"
                                  >
                                    {col.type || 'ANY'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {col.notnull === 1 ? (
                                    <Badge variant="warning" size="sm" className="text-[10px]">
                                      NOT NULL
                                    </Badge>
                                  ) : (
                                    <Badge variant="subtle" size="sm" className="text-[10px]">
                                      NULLABLE
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="font-numeric text-caption text-text-muted">
                                  {col.dflt_value !== null ? (
                                    <code className="rounded bg-surface-raised px-1.5 py-0.5 text-text-primary text-[11px] border border-border/60">
                                      {String(col.dflt_value)}
                                    </code>
                                  ) : (
                                    <span className="italic opacity-50">none</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {col.pk > 0 ? (
                                    <Badge variant="default" size="sm" className="font-semibold">
                                      PK
                                    </Badge>
                                  ) : (
                                    <span className="text-text-muted opacity-40">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() =>
                                      copyToClipboard(col.name, `col-${col.cid}-${col.name}`)
                                    }
                                    title={`Copy column name "${col.name}"`}
                                  >
                                    {copiedKey === `col-${col.cid}-${col.name}` ? (
                                      <Check className="h-3 w-3 text-success" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-text-muted hover:text-text-primary" />
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    /* VIEW MODE: DATA EXPLORER */
                    <div>
                      {isRecordsLoading ? (
                        <div className="p-6 space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : !recordsResult || recordsResult.records.length === 0 ? (
                        <div className="py-16">
                          <EmptyState
                            title={
                              recordSearch
                                ? `No rows matched "${recordSearch}"`
                                : `Table "${selectedTable}" is empty`
                            }
                            description={
                              recordSearch
                                ? 'Try adjusting your search query to find matching rows.'
                                : 'No records exist yet in this SQLite table. Records will be populated as the application runs.'
                            }
                            icon={<Table2 className="h-8 w-8 text-text-muted" />}
                            action={
                              recordSearch ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRecordSearch('');
                                    setPage(1);
                                  }}
                                >
                                  Clear Search
                                </Button>
                              ) : undefined
                            }
                          />
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-surface-raised/40">
                                <TableHead className="w-14 text-center font-numeric">#</TableHead>
                                {currentColumns.map((colName) => {
                                  const isSorted = sortCol === colName;
                                  const isPk = schema.some((c) => c.name === colName && c.pk > 0);
                                  return (
                                    <TableHead
                                      key={colName}
                                      sortable
                                      sortDirection={isSorted ? sortOrder : false}
                                      onSort={() => handleSort(colName)}
                                      className="whitespace-nowrap"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        {isPk && (
                                          <KeyRound className="h-3 w-3 text-primary shrink-0" />
                                        )}
                                        <span
                                          className={cn(
                                            'font-numeric font-semibold',
                                            isPk && 'text-primary'
                                          )}
                                        >
                                          {colName}
                                        </span>
                                        {isSorted ? (
                                          sortOrder === 'asc' ? (
                                            <ArrowUp className="h-3 w-3 text-primary" />
                                          ) : (
                                            <ArrowDown className="h-3 w-3 text-primary" />
                                          )
                                        ) : (
                                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                                        )}
                                      </div>
                                    </TableHead>
                                  );
                                })}
                                <TableHead className="w-20 text-right pr-4">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {recordsResult.records.map(
                                (row: Record<string, unknown>, idx: number) => {
                                  const rowNum = (page - 1) * limit + idx + 1;
                                  return (
                                    <TableRow
                                      key={idx}
                                      className="hover:bg-surface-raised/70 cursor-pointer transition-colors"
                                      onClick={() => setInspectedRecord(row)}
                                    >
                                      <TableCell className="text-center font-numeric text-text-muted text-[11px]">
                                        {rowNum}
                                      </TableCell>
                                      {currentColumns.map((colName) => {
                                        const cellVal = row[colName];
                                        return (
                                          <TableCell
                                            key={colName}
                                            className="font-numeric text-caption max-w-[260px] truncate"
                                          >
                                            {cellVal === null || cellVal === undefined ? (
                                              <span className="text-text-muted/60 italic text-[11px]">
                                                NULL
                                              </span>
                                            ) : typeof cellVal === 'boolean' ? (
                                              <Badge
                                                variant={cellVal ? 'success' : 'secondary'}
                                                size="sm"
                                                className="text-[10px]"
                                              >
                                                {String(cellVal)}
                                              </Badge>
                                            ) : typeof cellVal === 'object' ? (
                                              <span className="rounded bg-accent/10 text-accent font-semibold px-1.5 py-0.5 text-[11px]">
                                                {JSON.stringify(cellVal).slice(0, 24)}…
                                              </span>
                                            ) : (
                                              String(cellVal)
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                      <TableCell className="text-right pr-4">
                                        <Button
                                          variant="ghost"
                                          size="xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setInspectedRecord(row);
                                          }}
                                        >
                                          Inspect
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                }
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Pagination Footer */}
                      {recordsResult && totalRows > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-surface">
                          <span className="text-caption text-text-secondary font-numeric">
                            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalRows)}{' '}
                            of {totalRows.toLocaleString()} entries
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page <= 1}
                              onClick={() => setPage(page - 1)}
                              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                            >
                              Previous
                            </Button>
                            <span className="px-3 text-caption font-numeric text-text-primary">
                              Page {page} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page >= totalPages}
                              onClick={() => setPage(page + 1)}
                              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB 2: DISASTER RECOVERY & DEPLOYMENT BACKUPS
            ========================================================================= */}
        <TabsContent value="backups" className="mt-6 space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-caption text-text-muted">Storage Engine</div>
                <div className="text-body-md font-display font-bold text-text-primary truncate">
                  SQLite 3 WAL Mode
                </div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-caption text-text-muted">Available Snapshots</div>
                <div className="text-body-md font-display font-bold text-text-primary font-numeric">
                  {backups.length} Snapshots
                </div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                <HardDrive className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-caption text-text-muted">Total Backup Footprint</div>
                <div className="text-body-md font-display font-bold text-text-primary font-numeric">
                  {formattedTotalBackupSize}
                </div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-caption text-text-muted">Latest Snapshot</div>
                <div className="text-body-sm font-semibold text-text-primary truncate font-numeric">
                  {latestBackup
                    ? new Date(latestBackup.createdAt).toLocaleDateString()
                    : 'None yet'}
                </div>
              </div>
            </Card>
          </div>

          {/* Zero-Data-Loss Deployment Playbook Card */}
          <Card variant="raised" className="border-primary/30 bg-primary-subtle/10">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-body-lg font-display font-bold text-text-primary">
                    Zero-Data-Loss Deployment & Migration Safety Guard
                  </CardTitle>
                  <CardDescription className="text-text-secondary mt-1">
                    Whenever deploying a new application version or running schema migrations,
                    follow this verified 3-step disaster recovery protocol:
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-display font-semibold text-caption text-primary">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-subtle text-primary text-caption font-bold">
                        1
                      </span>
                      Pre-Deploy Snapshot
                    </div>
                    <p className="text-caption text-text-secondary mt-2">
                      Take a WAL-consistent hot snapshot immediately before triggering a build or
                      migration.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-bg p-2 font-numeric text-[11px] text-text-primary border border-border">
                    <span className="truncate">pnpm db:backup</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('pnpm db:backup', 'cmd-1')}
                      className="text-text-muted hover:text-text-primary"
                    >
                      {copiedKey === 'cmd-1' ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-display font-semibold text-caption text-primary">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-subtle text-primary text-caption font-bold">
                        2
                      </span>
                      Deploy & Migrate
                    </div>
                    <p className="text-caption text-text-secondary mt-2">
                      Execute code deploy and apply schema migrations safely via Drizzle ORM.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-bg p-2 font-numeric text-[11px] text-text-primary border border-border">
                    <span className="truncate">pnpm --filter @kalya/db db:migrate</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('pnpm --filter @kalya/db db:migrate', 'cmd-2')}
                      className="text-text-muted hover:text-text-primary"
                    >
                      {copiedKey === 'cmd-2' ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-display font-semibold text-caption text-danger">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-subtle text-danger text-caption font-bold">
                        3
                      </span>
                      Instant Rollback
                    </div>
                    <p className="text-caption text-text-secondary mt-2">
                      If data corruption or migration failure occurs, instantly restore the
                      snapshot.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-bg p-2 font-numeric text-[11px] text-text-primary border border-border">
                    <span className="truncate">pnpm db:restore &lt;snapshot&gt;</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('pnpm db:restore', 'cmd-3')}
                      className="text-text-muted hover:text-text-primary"
                    >
                      {copiedKey === 'cmd-3' ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions: Create Hot Backup & Upload Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Snapshot Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-body-md font-display flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" /> Create Hot Snapshot
                </CardTitle>
                <CardDescription>
                  Takes a safe, non-blocking online copy of SQLite while checkpointing the WAL
                  buffer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="default"
                  onClick={() => createBackupMutation.mutate()}
                  isLoading={createBackupMutation.isPending}
                  leftIcon={<HardDrive className="h-4 w-4" />}
                >
                  Create Snapshot Now
                </Button>
                <div className="flex items-center gap-2 text-caption text-text-muted">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    Snapshots are safely stored in persistent{' '}
                    <code className="font-numeric font-semibold text-text-primary">backups/</code>{' '}
                    folder with SHA-256 verification.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Upload External Snapshot Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-body-md font-display flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-primary" /> Upload External Snapshot
                </CardTitle>
                <CardDescription>
                  Upload an existing <code className="font-numeric">.sqlite</code> or{' '}
                  <code className="font-numeric">.db</code> snapshot file to restore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 hover:border-primary/60 transition-colors cursor-pointer bg-surface-raised/40">
                  <UploadCloud className="h-8 w-8 text-text-muted mb-2" />
                  <span className="text-caption font-semibold text-text-primary">
                    Click to select .sqlite snapshot
                  </span>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    Maximum 200 MB SQLite database file
                  </span>
                  <input
                    type="file"
                    accept=".sqlite,.db"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadBackupMutation.mutate(file);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Existing Snapshots Table */}
          <Card>
            <CardHeader
              className="pb-3 border-b border-border"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshBackups}
                  disabled={isRefreshingBackupsList}
                  leftIcon={
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isRefreshingBackupsList ? 'animate-spin' : ''}`}
                    />
                  }
                >
                  {isRefreshingBackupsList ? 'Refreshing…' : 'Refresh'}
                </Button>
              }
            >
              <div>
                <CardTitle className="text-body-md font-display flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Available Database Snapshots (
                  {backups.length})
                </CardTitle>
                <CardDescription>
                  Hot snapshots ready for 1-click restoration, offline verification, or download.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isBackupsLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : backups.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    title="No backups found"
                    description="Take a snapshot above or run 'pnpm db:backup' in your terminal before deploying."
                    icon={<HardDrive className="h-6 w-6 text-text-muted" />}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-raised/40">
                      <TableHead>Snapshot Filename</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((b: DbBackupInfo) => (
                      <TableRow key={b.filename} className="hover:bg-surface-raised/50">
                        <TableCell className="font-numeric font-semibold text-text-primary">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate max-w-[280px] sm:max-w-none">
                              {b.filename}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.filename, b.filename)}
                              className="text-text-muted hover:text-text-primary p-0.5"
                              title="Copy filename"
                            >
                              {copiedKey === b.filename ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="font-numeric text-caption text-text-secondary">
                          <Badge variant="subtle" size="sm" className="font-numeric">
                            {b.sizeFormatted}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-numeric text-caption text-text-secondary whitespace-nowrap">
                          {new Date(b.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Download */}
                            <Button
                              variant="ghost"
                              size="xs"
                              title="Download Snapshot"
                              disabled={downloadingBackup === b.filename}
                              onClick={() => handleDownloadBackup(b.filename)}
                              className="flex items-center gap-1 cursor-pointer"
                            >
                              {downloadingBackup === b.filename ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">
                                {downloadingBackup === b.filename ? 'Downloading...' : 'Download'}
                              </span>
                            </Button>

                            {/* Restore */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => {
                                setRestoreModalBackup(b);
                                setRestoreConfirmText('');
                              }}
                              className="text-danger hover:text-danger hover:border-danger/40"
                              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                            >
                              Restore
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeleteModalBackup(b)}
                              title="Delete Snapshot"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-text-muted hover:text-danger" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* =========================================================================
          DRAWER: RECORD DETAIL INSPECTOR
          ========================================================================= */}
      <Drawer
        open={Boolean(inspectedRecord)}
        onOpenChange={(open) => {
          if (!open) {
            setInspectedRecord(null);
            setInspectedFieldSearch('');
          }
        }}
      >
        <DrawerContent side="right" size="lg">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle className="font-display flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-primary" /> Record Inspector
              </span>
              <Badge variant="subtle" size="sm" className="font-numeric">
                {selectedTable}
              </Badge>
            </DrawerTitle>
            <DrawerDescription>
              Detailed view of all row fields, primitive values, and nested structures.
            </DrawerDescription>

            {inspectedRecord && (
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    size="sm"
                    placeholder="Search fields or values…"
                    value={inspectedFieldSearch}
                    onChange={(e) => setInspectedFieldSearch(e.target.value)}
                    leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
                  />
                  {inspectedFieldSearch && (
                    <button
                      type="button"
                      onClick={() => setInspectedFieldSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(inspectedRecord, null, 2))}
                  leftIcon={<Copy className="h-3.5 w-3.5" />}
                >
                  Copy JSON
                </Button>
              </div>
            )}
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {inspectedRecord && (
              <>
                <div className="flex items-center justify-between text-caption text-text-muted">
                  <span>
                    Showing {inspectedEntries.length} of {Object.keys(inspectedRecord).length}{' '}
                    fields
                  </span>
                </div>

                <div className="space-y-3">
                  {inspectedEntries.length === 0 ? (
                    <div className="text-center py-8 text-caption text-text-muted">
                      No fields matched &quot;{inspectedFieldSearch}&quot;
                    </div>
                  ) : (
                    inspectedEntries.map(([key, val]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-border bg-surface-raised p-3.5 transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-numeric text-caption font-semibold text-text-primary">
                            {key}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              size="sm"
                              className="font-numeric text-[10px]"
                            >
                              {val === null ? 'null' : typeof val}
                            </Badge>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  val === null || val === undefined
                                    ? ''
                                    : typeof val === 'object'
                                      ? JSON.stringify(val, null, 2)
                                      : String(val),
                                  `field-${key}`
                                )
                              }
                              className="text-text-muted hover:text-text-primary p-0.5"
                              title="Copy field value"
                            >
                              {copiedKey === `field-${key}` ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <pre className="font-numeric text-caption text-text-secondary overflow-x-auto whitespace-pre-wrap break-all bg-bg p-2.5 rounded border border-border/60">
                          {val === null || val === undefined
                            ? 'null'
                            : typeof val === 'object'
                              ? JSON.stringify(val, null, 2)
                              : String(val)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="border-t border-border">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* =========================================================================
          DIALOG: RESTORE BACKUP CONFIRMATION (DOUBLE GUARD)
          ========================================================================= */}
      <Dialog
        open={Boolean(restoreModalBackup)}
        onOpenChange={(open) => {
          if (!open) {
            setRestoreModalBackup(null);
            setRestoreConfirmText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-subtle text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-text-primary">
                  Confirm Database Restoration
                </DialogTitle>
                <DialogDescription className="text-caption text-text-secondary mt-1">
                  You are about to roll back the live database to snapshot:
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {restoreModalBackup && (
            <div className="space-y-4 my-2">
              <div className="rounded-lg border border-danger/30 bg-danger-subtle/30 p-3.5 space-y-2 text-caption">
                <div className="font-semibold text-danger flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" /> Crucial Safety Notice
                </div>
                <p className="text-text-secondary">
                  Restoring will overwrite current SQLite state with data from{' '}
                  <strong className="text-text-primary font-numeric">
                    {restoreModalBackup.filename}
                  </strong>
                  .
                </p>
                <p className="text-text-secondary">
                  An automatic emergency snapshot will be captured immediately before restoring so
                  you can undo if necessary.
                </p>
              </div>

              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1.5">
                  Type <span className="font-numeric font-bold text-danger">RESTORE</span> to
                  confirm:
                </label>
                <Input
                  value={restoreConfirmText}
                  onChange={(e) => setRestoreConfirmText(e.target.value)}
                  placeholder="RESTORE"
                  className="font-numeric"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreModalBackup(null);
                setRestoreConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={restoreConfirmText !== 'RESTORE'}
              isLoading={restoreBackupMutation.isPending}
              onClick={() => {
                if (restoreModalBackup) {
                  restoreBackupMutation.mutate(restoreModalBackup.filename);
                }
              }}
            >
              Confirm & Restore Snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DIALOG: DELETE BACKUP CONFIRMATION
          ========================================================================= */}
      <Dialog
        open={Boolean(deleteModalBackup)}
        onOpenChange={(open) => {
          if (!open) setDeleteModalBackup(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-text-primary">
              Delete Snapshot
            </DialogTitle>
            <DialogDescription className="text-caption text-text-secondary">
              Are you sure you want to permanently delete snapshot{' '}
              <strong className="font-numeric text-text-primary">
                {deleteModalBackup?.filename}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalBackup(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteBackupMutation.isPending}
              onClick={() => {
                if (deleteModalBackup) {
                  deleteBackupMutation.mutate(deleteModalBackup.filename);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
