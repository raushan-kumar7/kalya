import type { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse } from '@/responses';
import { UnauthorizedError } from '@/errors';
import type { User } from '@kalya/types';
import type {
  AdminAuditLogsQueryInput,
  AdminUsersQueryInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from '@kalya/validations';
import { AdminService } from './admin.service';

/**
 * Controller translating administrative HTTP requests into AdminService invocations.
 */
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Helper extracting authenticated User or throwing UnauthorizedError.
   */
  private assertAdminUser(request: FastifyRequest): User {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required to access administrative resource');
    }
    return request.user;
  }

  /**
   * Helper extracting client IP and User-Agent context.
   */
  private getClientContext(request: FastifyRequest) {
    return {
      ip: request.ip || (request.headers['x-forwarded-for'] as string | undefined),
      userAgent: request.headers['user-agent'],
    };
  }

  /**
   * Retrieves high-level platform KPI counters and operational health metrics.
   */
  getOverview = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const stats = await this.adminService.getOverviewStats();
    return ApiResponse.ok(reply, stats, 'Platform overview statistics retrieved successfully');
  };

  /**
   * Retrieves paginated list of all platform users with filtering.
   */
  getUsers = async (
    request: FastifyRequest<{ Querystring: AdminUsersQueryInput }>,
    reply: FastifyReply
  ) => {
    this.assertAdminUser(request);
    const query = request.query ?? {};
    const { users, total } = await this.adminService.listUsers(query);

    return ApiResponse.paginated(
      reply,
      users,
      {
        total,
        limit: query.limit ?? 20,
        page: query.page ?? 1,
      },
      'Users retrieved successfully'
    );
  };

  /**
   * Retrieves detailed user profile, active sessions, and recent audit logs.
   */
  getUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const { id } = request.params;
    const detail = await this.adminService.getUserDetail(id);
    return ApiResponse.ok(reply, detail, 'User details retrieved successfully');
  };

  /**
   * Updates an existing user's privilege role.
   */
  updateUserRole = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserRoleInput }>,
    reply: FastifyReply
  ) => {
    const adminUser = this.assertAdminUser(request);
    const { id } = request.params;
    const clientContext = this.getClientContext(request);

    const updatedUser = await this.adminService.updateUserRole(
      adminUser,
      id,
      request.body,
      clientContext
    );

    return ApiResponse.ok(reply, updatedUser, 'User role updated successfully');
  };

  /**
   * Suspends, bans, or restores a user account, invalidating sessions on deactivation.
   */
  updateUserStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserStatusInput }>,
    reply: FastifyReply
  ) => {
    const adminUser = this.assertAdminUser(request);
    const { id } = request.params;
    const clientContext = this.getClientContext(request);

    const updatedUser = await this.adminService.updateUserStatus(
      adminUser,
      id,
      request.body,
      clientContext
    );

    return ApiResponse.ok(reply, updatedUser, 'User status updated successfully');
  };

  /**
   * Retrieves paginated stream of platform audit logs.
   */
  getActivities = async (
    request: FastifyRequest<{ Querystring: AdminAuditLogsQueryInput }>,
    reply: FastifyReply
  ) => {
    this.assertAdminUser(request);
    const query = request.query ?? {};
    const { logs, total } = await this.adminService.listAuditLogs(query);

    return ApiResponse.paginated(
      reply,
      logs,
      {
        total,
        limit: query.limit ?? 20,
        page: query.page ?? 1,
      },
      'Audit logs retrieved successfully'
    );
  };

  /**
   * Compiles live health diagnostics across SQLite, background workers, and process runtime.
   */
  getDiagnostics = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const diagnostics = await this.adminService.getSubsystemDiagnostics();
    return ApiResponse.ok(reply, diagnostics, 'Subsystem diagnostics retrieved successfully');
  };
}
