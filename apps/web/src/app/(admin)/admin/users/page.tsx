'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/libs/services/admin';
import { useAuth } from '@/hooks/auth';
import type { AdminUserDetail, BaseUserRole, BaseUserStatus } from '@kalya/types';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
  Users,
  X,
} from 'lucide-react';

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

  // 1. Fetch Users Query
  const {
    data: usersData,
    isLoading,
    refetch,
    isRefetching,
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="h-6 w-6 text-rose-500" />
            User Governance
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View all registered platform accounts, assign privilege roles, and manage account
            statuses.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or username…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as BaseUserRole | '');
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="USER">Role: USER</option>
            <option value="ADMIN">Role: ADMIN</option>
            <option value="SUPER_ADMIN">Role: SUPER_ADMIN</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as BaseUserStatus | '');
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Status: ACTIVE</option>
            <option value="SUSPENDED">Status: SUSPENDED</option>
            <option value="BANNED">Status: BANNED</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/[0.08] bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Active Sessions</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                      <span>Loading user directory…</span>
                    </div>
                  </td>
                </tr>
              ) : !usersData?.users || usersData.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No users found matching query criteria.
                  </td>
                </tr>
              ) : (
                usersData.users.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition">
                      {/* Name & Handle */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-rose-300 ring-1 ring-white/10">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-white">
                              {u.name}
                              {isSelf && (
                                <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-400">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              @{u.username} • {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : u.role === 'ADMIN'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : u.status === 'SUSPENDED'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {u.status}
                        </span>
                      </td>

                      {/* Active Sessions */}
                      <td className="px-5 py-4 font-mono text-slate-300">
                        {u.activeSessionCount ?? 0} active
                      </td>

                      {/* Registered Date */}
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action Dropdown Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Inspect Detail */}
                          <button
                            onClick={() => setInspectUserId(u.id)}
                            title="Inspect User Details"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Change Role Button */}
                          <button
                            onClick={() => {
                              setRoleModalUser(u);
                              setSelectedRole(u.role as BaseUserRole);
                            }}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot change your own role' : 'Change User Role'}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>

                          {/* Suspend / Ban Button */}
                          <button
                            onClick={() => {
                              setStatusModalUser(u);
                              setSelectedStatus(u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                            }}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot suspend your own account' : 'Modify Status'}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 transition disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {usersData?.meta && (
          <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 text-xs text-slate-400">
            <span>
              Showing {usersData.users.length} of {usersData.meta.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!usersData.meta.hasPrev}
                className="rounded-lg border border-white/10 px-3 py-1 text-slate-300 disabled:opacity-30 hover:bg-white/5"
              >
                Previous
              </button>
              <span className="font-mono text-slate-300">
                Page {usersData.meta.currentPage} of {usersData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!usersData.meta.hasNext}
                className="rounded-lg border border-white/10 px-3 py-1 text-slate-300 disabled:opacity-30 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-rose-400" />
                Change Privilege Role
              </h3>
              <button
                onClick={() => setRoleModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Update assigned access tier for <strong>{roleModalUser.name}</strong> (
              {roleModalUser.email}).
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Target Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as BaseUserRole)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                >
                  <option value="USER">USER — Standard Personal Finances</option>
                  <option value="ADMIN">ADMIN — Moderation & Support View</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN — Full Platform Governance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Audit Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Promoted to lead operations"
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRoleModalUser(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateRoleMutation.mutate({
                    userId: roleModalUser.id,
                    role: selectedRole,
                    reason: roleReason || undefined,
                  })
                }
                disabled={updateRoleMutation.isPending}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {updateRoleMutation.isPending ? 'Updating…' : 'Confirm Role Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status / Ban Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="h-4 w-4 text-amber-400" />
                Update Account Status
              </h3>
              <button
                onClick={() => setStatusModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Modifying status for <strong>{statusModalUser.name}</strong> ({statusModalUser.email}
              ).
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Account State</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BaseUserStatus)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                >
                  <option value="ACTIVE">ACTIVE — Normal Unrestricted Access</option>
                  <option value="SUSPENDED">SUSPENDED — Block Login & Revoke Sessions</option>
                  <option value="BANNED">BANNED — Permanent Deactivation</option>
                </select>
              </div>

              {selectedStatus !== 'ACTIVE' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400">
                    Reason for Suspension / Ban
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Terms violation or suspicious activity"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                  />
                  <p className="mt-1 text-[11px] text-rose-400">
                    ⚠️ Deactivating an account will immediately invalidate all active sessions.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setStatusModalUser(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateStatusMutation.mutate({
                    userId: statusModalUser.id,
                    status: selectedStatus,
                    banReason: banReason || undefined,
                  })
                }
                disabled={updateStatusMutation.isPending}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating…' : 'Apply Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Inspection Slide-over Drawer */}
      {inspectUserId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg border-l border-white/10 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-rose-400" />
                  Account Deep Inspection
                </h3>
                <button
                  onClick={() => setInspectUserId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isInspectLoading || !inspectedUserDetail ? (
                <div className="py-20 text-center text-xs text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent mx-auto mb-2" />
                  Fetching account telemetry…
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {/* User Profile Card */}
                  <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {inspectedUserDetail.user.name}
                      </span>
                      <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                        {inspectedUserDetail.user.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Email: {inspectedUserDetail.user.email}</p>
                      <p>Username: @{inspectedUserDetail.user.username}</p>
                      <p>Timezone: {inspectedUserDetail.user.timezone || 'UTC'}</p>
                      <p>Currency: {inspectedUserDetail.user.currency || 'USD'}</p>
                      <p>Transactions recorded: {inspectedUserDetail.user.transactionCount ?? 0}</p>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Active Sessions ({inspectedUserDetail.sessions.length})
                    </h4>
                    <div className="space-y-2">
                      {inspectedUserDetail.sessions.length === 0 ? (
                        <p className="text-xs text-slate-500">No active sessions found.</p>
                      ) : (
                        inspectedUserDetail.sessions.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-lg border border-white/[0.06] bg-slate-900/40 p-3 text-xs space-y-1"
                          >
                            <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                              <span>IP: {s.ipAddress || 'Unknown'}</span>
                              <span>Expires: {new Date(s.expiresAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              UA: {s.userAgent || 'Unknown Device'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Audit Logs */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Recent Audit Trail ({inspectedUserDetail.recentAuditLogs.length})
                    </h4>
                    <div className="space-y-2">
                      {inspectedUserDetail.recentAuditLogs.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No audit events recorded for this user.
                        </p>
                      ) : (
                        inspectedUserDetail.recentAuditLogs.map((l) => (
                          <div
                            key={l.id}
                            className="rounded-lg border border-white/[0.06] bg-slate-900/40 p-3 text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-semibold text-rose-300 text-[11px]">
                                {l.action}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(l.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{l.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setInspectUserId(null)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
