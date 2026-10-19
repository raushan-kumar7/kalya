'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import { useAuth } from '@/hooks/auth';
import type { AdminUserDetail, BaseUserRole, BaseUserStatus } from '@kalya/types';
import toast from 'react-hot-toast';
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { cn } from '@/libs/utils';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<BaseUserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<BaseUserStatus | ''>('');
  const [page, setPage] = useState(1);

  // Modals & Drawer State
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<AdminUserDetail | null>(null);
  const [selectedRole, setSelectedRole] = useState<BaseUserRole>('USER');
  const [roleReason, setRoleReason] = useState('');

  const [statusModalUser, setStatusModalUser] = useState<AdminUserDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BaseUserStatus>('ACTIVE');
  const [banReason, setBanReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Users Query
  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'users', { page, search, role: roleFilter, status: statusFilter }],
    queryFn: () =>
      AdminService.getUsers({
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([refetch(), new Promise((resolve) => setTimeout(resolve, 600))]);
      toast.success('User list refreshed');
    } catch {
      toast.error('Failed to refresh user list');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 2. Fetch Inspected User Detail Query
  const { data: inspectedUserDetail, isLoading: isInspectLoading } = useQuery({
    queryKey: ['admin', 'user-detail', inspectUserId],
    queryFn: () => (inspectUserId ? AdminService.getUser(inspectUserId) : null),
    enabled: Boolean(inspectUserId),
  });

  // 3. Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
      reason,
    }: {
      userId: string;
      role: BaseUserRole;
      reason?: string;
    }) => AdminService.updateUserRole(userId, { role, reason }),
    onSuccess: (updated) => {
      toast.success(`Role for ${updated.name} updated to ${updated.role}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setRoleModalUser(null);
      setRoleReason('');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update user role');
    },
  });

  // 4. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      banReason,
    }: {
      userId: string;
      status: BaseUserStatus;
      banReason?: string;
    }) => AdminService.updateUserStatus(userId, { status, banReason }),
    onSuccess: (updated) => {
      toast.success(`Account status for ${updated.name} updated to ${updated.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setStatusModalUser(null);
      setBanReason('');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update user status');
    },
  });

  const getRoleBadge = (role: BaseUserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge variant="default" size="sm" className="font-numeric uppercase">
            SUPER_ADMIN
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge variant="accent" size="sm" className="font-numeric uppercase">
            ADMIN
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm" className="font-numeric uppercase">
            USER
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: BaseUserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" size="sm" dot dotColor="success">
            Active
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge variant="warning" size="sm" dot dotColor="warning">
            Suspended
          </Badge>
        );
      case 'BANNED':
        return (
          <Badge variant="danger" size="sm" dot dotColor="danger">
            Banned
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-md font-display font-bold tracking-tight text-text-primary flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            User Governance
          </h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            View all registered platform accounts, assign privilege roles, and manage account
            statuses.
          </p>
        </div>

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

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="w-full md:w-96">
            <Input
              size="sm"
              placeholder="Search by name, email, or username…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leadingIcon={<Search className="h-3.5 w-3.5 text-text-muted" />}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 shadow-xs">
              {[
                { id: '', label: 'All Roles' },
                { id: 'USER', label: 'Users' },
                { id: 'ADMIN', label: 'Admins' },
                { id: 'SUPER_ADMIN', label: 'Super-Admins' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setRoleFilter(tab.id as BaseUserRole | '');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-md px-3 py-1 text-caption font-medium transition-colors whitespace-nowrap',
                    roleFilter === tab.id
                      ? 'bg-surface text-text-primary shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised p-1 shadow-xs">
              {[
                { id: '', label: 'All' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'SUSPENDED', label: 'Suspended' },
                { id: 'BANNED', label: 'Banned' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as BaseUserStatus | '');
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

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Sessions</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-caption text-text-muted">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Loading user directory…</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !usersData?.users || usersData.users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-caption text-text-muted"
                    >
                      No users found matching query criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  usersData.users.map((u) => {
                    const isSelf = currentAdmin?.id === u.id;
                    return (
                      <TableRow key={u.id} className="hover:bg-surface-raised transition-colors">
                        {/* Name & Handle */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              {u.image && <AvatarImage src={u.image} alt={u.name} />}
                              <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                                {u.name}
                                {isSelf && (
                                  <Badge
                                    variant="subtle"
                                    size="sm"
                                    className="font-numeric text-[10px]"
                                  >
                                    YOU
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-text-muted font-numeric">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>{getRoleBadge(u.role as BaseUserRole)}</TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(u.status as BaseUserStatus)}</TableCell>

                        {/* Sessions Count */}
                        <TableCell className="font-numeric text-caption text-text-secondary">
                          {u.activeSessionCount} active
                        </TableCell>

                        {/* Created At */}
                        <TableCell className="font-numeric text-caption text-text-secondary whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>

                        {/* Action buttons */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect */}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setInspectUserId(u.id)}
                              leftIcon={<Eye className="h-3.5 w-3.5" />}
                            >
                              Inspect
                            </Button>

                            {/* Change Role */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => {
                                setRoleModalUser(u);
                                setSelectedRole(u.role as BaseUserRole);
                                setRoleReason('');
                              }}
                              leftIcon={<Shield className="h-3.5 w-3.5" />}
                            >
                              Role
                            </Button>

                            {/* Status / Ban */}
                            <Button
                              variant="ghost"
                              size="xs"
                              disabled={isSelf}
                              onClick={() => {
                                setStatusModalUser(u);
                                setSelectedStatus(u.status as BaseUserStatus);
                                setBanReason(u.banReason || '');
                              }}
                              className={
                                u.status === 'BANNED'
                                  ? 'text-success'
                                  : 'text-danger hover:text-danger'
                              }
                              leftIcon={<Ban className="h-3.5 w-3.5" />}
                            >
                              {u.status === 'BANNED' ? 'Unban' : 'Status'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {usersData?.meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
              <span className="text-caption text-text-secondary font-numeric">
                Showing {usersData.users.length} of {usersData.meta.total} users
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!usersData.meta.hasPrev}
                  leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Previous
                </Button>
                <span className="px-3 text-caption font-numeric text-text-primary">
                  Page {usersData.meta.currentPage} of {usersData.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!usersData.meta.hasNext}
                  rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Dialog
        open={Boolean(roleModalUser)}
        onOpenChange={(open) => {
          if (!open) setRoleModalUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-text-primary flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Change Privilege Role
            </DialogTitle>
            <DialogDescription>
              Update assigned access tier for{' '}
              <strong className="text-text-primary">{roleModalUser?.name}</strong> (
              {roleModalUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Target Role
              </label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val as BaseUserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select privilege role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER — Standard Personal Finances</SelectItem>
                  <SelectItem value="ADMIN">ADMIN — Moderation & Support View</SelectItem>
                  <SelectItem value="SUPER_ADMIN">
                    SUPER_ADMIN — Full Platform Governance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Audit Reason (Optional)
              </label>
              <Input
                placeholder="e.g. Promoted to lead operations"
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              isLoading={updateRoleMutation.isPending}
              onClick={() => {
                if (roleModalUser) {
                  updateRoleMutation.mutate({
                    userId: roleModalUser.id,
                    role: selectedRole,
                    reason: roleReason || undefined,
                  });
                }
              }}
            >
              Confirm Role Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Status / Ban Modal */}
      <Dialog
        open={Boolean(statusModalUser)}
        onOpenChange={(open) => {
          if (!open) setStatusModalUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-text-primary flex items-center gap-2">
              <Ban className="h-5 w-5 text-warning" /> Manage Account Status
            </DialogTitle>
            <DialogDescription>
              Restrict or restore platform access for{' '}
              <strong className="text-text-primary">{statusModalUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="block text-caption font-semibold text-text-primary mb-1">
                Account Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as BaseUserStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE — Normal platform operations</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED — Temporary block</SelectItem>
                  <SelectItem value="BANNED">BANNED — Permanent platform ban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedStatus !== 'ACTIVE' && (
              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1">
                  Reason for Restriction
                </label>
                <Input
                  placeholder="e.g. Terms of Service violation"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant={selectedStatus === 'ACTIVE' ? 'default' : 'destructive'}
              isLoading={updateStatusMutation.isPending}
              onClick={() => {
                if (statusModalUser) {
                  updateStatusMutation.mutate({
                    userId: statusModalUser.id,
                    status: selectedStatus,
                    banReason: banReason || undefined,
                  });
                }
              }}
            >
              Apply Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspect User Drawer */}
      <Drawer
        open={Boolean(inspectUserId)}
        onOpenChange={(open) => {
          if (!open) setInspectUserId(null);
        }}
      >
        <DrawerContent side="right" size="lg">
          <DrawerHeader>
            <DrawerTitle className="font-display flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> User Profile & Security Details
            </DrawerTitle>
            <DrawerDescription>
              Comprehensive account breakdown and active credentials.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isInspectLoading || !inspectedUserDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              (() => {
                const detail = inspectedUserDetail.user;
                const sessions = inspectedUserDetail.sessions;
                const logs = inspectedUserDetail.recentAuditLogs;
                return (
                  <>
                    {/* Header card with avatar */}
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-4">
                      <Avatar size="lg">
                        {detail.image && <AvatarImage src={detail.image} alt={detail.name} />}
                        <AvatarFallback>{detail.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-body-md text-text-primary">
                          {detail.name}
                        </h4>
                        <p className="text-caption text-text-muted font-numeric">{detail.email}</p>
                        <div className="flex items-center gap-2 pt-1">
                          {getRoleBadge(detail.role as BaseUserRole)}
                          {getStatusBadge(detail.status as BaseUserStatus)}
                        </div>
                      </div>
                    </div>

                    {/* Account Details Matrix */}
                    <div className="grid grid-cols-2 gap-3 text-caption">
                      <div className="rounded-lg border border-border bg-surface p-3">
                        <span className="text-text-muted">User ID</span>
                        <p className="font-numeric font-medium text-text-primary mt-1 truncate">
                          {detail.id}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-surface p-3">
                        <span className="text-text-muted">Email Verified</span>
                        <p className="font-medium text-text-primary mt-1">
                          {detail.emailVerified ? (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-warning">Unverified</span>
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-surface p-3">
                        <span className="text-text-muted">Registered At</span>
                        <p className="font-numeric text-text-primary mt-1">
                          {new Date(detail.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-surface p-3">
                        <span className="text-text-muted">Active Sessions</span>
                        <p className="font-numeric font-bold text-text-primary mt-1">
                          {sessions.length} sessions
                        </p>
                      </div>
                    </div>

                    {/* Audit Trail for this user */}
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-caption uppercase tracking-wider text-text-secondary">
                        Recent User Audit Logs
                      </h4>
                      {logs.length === 0 ? (
                        <div className="rounded-lg border border-border p-4 text-center text-caption text-text-muted">
                          No recent activity logs for this user.
                        </div>
                      ) : (
                        <div className="divide-y divide-border/60 rounded-xl border border-border bg-surface overflow-hidden">
                          {logs.map((log) => (
                            <div
                              key={log.id}
                              className="p-3 text-caption hover:bg-surface-raised transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-numeric font-semibold text-text-primary">
                                  {log.action}
                                </span>
                                <span className="font-numeric text-[11px] text-text-muted">
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-text-secondary text-[11px] mt-1">
                                {log.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()
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
    </div>
  );
}
