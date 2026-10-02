import { z } from 'zod';

export const UUIDSchema = z.string().min(1, 'ID is required');

export const ISODateSchema = z.iso.date({ message: 'Invalid ISO Date (YYYY-MM-DD)' });

export const ISOTimestampSchema = z.union([
  z.iso.datetime({ message: 'Invalid ISO Timestamp' }),
  z.date().transform((d) => d.toISOString()),
]);

export const DecimalSchema = z.number();

export const MonthStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Invalid Month string (YYYY-MM)');
