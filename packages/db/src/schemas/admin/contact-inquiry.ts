import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, idCol, isoDate, timestamps, uuidCol } from '../_columns';
import { user } from '../auth/user';

export const contactInquiryTopics = [
  'Question',
  'Feedback or idea',
  'Report a problem',
  'Privacy request',
  'Other',
] as const;

export type ContactInquiryTopic = (typeof contactInquiryTopics)[number];

export const contactInquiryStatuses = ['NEW', 'IN_REVIEW', 'RESOLVED', 'SPAM', 'ARCHIVED'] as const;

export type ContactInquiryStatus = (typeof contactInquiryStatuses)[number];

export const contactInquiryPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export type ContactInquiryPriority = (typeof contactInquiryPriorities)[number];

export const contactInquiries = sqliteTable(
  'contact_inquiries',
  {
    id: idCol(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    topic: text('topic', { enum: contactInquiryTopics }).notNull(),
    message: text('message').notNull(),
    status: text('status', { enum: contactInquiryStatuses }).notNull().default('NEW'),
    priority: text('priority', { enum: contactInquiryPriorities }).notNull().default('NORMAL'),
    userId: uuidCol('user_id').references(() => user.id, { onDelete: 'set null' }),
    assignedToId: uuidCol('assigned_to_id').references(() => user.id, { onDelete: 'set null' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    slaDueDate: isoDate('sla_due_date').notNull(),
    resolvedAt: isoDate('resolved_at'),
    resolvedById: uuidCol('resolved_by_id').references(() => user.id, { onDelete: 'set null' }),
    ...timestamps(),
  },
  (t) => [
    index('contact_inquiry_status_idx').on(t.status),
    index('contact_inquiry_topic_idx').on(t.topic),
    index('contact_inquiry_email_idx').on(t.email),
    index('contact_inquiry_created_at_idx').on(t.createdAt),
    index('contact_inquiry_sla_due_idx').on(t.slaDueDate),
  ]
);

export const contactInquiryReplies = sqliteTable(
  'contact_inquiry_replies',
  {
    id: idCol(),
    inquiryId: text('inquiry_id')
      .notNull()
      .references(() => contactInquiries.id, { onDelete: 'cascade' }),
    senderId: uuidCol('sender_id').references(() => user.id, { onDelete: 'set null' }),
    senderEmail: text('sender_email').notNull(),
    senderName: text('sender_name').notNull(),
    type: text('type', { enum: ['PUBLIC_REPLY', 'INTERNAL_NOTE'] })
      .notNull()
      .default('PUBLIC_REPLY'),
    message: text('message').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('contact_reply_inquiry_idx').on(t.inquiryId),
    index('contact_reply_created_at_idx').on(t.createdAt),
  ]
);

export type ContactInquiryRow = typeof contactInquiries.$inferSelect;
export type ContactInquiryEntity = typeof contactInquiries.$inferInsert;
export type ContactInquiryReplyRow = typeof contactInquiryReplies.$inferSelect;
export type ContactInquiryReplyEntity = typeof contactInquiryReplies.$inferInsert;
