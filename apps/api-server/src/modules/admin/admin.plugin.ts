import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { AuditLogService } from './audit-log.service';
import { AdminService } from './admin.service';
import { ContactInquiryService } from './contact-inquiry.service';
import { AdminController } from './admin.controller';
import { createAdminRoutes } from './admin.routes';

/**
 * Fastify plugin encapsulating the Super-Admin subsystem.
 *
 * @description
 * 1. Instantiates `AuditLogService`, `AdminService`, and `ContactInquiryService`.
 * 2. Mounts authenticated and RBAC-guarded administrative endpoints (`/api/v1/admin/*`)
 *    and the public contact intake endpoint (`/api/v1/contact`).
 */
export const adminPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // 1. Instantiate services
    const auditLogService = new AuditLogService(fastify.db);
    const adminService = new AdminService(fastify.db, auditLogService, fastify.healthRegistry);
    const contactInquiryService = new ContactInquiryService(fastify.db, auditLogService);

    // 2. Instantiate controller
    const adminController = new AdminController(adminService, contactInquiryService);

    // 3. Mount routes
    await fastify.register(createAdminRoutes(adminController));
  },
  {
    name: 'admin-plugin',
    dependencies: ['db-plugin', 'auth-plugin', 'health-plugin'],
  }
);
