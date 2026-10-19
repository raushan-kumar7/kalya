import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { env } from '@kalya/env';
import {
  adminAuditLogsQuerySchema,
  adminUsersQuerySchema,
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
    const basePrefix = `/api/${env.app.apiVersion}/admin`;
    const adminGuards = [fastify.authenticate, fastify.requireSuperAdmin];

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
      preHandler: adminGuards,
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
  };
};
