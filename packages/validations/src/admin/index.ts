import { z } from 'zod';
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  AUDIT_SEVERITY_OPTIONS,
  AUDIT_STATUS_OPTIONS,
  type BaseUserRole,
  type BaseUserStatus,
  type BaseAuditSeverity,
  type BaseAuditStatus,
} from '@kalya/types';
import { UUIDSchema } from '../core/primitives';

export const zUserRole = z.enum(USER_ROLE_OPTIONS);
export const zUserStatus = z.enum(USER_STATUS_OPTIONS);
export const zAuditSeverity = z.enum(AUDIT_SEVERITY_OPTIONS);
export const zAuditStatus = z.enum(AUDIT_STATUS_OPTIONS);

/**
 * Common pagination query parameters.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * Validation schema for updating user privilege role.
 */
export const updateUserRoleSchema = z.object({
  role: zUserRole,
  reason: z.string().max(500).optional(),
});

export type UpdateUserRoleInput = {
  role: BaseUserRole;
  reason?: string;
};

/**
 * Validation schema for updating user lifecycle status.
 */
export const updateUserStatusSchema = z.object({
  status: zUserStatus,
  banReason: z.string().max(1000).optional(),
});

export type UpdateUserStatusInput = {
  status: BaseUserStatus;
  banReason?: string;
};

/**
 * Validation schema for querying paginated users in admin console.
 */
export const adminUsersQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  role: zUserRole.optional(),
  status: zUserStatus.optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'lastActiveAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AdminUsersQueryInput = {
  page?: number;
  limit?: number;
  search?: string;
  role?: BaseUserRole;
  status?: BaseUserStatus;
  sortBy?: 'createdAt' | 'name' | 'email' | 'lastActiveAt';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Validation schema for querying platform audit logs.
 */
export const adminAuditLogsQuerySchema = PaginationQuerySchema.extend({
  actorId: UUIDSchema.optional(),
  action: z.string().trim().max(100).optional(),
  entityType: z.string().trim().max(50).optional(),
  severity: zAuditSeverity.optional(),
  status: zAuditStatus.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().trim().max(100).optional(),
});

export type AdminAuditLogsQueryInput = {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  entityType?: string;
  severity?: BaseAuditSeverity;
  status?: BaseAuditStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
};

/**
 * Validation schema for querying table records in Database Studio.
 */
export const adminDbRecordsQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  sortBy: z.string().trim().max(64).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AdminDbRecordsQueryInput = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

/**
 * Validation schema for restoring a database from an existing backup snapshot.
 */
export const restoreBackupSchema = z.object({
  filename: z.string().trim().min(1).max(255),
});

export type RestoreBackupInput = {
  filename: string;
};
