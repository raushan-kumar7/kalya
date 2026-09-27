import { z } from 'zod';
import { parseDuration } from '@kalya/utils';

export const zBoolString = z.enum(['true', 'false']).transform((v) => v === 'true');

export const zCsvList = z.string().transform((v) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

export const zDurationMs = z.string().transform((v, ctx) => {
  const ms = parseDuration(v);
  if (ms === undefined || ms === null || Number.isNaN(ms)) {
    ctx.addIssue({
      code: 'custom',
      message: `Invalid duration string: "${v}"`,
    });
    return z.NEVER;
  }
  return ms;
});
