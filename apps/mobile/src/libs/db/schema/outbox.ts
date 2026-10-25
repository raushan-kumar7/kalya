import { idCol, integer, sqliteTable, text, timestamps, updatedAt } from '@kalya/db';

export const syncOutbox = sqliteTable('sync_outbox', {
  id: idCol(), // Stable client-generated UUID
  entityType: text('entity_type', {
    enum: ['expense', 'income', 'budget', 'split'],
  }).notNull(),
  entityId: text('entity_id').notNull(),
  operation: text('operation', { enum: ['create', 'update', 'delete'] }).notNull(),
  payload: text('payload').notNull(), // JSON payload string
  status: text('status', { enum: ['pending', 'processing', 'failed'] })
    .default('pending')
    .notNull(),
  attempts: integer('attempts').default(0).notNull(),
  lastError: text('last_error'),
  ...timestamps(),
});

export const syncMetadata = sqliteTable('sync_metadata', {
  key: text('key').primaryKey(), // e.g. "last_sync_timestamp"
  value: text('value').notNull(),
  updatedAt: updatedAt(),
});
