import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, isoDate, money, timestamps } from '../_columns';
import { userIdCol } from './_user-ref';

export const digitalAsset = sqliteTable(
  'digital_asset',
  {
    id: idCol(),
    userId: userIdCol(),
    type: text('type', { enum: ['gold', 'silver'] })
      .notNull()
      .default('gold'),
    date: isoDate('date').notNull(),
    platform: text('platform').notNull(),
    ratePerGram: money('rate_per_gram', { notNull: true }),
    amountPaid: money('amount_paid', { notNull: true }),
    gst3Percent: money('gst_3_percent', { notNull: true }),
    weightInGram: real('weight_in_gram').notNull(),
    assetValue: money('asset_value', { notNull: true }),
    ...timestamps(),
  },
  (t) => [index('digital_asset_user_type_platform_idx').on(t.userId, t.type, t.platform)]
);

export const equityAsset = sqliteTable(
  'equity_asset',
  {
    id: idCol(),
    userId: userIdCol(),
    exchangeType: text('exchange_type', { enum: ['BSE', 'NSE'] })
      .notNull()
      .default('BSE'),
    date: isoDate('date').notNull(),
    company: text('company').notNull(),
    pricePerShare: money('price_per_share', { notNull: true }),
    totalShared: integer('total_shared').notNull(), // total shares bought
    totalAmount: money('total_amount', { notNull: true }), // derived: pricePerShare * totalShared
    ...timestamps(),
  },
  (t) => [index('equity_asset_user_exchange_company_idx').on(t.userId, t.exchangeType, t.company)]
);

export type DigitalAssetRow = typeof digitalAsset.$inferSelect;
export type DigitalAssetEntity = typeof digitalAsset.$inferInsert;

export type EquityAssetRow = typeof equityAsset.$inferSelect;
export type EquityAssetEntity = typeof equityAsset.$inferInsert;
