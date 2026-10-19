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

  /**
   * Retrieves all database tables with live row counts and column totals.
   */
  static async getDbTables(): Promise<import('@kalya/types').DbTableSummary[]> {
    return http.get<import('@kalya/types').DbTableSummary[]>(ENDPOINTS.ADMIN.DATABASE_TABLES);
  }

  /**
   * Retrieves schema column definitions for a specific database table.
   */
  static async getDbTableSchema(
    table: string
  ): Promise<import('@kalya/types').DbColumnDefinition[]> {
    return http.get<import('@kalya/types').DbColumnDefinition[]>(
      ENDPOINTS.ADMIN.DATABASE_SCHEMA(table)
    );
  }

  /**
   * Fetches paginated, searchable, and sortable records for a database table.
   */
  static async getDbTableRecords(
    table: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    records: Record<string, unknown>[];
    meta?: PaginationMeta;
  }> {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.set('page', String(query.page));
    if (query?.limit) searchParams.set('limit', String(query.limit));
    if (query?.search) searchParams.set('search', query.search);
    if (query?.sortBy) searchParams.set('sortBy', query.sortBy);
    if (query?.sortOrder) searchParams.set('sortOrder', query.sortOrder);

    const qs = searchParams.toString();
    const url = qs
      ? `${ENDPOINTS.ADMIN.DATABASE_RECORDS(table)}?${qs}`
      : ENDPOINTS.ADMIN.DATABASE_RECORDS(table);

    const res = await http.get<Record<string, unknown>[] & { meta?: PaginationMeta }>(url);
    return {
      records: Array.isArray(res) ? res : [],
      meta: (res as unknown as { meta?: PaginationMeta })?.meta,
    };
  }

  /**
   * Lists all existing backup files on disk with timestamps and sizes.
   */
  static async getBackups(): Promise<import('@kalya/types').DbBackupInfo[]> {
    return http.get<import('@kalya/types').DbBackupInfo[]>(ENDPOINTS.ADMIN.BACKUPS);
  }

  /**
   * Creates an online hot backup snapshot of the active SQLite database.
   */
  static async createBackup(): Promise<import('@kalya/types').DbBackupInfo> {
    return http.post<import('@kalya/types').DbBackupInfo>(ENDPOINTS.ADMIN.BACKUPS, {});
  }

  /**
   * Restores the database from an existing backup snapshot file.
   */
  static async restoreBackup(
    filename: string
  ): Promise<{ success: boolean; message: string; preRestoreBackup: string }> {
    return http.post<{ success: boolean; message: string; preRestoreBackup: string }>(
      ENDPOINTS.ADMIN.BACKUP_RESTORE,
      { filename }
    );
  }

  /**
   * Uploads an external backup file (.sqlite / .db) to the server.
   */
  static async uploadBackup(file: File): Promise<import('@kalya/types').DbBackupInfo> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<import('@kalya/types').DbBackupInfo>(ENDPOINTS.ADMIN.BACKUP_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Deletes a backup snapshot file from disk.
   */
  static async deleteBackup(filename: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.ADMIN.BACKUP_DELETE(filename));
  }

  /**
   * Generates the API download URL for a backup snapshot.
   */
  static getBackupDownloadUrl(filename: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${baseUrl}${ENDPOINTS.ADMIN.BACKUP_DOWNLOAD(filename)}`;
  }
}
