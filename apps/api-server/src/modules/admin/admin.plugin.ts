import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { AuditLogService } from './audit-log.service';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { createAdminRoutes } from './admin.routes';

/**
 * Fastify plugin encapsulating the Super-Admin subsystem.
 *
 * @description
 * 1. Instantiates `AuditLogService` and `AdminService`.
 * 2. Mounts authenticated and RBAC-guarded administrative endpoints (`/api/v1/admin/*`).
 */
export const adminPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 1. Instantiate services
    const auditLogService = new AuditLogService(fastify.db);
    const adminService = new AdminService(fastify.db, auditLogService, fastify.healthRegistry);

    // 2. Instantiate controller
    const adminController = new AdminController(adminService);

    // 3. Mount routes
    await fastify.register(createAdminRoutes(adminController));
  },
  {
    name: 'admin-plugin',
    dependencies: ['db-plugin', 'auth-plugin', 'health-plugin'],
  }
);
