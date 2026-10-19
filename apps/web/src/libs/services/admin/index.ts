'use client';

import { http, ENDPOINTS } from '@/libs/api';
import type { PaginationMeta } from '@/libs/api/types';
import type {
  AdminOverviewStats,
  AdminUserDetail,
  AuditLog,
  Session,
  SubsystemDiagnostics,
  User,
} from '@kalya/types';
import type {
  AdminAuditLogsQueryInput,
  AdminUsersQueryInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from '@kalya/validations';

/**
 * Super-Admin Service
 *
 * Implements static methods for administrative platform operations:
 * KPIs, user governance, privilege modifications, audit logs, and subsystem diagnostics.
 */
export class AdminService {
  /**
   * Retrieves high-level platform KPI counters and operational health metrics.
   */
  static async getOverview(): Promise<AdminOverviewStats> {
    return http.get<AdminOverviewStats>(ENDPOINTS.ADMIN.OVERVIEW);
  }

  /**
   * Retrieves paginated list of all platform users with filtering.
   */
  static async getUsers(
    query?: AdminUsersQueryInput
  ): Promise<{ users: AdminUserDetail[]; meta?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.set('page', String(query.page));
    if (query?.limit) searchParams.set('limit', String(query.limit));
    if (query?.search) searchParams.set('search', query.search);
    if (query?.role) searchParams.set('role', query.role);
    if (query?.status) searchParams.set('status', query.status);
    if (query?.sortBy) searchParams.set('sortBy', query.sortBy);
    if (query?.sortOrder) searchParams.set('sortOrder', query.sortOrder);

    const qs = searchParams.toString();
    const url = qs ? `${ENDPOINTS.ADMIN.USERS}?${qs}` : ENDPOINTS.ADMIN.USERS;

    const res = await http.get<AdminUserDetail[] & { meta?: PaginationMeta }>(url);
    return {
      users: Array.isArray(res) ? res : [],
      meta: (res as unknown as { meta?: PaginationMeta })?.meta,
    };
  }

  /**
   * Retrieves detailed user profile, active sessions, and recent audit logs.
   */
  static async getUser(id: string): Promise<{
    user: AdminUserDetail;
    sessions: Session[];
    recentAuditLogs: AuditLog[];
  }> {
    return http.get<{
      user: AdminUserDetail;
      sessions: Session[];
      recentAuditLogs: AuditLog[];
    }>(ENDPOINTS.ADMIN.USER_DETAIL(id));
  }

  /**
   * Updates an existing user's privilege role.
   */
  static async updateUserRole(id: string, body: UpdateUserRoleInput): Promise<User> {
    return http.patch<User>(ENDPOINTS.ADMIN.UPDATE_ROLE(id), body);
  }

  /**
   * Suspends, bans, or restores a user account, invalidating sessions on deactivation.
   */
  static async updateUserStatus(id: string, body: UpdateUserStatusInput): Promise<User> {
    return http.patch<User>(ENDPOINTS.ADMIN.UPDATE_STATUS(id), body);
  }

  /**
   * Retrieves paginated stream of platform audit logs.
   */
  static async getActivities(
    query?: AdminAuditLogsQueryInput
  ): Promise<{ logs: AuditLog[]; meta?: PaginationMeta }> {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.set('page', String(query.page));
    if (query?.limit) searchParams.set('limit', String(query.limit));
    if (query?.actorId) searchParams.set('actorId', query.actorId);
    if (query?.action) searchParams.set('action', query.action);
    if (query?.entityType) searchParams.set('entityType', query.entityType);
    if (query?.severity) searchParams.set('severity', query.severity);
    if (query?.status) searchParams.set('status', query.status);
    if (query?.startDate) searchParams.set('startDate', query.startDate);
    if (query?.endDate) searchParams.set('endDate', query.endDate);
    if (query?.search) searchParams.set('search', query.search);

    const qs = searchParams.toString();
    const url = qs ? `${ENDPOINTS.ADMIN.ACTIVITIES}?${qs}` : ENDPOINTS.ADMIN.ACTIVITIES;

    const res = await http.get<AuditLog[] & { meta?: PaginationMeta }>(url);
    return {
      logs: Array.isArray(res) ? res : [],
      meta: (res as unknown as { meta?: PaginationMeta })?.meta,
    };
  }

  /**
   * Compiles live health diagnostics across SQLite, background workers, and process runtime.
   */
  static async getDiagnostics(): Promise<SubsystemDiagnostics> {
    return http.get<SubsystemDiagnostics>(ENDPOINTS.ADMIN.SERVICES);
  }
}
