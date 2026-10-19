import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { env } from '@kalya/env';
import {
  adminAuditLogsQuerySchema,
  adminDbRecordsQuerySchema,
  adminInquiriesQuerySchema,
  adminUsersQuerySchema,
  assignInquirySchema,
  contactSubmissionSchema,
  createInquiryReplySchema,
  restoreBackupSchema,
  updateInquiryStatusSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  UUIDSchema,
  z,
} from '@kalya/validations';
import { AdminController } from './admin.controller';

/**
 * Route declarations for Super-Admin console endpoints.
 *
 * @description Registers versioned Fastify route endpoints for platform overview metrics,
 * user management, role/status mutations, audit logs, and subsystem diagnostics.
 * All endpoints are strictly guarded by `fastify.authenticate` and `fastify.requireSuperAdmin`.
 *
 * @param {AdminController} controller - Instantiated admin controller.
 * @returns {FastifyPluginAsyncZod} Fastify plugin configuring routes with Zod type provider.
 */
export const createAdminRoutes = (controller: AdminController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    const publicPrefix = `/api/${env.app.apiVersion}`;
    const basePrefix = `/api/${env.app.apiVersion}/admin`;
    const adminGuards = [fastify.authenticate, fastify.requireAdmin];
    const superAdminGuards = [fastify.authenticate, fastify.requireSuperAdmin];

    // 0. Public Ingestion Endpoint for Contact Form
    fastify.post(`${publicPrefix}/contact`, {
      schema: {
        tags: ['Public Support'],
        summary: 'Submit a contact or support inquiry from the public website',
        body: contactSubmissionSchema,
      },
      handler: controller.submitContactInquiry,
    });

    // 1. Platform Overview KPIs & Summary
    fastify.get(`${basePrefix}/overview`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Retrieve platform overview KPIs and summary metrics',
      },
      handler: controller.getOverview,
    });

    // 2. User Governance: Paginated Users List
    fastify.get(`${basePrefix}/users`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Retrieve paginated platform users with search and filtering',
        querystring: adminUsersQuerySchema,
      },
      handler: controller.getUsers,
    });

    // 3. User Governance: Inspect User Detail & Sessions
    fastify.get(`${basePrefix}/users/:id`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Inspect user account details, active sessions, and audit trail',
        params: z.object({
          id: UUIDSchema,
        }),
      },
      handler: controller.getUser,
    });

    // 4. User Governance: Update Role
    fastify.patch(`${basePrefix}/users/:id/role`, {
      preHandler: superAdminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Promote or demote a user account privilege role',
        params: z.object({
          id: UUIDSchema,
        }),
        body: updateUserRoleSchema,
      },
      handler: controller.updateUserRole,
    });

    // 5. User Governance: Update Status (Suspend / Ban / Reactivate)
    fastify.patch(`${basePrefix}/users/:id/status`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Suspend, ban, or reactivate a user account',
        params: z.object({
          id: UUIDSchema,
        }),
        body: updateUserStatusSchema,
      },
      handler: controller.updateUserStatus,
    });

    // 6. Platform Observability: Audit Logs Stream
    fastify.get(`${basePrefix}/activities`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Stream and filter platform-wide audit and activity logs',
        querystring: adminAuditLogsQuerySchema,
      },
      handler: controller.getActivities,
    });

    // 7. Platform Diagnostics: Live Subsystem Telemetry
    fastify.get(`${basePrefix}/services`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin'],
        summary: 'Retrieve comprehensive real-time diagnostics for all platform subsystems',
      },
      handler: controller.getDiagnostics,
    });

    // 8. Database Studio: List All Tables
    fastify.get(`${basePrefix}/database/tables`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Database'],
        summary: 'List all database tables with live row counts and column totals',
      },
      handler: controller.getDbTables,
    });

    // 9. Database Studio: Table Schema Definitions
    fastify.get(`${basePrefix}/database/tables/:table/schema`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Database'],
        summary: 'Inspect column schemas and data types for a specific database table',
        params: z.object({
          table: z.string().min(1).max(64),
        }),
      },
      handler: controller.getDbTableSchema,
    });

    // 10. Database Studio: Paginated Records View
    fastify.get(`${basePrefix}/database/tables/:table/records`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Database'],
        summary: 'Fetch paginated, searchable, and sortable records for any database table',
        params: z.object({
          table: z.string().min(1).max(64),
        }),
        querystring: adminDbRecordsQuerySchema,
      },
      handler: controller.getDbTableRecords,
    });

    // 11. Disaster Recovery: List Backups
    fastify.get(`${basePrefix}/database/backups`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Backups'],
        summary: 'List all local database backup snapshots available on disk',
      },
      handler: controller.getBackups,
    });

    // 12. Disaster Recovery: Create Instant Hot Backup
    fastify.post(`${basePrefix}/database/backups`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Backups'],
        summary: 'Create an online hot backup snapshot of the active SQLite database',
      },
      handler: controller.createBackup,
    });

    // 13. Disaster Recovery: Download Backup File
    fastify.get(`${basePrefix}/database/backups/:filename/download`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Backups'],
        summary: 'Download a specific SQLite database backup snapshot archive',
        params: z.object({
          filename: z.string().min(1).max(255),
        }),
      },
      handler: controller.downloadBackup,
    });

    // 14. Disaster Recovery: Restore Database Snapshot
    fastify.post(`${basePrefix}/database/backups/restore`, {
      preHandler: superAdminGuards,
      schema: {
        tags: ['Super Admin Backups'],
        summary: 'Restore the active database from a selected backup snapshot',
        body: restoreBackupSchema,
      },
      handler: controller.restoreBackup,
    });

    // 15. Disaster Recovery: Upload External Backup File
    fastify.post(`${basePrefix}/database/backups/upload`, {
      preHandler: superAdminGuards,
      schema: {
        tags: ['Super Admin Backups'],
        summary: 'Upload an external SQLite database backup (.sqlite / .db) to the server',
      },
      handler: controller.uploadBackup,
    });

    // 16. Disaster Recovery: Delete Backup Snapshot
    fastify.delete(`${basePrefix}/database/backups/:filename`, {
      preHandler: superAdminGuards,
      schema: {
        tags: ['Super Admin Backups'],
        summary: 'Delete a backup snapshot file from disk',
        params: z.object({
          filename: z.string().min(1).max(255),
        }),
      },
      handler: controller.deleteBackup,
    });

    // 17. Inquiries & Support Governance: Paginated List
    fastify.get(`${basePrefix}/inquiries`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Retrieve paginated contact inquiries with search and filtering',
        querystring: adminInquiriesQuerySchema,
      },
      handler: controller.getInquiries,
    });

    // 18. Inquiries & Support Governance: KPI Statistics
    fastify.get(`${basePrefix}/inquiries/stats`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Retrieve KPI counters and SLA metrics for contact inquiries',
      },
      handler: controller.getInquiryStats,
    });

    // 19. Inquiries & Support Governance: Export Inquiries
    fastify.get(`${basePrefix}/inquiries/export`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Export all contact inquiries for auditing or compliance',
      },
      handler: controller.exportInquiries,
    });

    // 20. Inquiries & Support Governance: Inspect Inquiry Detail & Conversation Thread
    fastify.get(`${basePrefix}/inquiries/:id`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Inspect detailed inquiry records and conversation history',
        params: z.object({
          id: UUIDSchema,
        }),
      },
      handler: controller.getInquiry,
    });

    // 21. Inquiries & Support Governance: Update Status
    fastify.patch(`${basePrefix}/inquiries/:id/status`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Transition lifecycle status of a contact inquiry',
        params: z.object({
          id: UUIDSchema,
        }),
        body: updateInquiryStatusSchema,
      },
      handler: controller.updateInquiryStatus,
    });

    // 22. Inquiries & Support Governance: Assign Inquiry
    fastify.patch(`${basePrefix}/inquiries/:id/assign`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Assign or reassign an inquiry to an administrative staff member',
        params: z.object({
          id: UUIDSchema,
        }),
        body: assignInquirySchema,
      },
      handler: controller.assignInquiry,
    });

    // 23. Inquiries & Support Governance: Add Reply or Internal Note
    fastify.post(`${basePrefix}/inquiries/:id/replies`, {
      preHandler: adminGuards,
      schema: {
        tags: ['Super Admin Support'],
        summary: 'Add an internal note or send an official email reply to the inquiry submitter',
        params: z.object({
          id: UUIDSchema,
        }),
        body: createInquiryReplySchema,
      },
      handler: controller.addInquiryReply,
    });
  };
};
