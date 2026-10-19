import {
  and,
  asc,
  count,
  DatabaseClient,
  desc,
  eq,
  inArray,
  like,
  lte,
  or,
  schema,
} from '@kalya/db';
import { BadRequestError, NotFoundError } from '@/errors';
import { log } from '@/logger';
import { getMailer } from '@/libs/mail';
import { ContactReceivedNotice, ContactReplyNotice } from '@kalya/email';
import type {
  ContactInquiry,
  ContactInquiryPriority,
  ContactInquiryReply,
  ContactInquiryStats,
  ContactInquiryStatus,
} from '@kalya/types';
import type { PaginationInput } from '@/responses';
import type {
  AdminInquiriesQueryInput,
  ContactSubmissionInput,
  CreateInquiryReplyInput,
} from '@kalya/validations';
import { AuditLogService } from './audit-log.service';

export interface ClientInquiryContext {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export interface ActorContext {
  id: string;
  name: string;
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ContactInquiryService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly auditLogService: AuditLogService
  ) {}

  /**
   * Helper to format a database inquiry row into standard domain ContactInquiry.
   */
  private formatInquiry(
    row: typeof schema.contactInquiries.$inferSelect,
    assignedUser?: { name: string; email: string } | null,
    replyCount = 0,
    replies?: ContactInquiryReply[]
  ): ContactInquiry {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      topic: row.topic as ContactInquiry['topic'],
      message: row.message,
      status: row.status as ContactInquiryStatus,
      priority: row.priority as ContactInquiryPriority,
      userId: row.userId,
      assignedToId: row.assignedToId,
      assignedToName: assignedUser?.name ?? null,
      assignedToEmail: assignedUser?.email ?? null,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      slaDueDate: row.slaDueDate,
      resolvedAt: row.resolvedAt,
      resolvedById: row.resolvedById,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt).toISOString(),
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date(row.updatedAt).toISOString(),
      replyCount,
      replies,
    };
  }

  /**
   * Public submission intake. Validates honeypot, assigns SLA, persists in DB,
   * creates audit log, and dispatches automated confirmation email.
   */
  async createInquiry(
    input: ContactSubmissionInput,
    context: ClientInquiryContext
  ): Promise<{ id: string; referenceNumber: string; message: string }> {
    // 1. Honeypot check: Silent drop if bot populated _company_hp
    if (input._company_hp && input._company_hp.length > 0) {
      log.info('Honeypot triggered on contact form submission - silent discard', {
        email: input.email,
        ip: context.ipAddress,
      });
      return {
        id: 'inq_discarded',
        referenceNumber: 'KAL-0000',
        message: 'Your inquiry has been received.',
      };
    }

    // 2. Determine Priority & SLA based on topic
    let priority: ContactInquiryPriority = 'NORMAL';
    let slaHours = 72; // Default 3 days

    if (input.topic === 'Privacy request') {
      priority = 'URGENT';
      slaHours = 48; // DPDP 2023 Statutory SLA: 2 working days
    } else if (input.topic === 'Report a problem') {
      priority = 'HIGH';
      slaHours = 48;
    }

    const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    // 3. Persist in database
    const [inquiry] = await this.db
      .insert(schema.contactInquiries)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        topic: input.topic,
        message: input.message,
        status: 'NEW',
        priority,
        userId: context.userId ?? null,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        slaDueDate,
      })
      .returning();

    const referenceNumber = `KAL-${inquiry.id.slice(0, 6).toUpperCase()}`;

    // 4. Record structured audit log
    await this.auditLogService.record({
      actorId: context.userId,
      actorEmail: input.email,
      action: 'CONTACT_INQUIRY_RECEIVED',
      entityType: 'CONTACT_INQUIRY',
      entityId: inquiry.id,
      severity: input.topic === 'Privacy request' ? 'WARN' : 'INFO',
      description: `Inquiry received: "${input.topic}" from ${input.name} <${input.email}> [Ref: ${referenceNumber}]`,
      metadata: {
        topic: input.topic,
        priority,
        slaDueDate,
        referenceNumber,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    // 5. Asynchronous Confirmation Email to Visitor
    try {
      const mailer = getMailer();
      const subject = `[Kalya Support] We received your message: ${input.topic} (${referenceNumber})`;

      void mailer
        .sendTemplate({
          to: input.email,
          subject,
          template: ContactReceivedNotice,
          props: {
            userName: input.name,
            userEmail: input.email,
            referenceNumber,
            topic: input.topic,
            message: input.message,
            expectedResponse: 'Within 2 working days',
          },
        })
        .catch((err) => {
          log.warn('Could not dispatch inquiry confirmation email', {
            error: err instanceof Error ? err.message : String(err),
            email: input.email,
          });
        });
    } catch (mailErr) {
      log.warn('Mailer unavailable for inquiry confirmation', {
        error: mailErr instanceof Error ? mailErr.message : String(mailErr),
      });
    }

    return {
      id: inquiry.id,
      referenceNumber,
      message: 'Your inquiry has been received. A confirmation has been emailed to you.',
    };
  }

  /**
   * Retrieves paginated contact inquiries with filtering for the Admin Console.
   */
  async getInquiries(
    query?: AdminInquiriesQueryInput
  ): Promise<{ inquiries: ContactInquiry[]; meta: PaginationInput }> {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query?.status) {
      conditions.push(eq(schema.contactInquiries.status, query.status));
    }

    if (query?.topic) {
      conditions.push(eq(schema.contactInquiries.topic, query.topic));
    }

    if (query?.priority) {
      conditions.push(eq(schema.contactInquiries.priority, query.priority));
    }

    if (query?.search && query.search.trim() !== '') {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          like(schema.contactInquiries.name, term),
          like(schema.contactInquiries.email, term),
          like(schema.contactInquiries.message, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total matches
    const [countResult] = await this.db
      .select({ total: count() })
      .from(schema.contactInquiries)
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);

    // Sorting
    let sortColumn: any = schema.contactInquiries.createdAt;
    if (query?.sortBy === 'slaDueDate') sortColumn = schema.contactInquiries.slaDueDate;
    if (query?.sortBy === 'name') sortColumn = schema.contactInquiries.name;
    if (query?.sortBy === 'status') sortColumn = schema.contactInquiries.status;
    if (query?.sortBy === 'priority') sortColumn = schema.contactInquiries.priority;

    const orderFn = query?.sortOrder === 'asc' ? asc : desc;

    // Fetch inquiries joined with assigned user
    const rows = await this.db
      .select({
        inquiry: schema.contactInquiries,
        assignedUser: {
          name: schema.user.name,
          email: schema.user.email,
        },
      })
      .from(schema.contactInquiries)
      .leftJoin(schema.user, eq(schema.contactInquiries.assignedToId, schema.user.id))
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    // Fetch reply counts in batch
    const inquiryIds = rows.map((r) => r.inquiry.id);
    const replyCountMap = new Map<string, number>();

    if (inquiryIds.length > 0) {
      const replyCounts = await this.db
        .select({
          inquiryId: schema.contactInquiryReplies.inquiryId,
          total: count(),
        })
        .from(schema.contactInquiryReplies)
        .where(inArray(schema.contactInquiryReplies.inquiryId, inquiryIds))
        .groupBy(schema.contactInquiryReplies.inquiryId);

      for (const rc of replyCounts) {
        replyCountMap.set(rc.inquiryId, Number(rc.total));
      }
    }

    const inquiries: ContactInquiry[] = rows.map((r) =>
      this.formatInquiry(
        r.inquiry,
        r.assignedUser?.name ? r.assignedUser : null,
        replyCountMap.get(r.inquiry.id) ?? 0
      )
    );

    return {
      inquiries,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Retrieves KPI summary metrics for the Admin Inquiries dashboard.
   */
  async getInquiryStats(): Promise<ContactInquiryStats> {
    const urgentThresholdIso = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    const [totalRow] = await this.db.select({ count: count() }).from(schema.contactInquiries);
    const [newRow] = await this.db
      .select({ count: count() })
      .from(schema.contactInquiries)
      .where(eq(schema.contactInquiries.status, 'NEW'));
    const [inReviewRow] = await this.db
      .select({ count: count() })
      .from(schema.contactInquiries)
      .where(eq(schema.contactInquiries.status, 'IN_REVIEW'));
    const [resolvedRow] = await this.db
      .select({ count: count() })
      .from(schema.contactInquiries)
      .where(eq(schema.contactInquiries.status, 'RESOLVED'));

    const [privacyRow] = await this.db
      .select({ count: count() })
      .from(schema.contactInquiries)
      .where(
        and(
          eq(schema.contactInquiries.topic, 'Privacy request'),
          or(
            eq(schema.contactInquiries.status, 'NEW'),
            eq(schema.contactInquiries.status, 'IN_REVIEW')
          )
        )
      );

    const [slaAtRiskRow] = await this.db
      .select({ count: count() })
      .from(schema.contactInquiries)
      .where(
        and(
          or(
            eq(schema.contactInquiries.status, 'NEW'),
            eq(schema.contactInquiries.status, 'IN_REVIEW')
          ),
          lte(schema.contactInquiries.slaDueDate, urgentThresholdIso)
        )
      );

    return {
      total: Number(totalRow?.count ?? 0),
      new: Number(newRow?.count ?? 0),
      inReview: Number(inReviewRow?.count ?? 0),
      resolved: Number(resolvedRow?.count ?? 0),
      privacyRequests: Number(privacyRow?.count ?? 0),
      slaAtRisk: Number(slaAtRiskRow?.count ?? 0),
    };
  }

  /**
   * Inspects detailed inquiry records and all associated replies/notes.
   */
  async getInquiryById(id: string): Promise<ContactInquiry> {
    const [row] = await this.db
      .select({
        inquiry: schema.contactInquiries,
        assignedUser: {
          name: schema.user.name,
          email: schema.user.email,
        },
      })
      .from(schema.contactInquiries)
      .leftJoin(schema.user, eq(schema.contactInquiries.assignedToId, schema.user.id))
      .where(eq(schema.contactInquiries.id, id))
      .limit(1);

    if (!row) {
      throw new NotFoundError(`Inquiry with ID "${id}" was not found`, 'INQUIRY_NOT_FOUND');
    }

    const replyRows = await this.db
      .select()
      .from(schema.contactInquiryReplies)
      .where(eq(schema.contactInquiryReplies.inquiryId, id))
      .orderBy(asc(schema.contactInquiryReplies.createdAt));

    const replies: ContactInquiryReply[] = replyRows.map((r) => ({
      id: r.id,
      inquiryId: r.inquiryId,
      senderId: r.senderId,
      senderEmail: r.senderEmail,
      senderName: r.senderName,
      type: r.type as 'PUBLIC_REPLY' | 'INTERNAL_NOTE',
      message: r.message,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : new Date(r.createdAt).toISOString(),
    }));

    return this.formatInquiry(
      row.inquiry,
      row.assignedUser?.name ? row.assignedUser : null,
      replies.length,
      replies
    );
  }

  /**
   * Updates lifecycle status of an inquiry.
   */
  async updateStatus(
    id: string,
    newStatus: ContactInquiryStatus,
    actor: ActorContext
  ): Promise<ContactInquiry> {
    const existing = await this.getInquiryById(id);

    const isResolving = newStatus === 'RESOLVED';
    const resolvedAt = isResolving ? new Date().toISOString() : null;
    const resolvedById = isResolving ? actor.id : null;

    const [updated] = await this.db
      .update(schema.contactInquiries)
      .set({
        status: newStatus,
        resolvedAt: isResolving ? resolvedAt : existing.resolvedAt,
        resolvedById: isResolving ? resolvedById : existing.resolvedById,
      })
      .where(eq(schema.contactInquiries.id, id))
      .returning();

    await this.auditLogService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role as any,
      action: 'CONTACT_INQUIRY_STATUS_UPDATED',
      entityType: 'CONTACT_INQUIRY',
      entityId: id,
      severity: 'INFO',
      description: `Inquiry status changed from ${existing.status} to ${newStatus} by ${actor.name}`,
      metadata: { previousStatus: existing.status, newStatus },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return this.formatInquiry(updated, {
      name: existing.assignedToName ?? '',
      email: existing.assignedToEmail ?? '',
    });
  }

  /**
   * Assigns an inquiry to an administrative staff member.
   */
  async assignInquiry(
    id: string,
    assignedToId: string | null,
    actor: ActorContext
  ): Promise<ContactInquiry> {
    await this.getInquiryById(id);

    let assignedUser: { name: string; email: string } | null = null;
    if (assignedToId) {
      const [u] = await this.db
        .select({ name: schema.user.name, email: schema.user.email })
        .from(schema.user)
        .where(eq(schema.user.id, assignedToId))
        .limit(1);

      if (!u) {
        throw new BadRequestError('Assignee user was not found', 'USER_NOT_FOUND');
      }
      assignedUser = u;
    }

    const [updated] = await this.db
      .update(schema.contactInquiries)
      .set({ assignedToId })
      .where(eq(schema.contactInquiries.id, id))
      .returning();

    await this.auditLogService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role as any,
      action: 'CONTACT_INQUIRY_ASSIGNED',
      entityType: 'CONTACT_INQUIRY',
      entityId: id,
      severity: 'INFO',
      description: assignedUser
        ? `Inquiry assigned to ${assignedUser.name} <${assignedUser.email}> by ${actor.name}`
        : `Inquiry assignment cleared by ${actor.name}`,
      metadata: { assignedToId },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return this.formatInquiry(updated, assignedUser);
  }

  /**
   * Adds an internal note or sends an official email reply to the customer.
   */
  async addReply(
    id: string,
    input: CreateInquiryReplyInput,
    actor: ActorContext
  ): Promise<ContactInquiryReply> {
    const inquiry = await this.getInquiryById(id);

    const [replyRow] = await this.db
      .insert(schema.contactInquiryReplies)
      .values({
        inquiryId: id,
        senderId: actor.id,
        senderEmail: actor.email,
        senderName: actor.name,
        type: input.type,
        message: input.message,
      })
      .returning();

    // If public reply, dispatch email to visitor and advance status to IN_REVIEW if NEW
    if (input.type === 'PUBLIC_REPLY') {
      if (inquiry.status === 'NEW') {
        await this.db
          .update(schema.contactInquiries)
          .set({ status: 'IN_REVIEW' })
          .where(eq(schema.contactInquiries.id, id));
      }

      try {
        const mailer = getMailer();
        const referenceNumber = `KAL-${inquiry.id.slice(0, 6).toUpperCase()}`;
        const subject = `Re: [Kalya Support] ${inquiry.topic} (${referenceNumber})`;

        void mailer
          .sendTemplate({
            to: inquiry.email,
            subject,
            template: ContactReplyNotice,
            props: {
              userName: inquiry.name,
              referenceNumber,
              topic: inquiry.topic,
              staffName: actor.name,
              replyMessage: input.message,
              originalMessage: inquiry.message,
            },
          })
          .catch((err) => {
            log.warn('Could not dispatch staff response email', {
              error: err instanceof Error ? err.message : String(err),
              to: inquiry.email,
            });
          });
      } catch (mailErr) {
        log.warn('Mailer failed on public reply', {
          error: mailErr instanceof Error ? mailErr.message : String(mailErr),
        });
      }
    }

    // Record audit trail
    await this.auditLogService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role as any,
      action:
        input.type === 'PUBLIC_REPLY' ? 'CONTACT_INQUIRY_REPLIED' : 'CONTACT_INQUIRY_NOTE_ADDED',
      entityType: 'CONTACT_INQUIRY',
      entityId: id,
      severity: 'INFO',
      description:
        input.type === 'PUBLIC_REPLY'
          ? `Public reply sent to ${inquiry.email} by ${actor.name}`
          : `Internal note added by ${actor.name}`,
      metadata: { type: input.type },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return {
      id: replyRow.id,
      inquiryId: replyRow.inquiryId,
      senderId: replyRow.senderId,
      senderEmail: replyRow.senderEmail,
      senderName: replyRow.senderName,
      type: replyRow.type as 'PUBLIC_REPLY' | 'INTERNAL_NOTE',
      message: replyRow.message,
      createdAt:
        replyRow.createdAt instanceof Date
          ? replyRow.createdAt.toISOString()
          : new Date(replyRow.createdAt).toISOString(),
    };
  }

  /**
   * Data export for compliance / DPDP auditing.
   */
  async exportInquiries(): Promise<ContactInquiry[]> {
    const rows = await this.db
      .select({
        inquiry: schema.contactInquiries,
        assignedUser: {
          name: schema.user.name,
          email: schema.user.email,
        },
      })
      .from(schema.contactInquiries)
      .leftJoin(schema.user, eq(schema.contactInquiries.assignedToId, schema.user.id))
      .orderBy(desc(schema.contactInquiries.createdAt));

    return rows.map((r) =>
      this.formatInquiry(r.inquiry, r.assignedUser?.name ? r.assignedUser : null)
    );
  }
}
