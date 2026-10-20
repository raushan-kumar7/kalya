import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { findRoot } from '@kalya/env';
import {
  and,
  asc,
  count,
  Database,
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
  DbBackupInfo,
  DbColumnDefinition,
  DbTableRecordsResult,
  DbTableSummary,
  HealthCheckRegistry,
  SubsystemDiagnostics,
  User,
} from '@kalya/types';
import type {
  AdminAuditLogsQueryInput,
  AdminDbRecordsQueryInput,
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

  /**
   * Resolves or creates the local backup archive directory.
   */
  getBackupsDir(): string {
    const root = findRoot();
    const dir = process.env.BACKUP_DIR || path.join(root, 'backups');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Retrieves summary list of all database tables with live row counts and column totals.
   */
  async getDbTables(): Promise<DbTableSummary[]> {
    const client = (this.db as unknown as { $client: Database.Database }).$client;
    if (!client) {
      throw new Error('Underlying SQLite database driver not accessible');
    }

    const rows = client
      .prepare(
        `SELECT name FROM sqlite_master 
         WHERE type = 'table' 
           AND name NOT LIKE 'sqlite_%' 
           AND name NOT LIKE 'drizzle_%' 
           AND name NOT LIKE '_litestream%' 
         ORDER BY name ASC`
      )
      .all() as { name: string }[];

    const summaries: DbTableSummary[] = [];
    for (const { name } of rows) {
      try {
        const countRes = client.prepare(`SELECT count(*) as count FROM "${name}"`).get() as {
          count: number;
        };
        const cols = client.prepare(`PRAGMA table_info("${name}")`).all() as unknown[];
        summaries.push({
          name,
          rowCount: countRes?.count ?? 0,
          columnCount: cols.length,
        });
      } catch {
        // Skip unreadable internal tables
      }
    }

    return summaries;
  }

  /**
   * Retrieves column definitions and metadata for a specific database table.
   */
  async getDbTableSchema(tableName: string): Promise<DbColumnDefinition[]> {
    const client = (this.db as unknown as { $client: Database.Database }).$client;
    if (!client) throw new Error('Underlying SQLite database driver not accessible');

    const tableExists = client
      .prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?`)
      .get(tableName);

    if (!tableExists) {
      throw new NotFoundError(`Database table "${tableName}" does not exist`);
    }

    const columns = client
      .prepare(`PRAGMA table_info("${tableName}")`)
      .all() as DbColumnDefinition[];
    return columns;
  }

  /**
   * Fetches paginated, searchable, and sortable records for any database table in the Studio.
   */
  async getDbTableRecords(
    tableName: string,
    query: AdminDbRecordsQueryInput
  ): Promise<DbTableRecordsResult> {
    const client = (this.db as unknown as { $client: Database.Database }).$client;
    if (!client) throw new Error('Underlying SQLite database driver not accessible');

    const tableExists = client
      .prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?`)
      .get(tableName);

    if (!tableExists) {
      throw new NotFoundError(`Database table "${tableName}" does not exist`);
    }

    const columns = client
      .prepare(`PRAGMA table_info("${tableName}")`)
      .all() as DbColumnDefinition[];
    const columnNames = columns.map((c) => c.name);

    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (query.search) {
      const searchClauses = columnNames.map((col) => `"${col}" LIKE ?`);
      whereClauses.push(`(${searchClauses.join(' OR ')})`);
      const searchParam = `%${query.search}%`;
      for (let i = 0; i < columnNames.length; i++) {
        params.push(searchParam);
      }
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT count(*) as total FROM "${tableName}" ${whereStr}`;
    const countRes = client.prepare(countQuery).get(...params) as { total: number };
    const total = countRes?.total ?? 0;

    let orderByStr = '';
    if (query.sortBy && columnNames.includes(query.sortBy)) {
      const order = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
      orderByStr = `ORDER BY "${query.sortBy}" ${order}`;
    } else {
      const pkCol = columns.find((c) => c.pk === 1) || columns[0];
      if (pkCol) {
        orderByStr = `ORDER BY "${pkCol.name}" DESC`;
      }
    }

    const recordsQuery = `SELECT * FROM "${tableName}" ${whereStr} ${orderByStr} LIMIT ? OFFSET ?`;
    const records = client.prepare(recordsQuery).all(...params, limit, offset) as Record<
      string,
      unknown
    >[];

    return {
      table: tableName,
      columns,
      records,
      total,
      page,
      limit,
    };
  }

  /**
   * Lists all existing backup files on disk with timestamps and sizes.
   */
  async listBackups(): Promise<DbBackupInfo[]> {
    const backupsDir = this.getBackupsDir();
    const files = readdirSync(backupsDir);
    const backups: DbBackupInfo[] = [];

    for (const file of files) {
      if (file.endsWith('.sqlite') || file.endsWith('.db') || file.endsWith('.tar.gz')) {
        const fullPath = path.join(backupsDir, file);
        const stats = statSync(fullPath);
        backups.push({
          filename: file,
          sizeBytes: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          createdAt: stats.mtime.toISOString(),
        });
      }
    }

    return backups.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  /**
   * Creates an online hot backup copy of the active database with WAL checkpointing.
   */
  async createBackup(actor: User, clientContext?: ClientAuditContext): Promise<DbBackupInfo> {
    const client = (this.db as unknown as { $client: Database.Database }).$client;
    if (!client) throw new Error('Underlying SQLite database driver not accessible');

    const backupsDir = this.getBackupsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `kalya_backup_${timestamp}.sqlite`;
    const destPath = path.join(backupsDir, filename);

    // Flush and checkpoint WAL frames
    try {
      client.pragma('wal_checkpoint(TRUNCATE)');
    } catch {
      // Non-fatal
    }

    // Execute SQLite hot backup
    await client.backup(destPath);

    const stats = statSync(destPath);
    const backupInfo: DbBackupInfo = {
      filename,
      sizeBytes: stats.size,
      sizeFormatted: this.formatBytes(stats.size),
      createdAt: stats.mtime.toISOString(),
    };

    // Record audit log
    await this.auditLogService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'DATABASE_BACKUP_CREATED',
      entityType: 'DATABASE',
      entityId: filename,
      severity: 'INFO',
      description: `Manual database backup created: ${filename} (${backupInfo.sizeFormatted})`,
      metadata: {
        filename,
        sizeBytes: stats.size,
        destination: destPath,
      },
      ipAddress: clientContext?.ip,
      userAgent: clientContext?.userAgent,
      status: 'SUCCESS',
    });

    return backupInfo;
  }

  /**
   * Restores the database from an existing backup snapshot file.
   * Automatically takes a pre-restore checkpoint to guarantee rollback safety.
   */
  async restoreBackup(
    filename: string,
    actor: User,
    clientContext?: ClientAuditContext
  ): Promise<{ success: boolean; message: string; preRestoreBackup: string }> {
    if (path.basename(filename) !== filename) {
      throw new BadRequestError('Invalid backup filename', 'INVALID_FILENAME');
    }

    const backupsDir = this.getBackupsDir();
    const sourcePath = path.join(backupsDir, filename);

    if (!existsSync(sourcePath)) {
      throw new NotFoundError(`Backup file "${filename}" does not exist in backups directory`);
    }

    const client = (this.db as unknown as { $client: Database.Database }).$client;
    if (!client) throw new Error('Underlying SQLite database driver not accessible');

    // 1. Validate source database integrity before touching live database
    const sourceDb = new Database(sourcePath, { readonly: true });
    try {
      sourceDb.prepare('SELECT 1').get();
      const backupTables = sourceDb
        .prepare(
          `SELECT count(*) as count FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
        )
        .get() as { count: number };
      if (!backupTables || backupTables.count === 0) {
        throw new Error('Backup database contains no tables');
      }
    } catch (err) {
      throw new BadRequestError(
        `Invalid or corrupt backup file "${filename}": ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      sourceDb.close();
    }

    // 2. Create emergency pre-restore snapshot
    const preRestoreFilename = `pre_restore_safety_${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`;
    const preRestorePath = path.join(backupsDir, preRestoreFilename);

    try {
      client.pragma('wal_checkpoint(TRUNCATE)');
    } catch {
      // Non-fatal
    }

    await client.backup(preRestorePath);

    // 3. Atomically restore tables inside active connection via ATTACH DATABASE
    try {
      // Snapshot the current admin actor and their active sessions so that the admin is not logged out with 401
      let currentActorRecord: Record<string, unknown> | undefined;
      let currentSessionRecords: Record<string, unknown>[] = [];

      try {
        currentActorRecord = client
          .prepare('SELECT * FROM main.user WHERE id = ?')
          .get(actor.id) as Record<string, unknown> | undefined;
        currentSessionRecords = client
          .prepare('SELECT * FROM main.session WHERE user_id = ?')
          .all(actor.id) as Record<string, unknown>[];
      } catch {
        // Fallback if user or session table is missing
      }

      client.pragma('foreign_keys = OFF');
      const escapedSourcePath = sourcePath.replace(/'/g, "''");
      client.exec(`ATTACH DATABASE '${escapedSourcePath}' AS backup_db`);

      const restoreTransaction = client.transaction(() => {
        // Fetch all tables from backup and main
        const backupTables = client
          .prepare(
            `SELECT name, sql FROM backup_db.sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
          )
          .all() as { name: string; sql: string }[];

        const mainTables = client
          .prepare(
            `SELECT name FROM main.sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
          )
          .all() as { name: string }[];

        // Drop tables in main that are not in backup
        const backupTableNames = new Set(backupTables.map((t) => t.name));
        for (const table of mainTables) {
          if (!backupTableNames.has(table.name)) {
            client.exec(`DROP TABLE IF EXISTS main."${table.name}"`);
          }
        }

        // Drop and recreate all tables from backup
        for (const table of backupTables) {
          client.exec(`DROP TABLE IF EXISTS main."${table.name}"`);
          client.exec(table.sql);
          client.exec(`INSERT INTO main."${table.name}" SELECT * FROM backup_db."${table.name}"`);
        }

        // Recreate indexes from backup
        const backupIndexes = client
          .prepare(
            `SELECT name, sql FROM backup_db.sqlite_master WHERE type = 'index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'`
          )
          .all() as { name: string; sql: string }[];

        for (const idx of backupIndexes) {
          try {
            client.exec(idx.sql);
          } catch {
            // Non-fatal if index was automatically created by UNIQUE or PRIMARY KEY constraint
          }
        }

        // Restore current admin user and active sessions if needed so the admin retains access
        if (currentActorRecord) {
          const actorInRestored = client
            .prepare('SELECT id FROM main.user WHERE id = ?')
            .get(actor.id);
          if (!actorInRestored) {
            const cols = Object.keys(currentActorRecord);
            const placeholders = cols.map(() => '?').join(', ');
            client
              .prepare(
                `INSERT OR REPLACE INTO main.user (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})`
              )
              .run(...Object.values(currentActorRecord));
          }
        }

        if (currentSessionRecords.length > 0) {
          for (const sess of currentSessionRecords) {
            const sessInRestored = client
              .prepare('SELECT id FROM main.session WHERE id = ?')
              .get((sess as { id: string }).id);
            if (!sessInRestored) {
              const cols = Object.keys(sess);
              const placeholders = cols.map(() => '?').join(', ');
              client
                .prepare(
                  `INSERT OR REPLACE INTO main.session (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})`
                )
                .run(...Object.values(sess));
            }
          }
        }
      });

      restoreTransaction.exclusive();
    } catch (err) {
      throw new Error(
        `Failed to restore database from "${filename}": ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      try {
        client.exec('DETACH DATABASE backup_db');
      } catch {
        // Non-fatal
      }
      client.pragma('foreign_keys = ON');
      try {
        client.pragma('wal_checkpoint(TRUNCATE)');
      } catch {
        // Non-fatal
      }
    }

    // 4. Record audit trail
    await this.auditLogService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'DATABASE_RESTORED',
      entityType: 'DATABASE',
      entityId: filename,
      severity: 'WARN',
      description: `Emergency database restore executed from backup: ${filename}. Pre-restore snapshot created at: ${preRestoreFilename}`,
      metadata: {
        restoredFrom: filename,
        preRestoreSafetySnapshot: preRestoreFilename,
      },
      ipAddress: clientContext?.ip,
      userAgent: clientContext?.userAgent,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: `Database successfully restored from ${filename}`,
      preRestoreBackup: preRestoreFilename,
    };
  }

  /**
   * Deletes a backup snapshot file from disk.
   */
  async deleteBackup(
    filename: string,
    actor: User,
    clientContext?: ClientAuditContext
  ): Promise<{ success: boolean }> {
    if (path.basename(filename) !== filename) {
      throw new BadRequestError('Invalid backup filename', 'INVALID_FILENAME');
    }

    const backupsDir = this.getBackupsDir();
    const targetPath = path.join(backupsDir, filename);

    if (!existsSync(targetPath)) {
      throw new NotFoundError(`Backup file "${filename}" not found`);
    }

    unlinkSync(targetPath);

    await this.auditLogService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'DATABASE_BACKUP_DELETED',
      entityType: 'DATABASE',
      entityId: filename,
      severity: 'INFO',
      description: `Backup archive deleted: ${filename}`,
      metadata: { filename },
      ipAddress: clientContext?.ip,
      userAgent: clientContext?.userAgent,
      status: 'SUCCESS',
    });

    return { success: true };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
