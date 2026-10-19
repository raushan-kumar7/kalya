import { z } from 'zod';
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  AUDIT_SEVERITY_OPTIONS,
  AUDIT_STATUS_OPTIONS,
  CONTACT_INQUIRY_TOPICS,
  CONTACT_INQUIRY_STATUSES,
  CONTACT_INQUIRY_PRIORITIES,
  type BaseUserRole,
  type BaseUserStatus,
  type BaseAuditSeverity,
  type BaseAuditStatus,
  type ContactInquiryTopic,
  type ContactInquiryStatus,
  type ContactInquiryPriority,
} from '@kalya/types';
import { UUIDSchema } from '../core/primitives';

export const zUserRole = z.enum(USER_ROLE_OPTIONS);
export const zUserStatus = z.enum(USER_STATUS_OPTIONS);
export const zAuditSeverity = z.enum(AUDIT_SEVERITY_OPTIONS);
export const zAuditStatus = z.enum(AUDIT_STATUS_OPTIONS);
export const zContactInquiryTopic = z.enum(CONTACT_INQUIRY_TOPICS);
export const zContactInquiryStatus = z.enum(CONTACT_INQUIRY_STATUSES);
export const zContactInquiryPriority = z.enum(CONTACT_INQUIRY_PRIORITIES);

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

/**
 * Validation schema for public contact form submissions.
 */
export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100),
  email: z
    .string()
    .trim()
    .min(1, 'Enter a valid email, like you@example.com.')
    .email('Enter a valid email, like you@example.com.')
    .max(255),
  topic: zContactInquiryTopic,
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(2000, 'Message cannot exceed 2000 characters.'),
  _company_hp: z.string().max(0).optional(),
});

export type ContactSubmissionInput = {
  name: string;
  email: string;
  topic: ContactInquiryTopic;
  message: string;
  _company_hp?: string;
};

/**
 * Validation schema for querying paginated contact inquiries in admin console.
 */
export const adminInquiriesQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  topic: zContactInquiryTopic.optional(),
  status: zContactInquiryStatus.optional(),
  priority: zContactInquiryPriority.optional(),
  sortBy: z.enum(['createdAt', 'slaDueDate', 'name', 'status', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AdminInquiriesQueryInput = {
  page?: number;
  limit?: number;
  search?: string;
  topic?: ContactInquiryTopic;
  status?: ContactInquiryStatus;
  priority?: ContactInquiryPriority;
  sortBy?: 'createdAt' | 'slaDueDate' | 'name' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Validation schema for transitioning inquiry status.
 */
export const updateInquiryStatusSchema = z.object({
  status: zContactInquiryStatus,
});

export type UpdateInquiryStatusInput = {
  status: ContactInquiryStatus;
};

/**
 * Validation schema for assigning an inquiry to an admin staff.
 */
export const assignInquirySchema = z.object({
  assignedToId: UUIDSchema.nullable(),
});

export type AssignInquiryInput = {
  assignedToId: string | null;
};

/**
 * Validation schema for creating a reply or internal note on an inquiry.
 */
export const createInquiryReplySchema = z.object({
  type: z.enum(['PUBLIC_REPLY', 'INTERNAL_NOTE']),
  message: z.string().trim().min(1, 'Message cannot be empty').max(5000),
});

export type CreateInquiryReplyInput = {
  type: 'PUBLIC_REPLY' | 'INTERNAL_NOTE';
  message: string;
};
