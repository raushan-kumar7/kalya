import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse } from '@/responses';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/errors';
import type { User } from '@kalya/types';
import type {
  AdminAuditLogsQueryInput,
  AdminDbRecordsQueryInput,
  AdminInquiriesQueryInput,
  AdminUsersQueryInput,
  AssignInquiryInput,
  ContactSubmissionInput,
  CreateInquiryReplyInput,
  RestoreBackupInput,
  UpdateInquiryStatusInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from '@kalya/validations';
import { AdminService } from './admin.service';
import { ContactInquiryService, type ActorContext } from './contact-inquiry.service';

/**
 * Controller translating administrative HTTP requests into AdminService invocations.
 */
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly contactInquiryService: ContactInquiryService
  ) {}

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

  /**
   * Retrieves summary list of all database tables with row and column counts.
   */
  getDbTables = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const tables = await this.adminService.getDbTables();
    return ApiResponse.ok(reply, tables, 'Database tables retrieved successfully');
  };

  /**
   * Retrieves schema column definitions for a specific database table.
   */
  getDbTableSchema = async (
    request: FastifyRequest<{ Params: { table: string } }>,
    reply: FastifyReply
  ) => {
    this.assertAdminUser(request);
    const { table } = request.params;
    const columns = await this.adminService.getDbTableSchema(table);
    return ApiResponse.ok(reply, columns, `Schema for table "${table}" retrieved successfully`);
  };

  /**
   * Retrieves paginated, searchable, and sortable records for a database table.
   */
  getDbTableRecords = async (
    request: FastifyRequest<{ Params: { table: string }; Querystring: AdminDbRecordsQueryInput }>,
    reply: FastifyReply
  ) => {
    this.assertAdminUser(request);
    const { table } = request.params;
    const query = request.query ?? {};
    const result = await this.adminService.getDbTableRecords(table, query);

    return ApiResponse.paginated(
      reply,
      result.records,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
      `Records for table "${table}" retrieved successfully`
    );
  };

  /**
   * Lists all existing database backup files.
   */
  getBackups = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const backups = await this.adminService.listBackups();
    return ApiResponse.ok(reply, backups, 'Database backups retrieved successfully');
  };

  /**
   * Creates an immediate online hot backup snapshot of the database.
   */
  createBackup = async (request: FastifyRequest, reply: FastifyReply) => {
    const adminUser = this.assertAdminUser(request);
    const clientContext = this.getClientContext(request);
    const backup = await this.adminService.createBackup(adminUser, clientContext);
    return ApiResponse.created(reply, backup, 'Database backup created successfully');
  };

  /**
   * Downloads a specific database backup archive file.
   */
  downloadBackup = async (
    request: FastifyRequest<{ Params: { filename: string } }>,
    reply: FastifyReply
  ) => {
    this.assertAdminUser(request);
    const { filename } = request.params;

    if (path.basename(filename) !== filename) {
      throw new BadRequestError('Invalid backup filename');
    }

    const backupsDir = this.adminService.getBackupsDir();
    const filePath = path.join(backupsDir, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundError(`Backup file "${filename}" does not exist`);
    }

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    const stream = createReadStream(filePath);
    return reply.send(stream);
  };

  /**
   * Restores the database from an existing backup snapshot.
   */
  restoreBackup = async (
    request: FastifyRequest<{ Body: RestoreBackupInput }>,
    reply: FastifyReply
  ) => {
    const adminUser = this.assertAdminUser(request);
    const clientContext = this.getClientContext(request);
    const { filename } = request.body;

    const result = await this.adminService.restoreBackup(filename, adminUser, clientContext);
    return ApiResponse.ok(reply, result, result.message);
  };

  /**
   * Uploads an external backup file (.sqlite / .db) to the server.
   */
  uploadBackup = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);

    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file provided in multipart request');
    }

    const ext = path.extname(file.filename).toLowerCase();
    if (ext !== '.sqlite' && ext !== '.db') {
      throw new BadRequestError('Uploaded file must be a SQLite database (.sqlite or .db)');
    }

    const safeFilename = `uploaded_${Date.now()}_${path.basename(file.filename)}`;
    const backupsDir = this.adminService.getBackupsDir();
    const targetPath = path.join(backupsDir, safeFilename);

    await pipeline(file.file, createWriteStream(targetPath));

    const backups = await this.adminService.listBackups();
    const uploaded = backups.find((b) => b.filename === safeFilename);

    return ApiResponse.created(
      reply,
      uploaded,
      `Backup file "${safeFilename}" uploaded successfully`
    );
  };

  /**
   * Deletes an existing database backup snapshot from disk.
   */
  deleteBackup = async (
    request: FastifyRequest<{ Params: { filename: string } }>,
    reply: FastifyReply
  ) => {
    const adminUser = this.assertAdminUser(request);
    const clientContext = this.getClientContext(request);
    const { filename } = request.params;

    const result = await this.adminService.deleteBackup(filename, adminUser, clientContext);
    return ApiResponse.ok(reply, result, `Backup "${filename}" deleted successfully`);
  };

  /**
   * Public contact form submission intake.
   */
  submitContactInquiry = async (
    request: FastifyRequest<{ Body: ContactSubmissionInput }>,
    reply: FastifyReply
  ) => {
    const meta = {
      ipAddress: request.ip || (request.headers['x-forwarded-for'] as string | undefined),
      userAgent: request.headers['user-agent'],
      userId: request.user?.id,
    };
    const result = await this.contactInquiryService.createInquiry(request.body, meta);
    return ApiResponse.created(reply, result, result.message);
  };

  /**
   * Retrieves paginated contact inquiries in admin console.
   */
  getInquiries = async (
    request: FastifyRequest<{ Querystring: AdminInquiriesQueryInput }>,
    reply: FastifyReply
  ) => {
    this.assertAdminUser(request);
    const query = request.query ?? {};
    const { inquiries, meta } = await this.contactInquiryService.getInquiries(query);
    return ApiResponse.paginated(reply, inquiries, meta, 'Inquiries retrieved successfully');
  };

  /**
   * Retrieves KPI summary statistics for Support Inquiries.
   */
  getInquiryStats = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const stats = await this.contactInquiryService.getInquiryStats();
    return ApiResponse.ok(reply, stats, 'Inquiry statistics retrieved successfully');
  };

  /**
   * Inspects detailed inquiry records and conversation thread.
   */
  getInquiry = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const inquiry = await this.contactInquiryService.getInquiryById(request.params.id);
    return ApiResponse.ok(reply, inquiry, 'Inquiry retrieved successfully');
  };

  /**
   * Transitions status of a contact inquiry.
   */
  updateInquiryStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateInquiryStatusInput }>,
    reply: FastifyReply
  ) => {
    const user = this.assertAdminUser(request);
    const actor: ActorContext = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
    const inquiry = await this.contactInquiryService.updateStatus(
      request.params.id,
      request.body.status,
      actor
    );
    return ApiResponse.ok(reply, inquiry, 'Inquiry status updated successfully');
  };

  /**
   * Assigns an inquiry to an administrative staff member.
   */
  assignInquiry = async (
    request: FastifyRequest<{ Params: { id: string }; Body: AssignInquiryInput }>,
    reply: FastifyReply
  ) => {
    const user = this.assertAdminUser(request);
    const actor: ActorContext = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
    const inquiry = await this.contactInquiryService.assignInquiry(
      request.params.id,
      request.body.assignedToId,
      actor
    );
    return ApiResponse.ok(reply, inquiry, 'Inquiry assigned successfully');
  };

  /**
   * Adds an internal note or sends an official email reply to the customer.
   */
  addInquiryReply = async (
    request: FastifyRequest<{ Params: { id: string }; Body: CreateInquiryReplyInput }>,
    reply: FastifyReply
  ) => {
    const user = this.assertAdminUser(request);
    const actor: ActorContext = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
    const replyRecord = await this.contactInquiryService.addReply(
      request.params.id,
      request.body,
      actor
    );
    return ApiResponse.created(
      reply,
      replyRecord,
      request.body.type === 'PUBLIC_REPLY'
        ? 'Reply sent to visitor successfully'
        : 'Internal note added successfully'
    );
  };

  /**
   * Data export for compliance / DPDP auditing.
   */
  exportInquiries = async (request: FastifyRequest, reply: FastifyReply) => {
    this.assertAdminUser(request);
    const inquiries = await this.contactInquiryService.exportInquiries();
    return ApiResponse.ok(reply, inquiries, 'Inquiries exported successfully');
  };
}
