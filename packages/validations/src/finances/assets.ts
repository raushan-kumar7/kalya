import { z } from 'zod';
import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DIGITAL_ASSET_TYPE_OPTIONS,
  DigitalAssetFilterQueryDto,
  EquityAssetFilterQueryDto,
  EXCHANGE_TYPE_OPTIONS,
  UpdateDigitalAssetDto,
  UpdateEquityAssetDto,
} from '@kalya/types';
import { DecimalSchema, ISODateSchema, ISOTimestampSchema, UUIDSchema } from '../core';
import { PositiveMoneySchema } from './income';

// ============================================================================
// Enums
// ============================================================================

/**
 * Zod schema for Digital Asset commodities (gold, silver).
 */
export const DigitalAssetTypeSchema = z.enum(DIGITAL_ASSET_TYPE_OPTIONS, {
  error: 'Invalid digital asset type',
});

/**
 * Zod schema for Indian stock exchanges (BSE, NSE).
 */
export const ExchangeTypeSchema = z.enum(EXCHANGE_TYPE_OPTIONS, {
  error: 'Invalid stock exchange type',
});

// ============================================================================
// Digital Asset Schemas
// ============================================================================

/**
 * Schema for creating a Digital Asset transaction.
 */
export const CreateDigitalAssetSchema: z.ZodType<CreateDigitalAssetDto> = z
  .object({
    type: DigitalAssetTypeSchema,
    date: ISODateSchema,
    platform: z
      .string({ error: 'Platform name is required' })
      .trim()
      .min(1, 'Platform name is required')
      .max(100, 'Platform name is too long'),
    rate_per_gram: PositiveMoneySchema,
    amount_paid: PositiveMoneySchema,
    gst_3_percent: PositiveMoneySchema.optional(),
    weight_in_gram: DecimalSchema.min(0.0001, 'Weight must be greater than zero'),
    asset_value: PositiveMoneySchema.optional(),
  })
  .transform((data) => {
    const rate = data.rate_per_gram;
    const weight = data.weight_in_gram;
    const amount = data.amount_paid;
    return {
      ...data,
      gst_3_percent: data.gst_3_percent ?? +(amount * 0.03).toFixed(2),
      asset_value: data.asset_value ?? +(weight * rate).toFixed(2),
    };
  });
export type CreateDigitalAssetInput = z.infer<typeof CreateDigitalAssetSchema>;

/**
 * Schema for updating an existing Digital Asset.
 */
export const UpdateDigitalAssetSchema: z.ZodType<UpdateDigitalAssetDto> = z.object({
  type: DigitalAssetTypeSchema.optional(),
  date: ISODateSchema.optional(),
  platform: z.string().trim().min(1).max(100).optional(),
  rate_per_gram: PositiveMoneySchema.optional(),
  amount_paid: PositiveMoneySchema.optional(),
  gst_3_percent: PositiveMoneySchema.optional(),
  weight_in_gram: DecimalSchema.min(0.0001).optional(),
  asset_value: PositiveMoneySchema.optional(),
});
export type UpdateDigitalAssetInput = z.infer<typeof UpdateDigitalAssetSchema>;

/** Backwards-compatible alias */
export const DigitalAssetUpdateSchema = UpdateDigitalAssetSchema;

/**
 * Query filter schema for Digital Assets.
 */
export const DigitalAssetFilterQuerySchema: z.ZodType<DigitalAssetFilterQueryDto> = z.object({
  type: DigitalAssetTypeSchema.optional(),
  platform: z.string().trim().optional(),
  from: ISODateSchema.optional(),
  to: ISODateSchema.optional(),
});
export type DigitalAssetFilterQueryInput = z.infer<typeof DigitalAssetFilterQuerySchema>;

/**
 * Full Digital Asset entity schema.
 */
export const DigitalAssetSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  type: DigitalAssetTypeSchema,
  date: ISODateSchema,
  platform: z.string().min(1),
  rate_per_gram: PositiveMoneySchema,
  amount_paid: PositiveMoneySchema,
  gst_3_percent: PositiveMoneySchema,
  weight_in_gram: DecimalSchema.min(0),
  asset_value: PositiveMoneySchema,
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type DigitalAssetInput = z.infer<typeof DigitalAssetSchema>;

// ============================================================================
// Equity Asset Schemas
// ============================================================================

/**
 * Schema for recording an Equity Asset / stock share purchase.
 */
export const CreateEquityAssetSchema: z.ZodType<CreateEquityAssetDto> = z
  .object({
    exchange_type: ExchangeTypeSchema,
    date: ISODateSchema,
    company: z
      .string({ error: 'Company or ticker symbol is required' })
      .trim()
      .min(1, 'Company is required')
      .max(100, 'Company name is too long'),
    price_per_share: PositiveMoneySchema,
    total_shared: z.coerce
      .number({ error: 'Total shares is required' })
      .int('Total shares must be a whole integer')
      .min(1, 'Total shares must be at least 1'),
    total_amount: PositiveMoneySchema.optional(),
  })
  .transform((data) => ({
    ...data,
    total_amount: data.total_amount ?? +(data.price_per_share * data.total_shared).toFixed(2),
  }));
export type CreateEquityAssetInput = z.infer<typeof CreateEquityAssetSchema>;

/**
 * Schema for updating an Equity Asset.
 */
export const UpdateEquityAssetSchema: z.ZodType<UpdateEquityAssetDto> = z.object({
  exchange_type: ExchangeTypeSchema.optional(),
  date: ISODateSchema.optional(),
  company: z.string().trim().min(1).max(100).optional(),
  price_per_share: PositiveMoneySchema.optional(),
  total_shared: z.coerce.number().int().min(1).optional(),
  total_amount: PositiveMoneySchema.optional(),
});
export type UpdateEquityAssetInput = z.infer<typeof UpdateEquityAssetSchema>;

/** Backwards-compatible alias */
export const EquityAssetUpdateSchema = UpdateEquityAssetSchema;

/**
 * Query filter schema for Equity Assets.
 */
export const EquityAssetFilterQuerySchema: z.ZodType<EquityAssetFilterQueryDto> = z.object({
  exchange_type: ExchangeTypeSchema.optional(),
  company: z.string().trim().optional(),
  from: ISODateSchema.optional(),
  to: ISODateSchema.optional(),
});
export type EquityAssetFilterQueryInput = z.infer<typeof EquityAssetFilterQuerySchema>;

/**
 * Full Equity Asset entity schema.
 */
export const EquityAssetSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  exchange_type: ExchangeTypeSchema,
  date: ISODateSchema,
  company: z.string().min(1),
  price_per_share: PositiveMoneySchema,
  total_shared: z.number().int(),
  total_amount: PositiveMoneySchema,
  created_at: ISOTimestampSchema,
  updated_at: ISOTimestampSchema,
});
export type EquityAssetInput = z.infer<typeof EquityAssetSchema>;
