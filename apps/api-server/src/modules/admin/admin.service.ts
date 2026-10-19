import {
  and,
  asc,
  count,
  DatabaseClient,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
  schema,
  type UserRow,
} from '@kalya/db';
import { BadRequestError, NotFoundError } from '@/errors';
import type {
  AdminOverviewStats,
  AdminUserDetail,
  AuditLog,
  HealthCheckRegistry,
  SubsystemDiagnostics,
  User,
} from '@kalya/types';
import type {
  AdminAuditLogsQueryInput,
  AdminUsersQueryInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from '@kalya/validations';
import { AuditLogService } from './audit-log.service';

export interface ClientAuditContext {
  ip?: string;
  userAgent?: string;
}

/**
 * Core business service orchestrating platform-wide administrative operations,
 * user governance, audit log queries, and subsystem diagnostics.
 */
export class AdminService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly auditLogService: AuditLogService,
    private readonly healthRegistry: HealthCheckRegistry
  ) {}

  /**
   * Formats a database UserRow into the domain User entity with ISO timestamp strings.
   */
  private formatUser(row: UserRow): User {
    return {
      ...row,
      sync_status: row.sync_status ?? 'SYNCED',
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt).toISOString(),
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date(row.updatedAt).toISOString(),
    } as unknown as User;
  }

  /**
   * Retrieves high-level platform statistics and KPIs for the Super-Admin command center.
   */
  async getOverviewStats(): Promise<AdminOverviewStats> {
    // 1. Total registered users
    const [totalUsersRes] = await this.db.select({ value: count() }).from(schema.user);
    const totalUsers = totalUsersRes?.value ?? 0;

    // 2. Active users today (lastActiveAt within last 24h or valid session)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [activeUsersRes] = await this.db
      .select({ value: count() })
      .from(schema.user)
      .where(gte(schema.user.lastActiveAt, oneDayAgo));
    const activeUsersToday = activeUsersRes?.value ?? 0;

    // 3. New users in the past 7 days (createdAt is stored in timestamp_ms)
    const sevenDaysAgoMs = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersRes] = await this.db
      .select({ value: count() })
      .from(schema.user)
      .where(gte(schema.user.createdAt, sevenDaysAgoMs));
    const newUsersThisWeek = newUsersRes?.value ?? 0;

    // 4. Suspended / Banned users count
    const [suspendedUsersRes] = await this.db
      .select({ value: count() })
      .from(schema.user)
      .where(inArray(schema.user.status, ['SUSPENDED', 'BANNED']));
    const suspendedUsers = suspendedUsersRes?.value ?? 0;

    // 5. System operational status from HealthRegistry
    const detailedHealth = await this.healthRegistry.getDetailedHealth();

    // 6. Background job queue counters
    const [jobsProcessedRes] = await this.db
      .select({ value: count() })
      .from(schema.jobQueue)
      .where(eq(schema.jobQueue.status, 'completed'));
    const jobsProcessedToday = jobsProcessedRes?.value ?? 0;

    const [failedJobsRes] = await this.db
      .select({ value: count() })
      .from(schema.jobQueue)
      .where(eq(schema.jobQueue.status, 'failed'));
    const failedJobs = failedJobsRes?.value ?? 0;

    return {
      totalUsers,
      activeUsersToday,
      newUsersThisWeek,
      suspendedUsers,
      systemStatus: detailedHealth.status,
      jobsProcessedToday,
      activeWorkers: 1, // Kalya background worker singleton
      failedJobs,
    };
  }

  /**
   * Retrieves a paginated list of users with search, role, and status filtering.
   */
  async listUsers(
    query: AdminUsersQueryInput
  ): Promise<{ users: AdminUserDetail[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.search) {
      const searchPattern = `%${query.search}%`;
      conditions.push(
        or(
          like(schema.user.name, searchPattern),
          like(schema.user.email, searchPattern),
          like(schema.user.username, searchPattern)
        )
      );
    }

    if (query.role) {
      conditions.push(eq(schema.user.role, query.role));
    }

    if (query.status) {
      conditions.push(eq(schema.user.status, query.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Get total matching count
    const [countRes] = await this.db
      .select({ value: count() })
      .from(schema.user)
      .where(whereClause);
    const total = countRes?.value ?? 0;

    // 2. Determine sorting
    let orderBy = desc(schema.user.createdAt);
    if (query.sortBy === 'name') {
      orderBy = query.sortOrder === 'asc' ? asc(schema.user.name) : desc(schema.user.name);
    } else if (query.sortBy === 'email') {
      orderBy = query.sortOrder === 'asc' ? asc(schema.user.email) : desc(schema.user.email);
    } else if (query.sortBy === 'lastActiveAt') {
      orderBy =
        query.sortOrder === 'asc' ? asc(schema.user.lastActiveAt) : desc(schema.user.lastActiveAt);
    } else if (query.sortBy === 'createdAt') {
      orderBy =
        query.sortOrder === 'asc' ? asc(schema.user.createdAt) : desc(schema.user.createdAt);
    }

    // 3. Fetch users
    const users = await this.db
      .select()
      .from(schema.user)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // 4. Enrich with active session count
    const userIds = users.map((u) => u.id);
    const sessionCountMap = new Map<string, number>();

    if (userIds.length > 0) {
      const sessionCounts = await this.db
        .select({
          userId: schema.session.userId,
          count: count(),
        })
        .from(schema.session)
        .where(
          and(inArray(schema.session.userId, userIds), gte(schema.session.expiresAt, new Date()))
        )
        .groupBy(schema.session.userId);

      for (const item of sessionCounts) {
        sessionCountMap.set(item.userId, item.count);
      }
    }

    const enrichedUsers: AdminUserDetail[] = users.map((u) => ({
      ...this.formatUser(u),
      activeSessionCount: sessionCountMap.get(u.id) ?? 0,
    }));

    return { users: enrichedUsers, total };
  }

  /**
   * Retrieves comprehensive user profile details, active sessions, and recent audit trail.
   */
  async getUserDetail(userId: string): Promise<{
    user: AdminUserDetail;
    sessions: Array<typeof schema.session.$inferSelect>;
    recentAuditLogs: AuditLog[];
  }> {
    const [foundUser] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!foundUser) {
      throw new NotFoundError(`User with ID "${userId}" does not exist`);
    }

    // Active sessions for this user
    const sessions = await this.db
      .select()
      .from(schema.session)
      .where(eq(schema.session.userId, userId))
      .orderBy(desc(schema.session.createdAt));

    // Recent audit logs related to this user
    const recentAuditLogsRaw = await this.db
      .select()
      .from(schema.auditLogs)
      .where(
        or(
          eq(schema.auditLogs.actorId, userId),
          and(eq(schema.auditLogs.entityType, 'USER'), eq(schema.auditLogs.entityId, userId))
        )
      )
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(20);

    const recentAuditLogs: AuditLog[] = recentAuditLogsRaw.map((log) => ({
      ...log,
      createdAt:
        log.createdAt instanceof Date ? log.createdAt.toISOString() : String(log.createdAt),
      metadata: (log.metadata as Record<string, unknown>) ?? null,
    }));

    // Financial transaction count
    const [expenseCountRes] = await this.db
      .select({ value: count() })
      .from(schema.expense)
      .where(eq(schema.expense.userId, userId));

    const enrichedUser: AdminUserDetail = {
      ...this.formatUser(foundUser),
      activeSessionCount: sessions.length,
      transactionCount: expenseCountRes?.value ?? 0,
    };

    return {
      user: enrichedUser,
      sessions,
      recentAuditLogs,
    };
  }

  /**
   * Updates an existing user's privilege role with self-demotion protection and audit logging.
   */
  async updateUserRole(
    adminUser: User,
    targetUserId: string,
    input: UpdateUserRoleInput,
    clientContext?: ClientAuditContext
  ): Promise<User> {
    // 1. Anti-Lockout: Super-Admin cannot demote themselves
    if (adminUser.id === targetUserId) {
      throw new BadRequestError(
        'Super-Admin accounts cannot alter their own privilege role to prevent administrative lockout',
        'SELF_ROLE_CHANGE_PROHIBITED'
      );
    }

    const [targetUser] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError(`User with ID "${targetUserId}" does not exist`);
    }

    const previousRole = targetUser.role;

    // 2. Update user role
    const [updatedUser] = await this.db
      .update(schema.user)
      .set({ role: input.role })
      .where(eq(schema.user.id, targetUserId))
      .returning();

    // 3. Record audit event
    await this.auditLogService.record({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: 'USER_ROLE_UPDATED',
      entityType: 'USER',
      entityId: targetUserId,
      severity: 'WARN',
      description: `User ${targetUser.email} privilege role changed from [${previousRole}] to [${input.role}]`,
      metadata: {
        targetUserEmail: targetUser.email,
        previousRole,
        newRole: input.role,
        reason: input.reason ?? null,
      },
      ipAddress: clientContext?.ip,
      userAgent: clientContext?.userAgent,
      status: 'SUCCESS',
    });

    return this.formatUser(updatedUser);
  }

  /**
   * Suspends, bans, or restores a user account, automatically revoking sessions on suspension.
   */
  async updateUserStatus(
    adminUser: User,
    targetUserId: string,
    input: UpdateUserStatusInput,
    clientContext?: ClientAuditContext
  ): Promise<User> {
    // 1. Anti-Lockout: Super-Admin cannot suspend or ban themselves
    if (adminUser.id === targetUserId) {
      throw new BadRequestError(
        'Super-Admin accounts cannot suspend or ban themselves',
        'SELF_SUSPENSION_PROHIBITED'
      );
    }

    const [targetUser] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError(`User with ID "${targetUserId}" does not exist`);
    }

    const previousStatus = targetUser.status;
    const isDeactivating = input.status === 'SUSPENDED' || input.status === 'BANNED';

    // 2. Perform DB update
    const [updatedUser] = await this.db
      .update(schema.user)
      .set({
        status: input.status,
        bannedAt: isDeactivating ? new Date().toISOString() : null,
        banReason: isDeactivating ? (input.banReason ?? 'Administrative action') : null,
      })
      .where(eq(schema.user.id, targetUserId))
      .returning();

    // 3. If deactivating, invalidate all current active sessions immediately
    if (isDeactivating) {
      await this.db.delete(schema.session).where(eq(schema.session.userId, targetUserId));
    }

    // 4. Record audit event
    await this.auditLogService.record({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: isDeactivating ? 'USER_ACCOUNT_SUSPENDED' : 'USER_ACCOUNT_REACTIVATED',
      entityType: 'USER',
      entityId: targetUserId,
      severity: isDeactivating ? 'WARN' : 'INFO',
      description: `Account status for ${targetUser.email} changed from [${previousStatus}] to [${input.status}]`,
      metadata: {
        targetUserEmail: targetUser.email,
        previousStatus,
        newStatus: input.status,
        banReason: input.banReason ?? null,
        sessionsRevoked: isDeactivating,
      },
      ipAddress: clientContext?.ip,
      userAgent: clientContext?.userAgent,
      status: 'SUCCESS',
    });

    return this.formatUser(updatedUser);
  }

  /**
   * Streams and filters platform audit logs with pagination.
   */
  async listAuditLogs(
    query: AdminAuditLogsQueryInput
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.actorId) {
      conditions.push(eq(schema.auditLogs.actorId, query.actorId));
    }

    if (query.action) {
      conditions.push(eq(schema.auditLogs.action, query.action));
    }

    if (query.entityType) {
      conditions.push(eq(schema.auditLogs.entityType, query.entityType));
    }

    if (query.severity) {
      conditions.push(eq(schema.auditLogs.severity, query.severity));
    }

    if (query.status) {
      conditions.push(eq(schema.auditLogs.status, query.status));
    }

    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(schema.auditLogs.description, pattern),
          like(schema.auditLogs.actorEmail, pattern),
          like(schema.auditLogs.action, pattern)
        )
      );
    }

    if (query.startDate) {
      conditions.push(gte(schema.auditLogs.createdAt, new Date(query.startDate)));
    }

    if (query.endDate) {
      conditions.push(lte(schema.auditLogs.createdAt, new Date(query.endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await this.db
      .select({ value: count() })
      .from(schema.auditLogs)
      .where(whereClause);
    const total = totalRes?.value ?? 0;

    const rows = await this.db
      .select()
      .from(schema.auditLogs)
      .where(whereClause)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const logs: AuditLog[] = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      metadata: (r.metadata as Record<string, unknown>) ?? null,
    }));

    return { logs, total };
  }

  /**
   * Compiles detailed live health diagnostics across SQLite, background workers, and process runtime.
   */
  async getSubsystemDiagnostics(): Promise<SubsystemDiagnostics> {
    const detailedHealth = await this.healthRegistry.getDetailedHealth();

    // 1. Table record counts
    const [[userCount], [sessionCount], [auditCount], [expenseCount]] = await Promise.all([
      this.db.select({ val: count() }).from(schema.user),
      this.db.select({ val: count() }).from(schema.session),
      this.db.select({ val: count() }).from(schema.auditLogs),
      this.db.select({ val: count() }).from(schema.expense),
    ]);

    // 2. Job Queue breakdown
    const jobStatuses = await this.db
      .select({
        status: schema.jobQueue.status,
        count: count(),
      })
      .from(schema.jobQueue)
      .groupBy(schema.jobQueue.status);

    const queueDepths = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const item of jobStatuses) {
      if (item.status === 'pending') queueDepths.pending = item.count;
      else if (item.status === 'processing') queueDepths.processing = item.count;
      else if (item.status === 'completed') queueDepths.completed = item.count;
      else if (item.status === 'failed') queueDepths.failed = item.count;
    }

    // 3. Process runtime memory
    const mem = process.memoryUsage();

    return {
      ...detailedHealth,
      sqlite: {
        journalMode: 'WAL',
        tableCounts: {
          users: userCount?.val ?? 0,
          sessions: sessionCount?.val ?? 0,
          auditLogs: auditCount?.val ?? 0,
          expenses: expenseCount?.val ?? 0,
        },
      },
      jobQueue: {
        activeWorkers: 1,
        queueDepths,
      },
      process: {
        memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      },
    };
  }
}
