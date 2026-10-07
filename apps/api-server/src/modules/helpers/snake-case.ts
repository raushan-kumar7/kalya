import type { FastifyReply, FastifyRequest } from 'fastify';

const toSnakeKey = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/** Deeply converts object keys from camelCase to snake_case (idempotent for snake_case keys). */
export const toSnake = (value: any): any => {
  if (Array.isArray(value)) return value.map(toSnake);
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [toSnakeKey(k), toSnake(v)]));
  }
  return value;
};

/**
 * Fastify preSerialization hook: converts only the `data` field of the standard
 * `{ success, data, message }` envelope, so the client always receives snake_case rows
 * (matching the @kalya/types DTOs) while Drizzle keeps using camelCase internally.
 */
export const snakeCaseResponseHook = async (
  _request: FastifyRequest,
  _reply: FastifyReply,
  payload: unknown
) => {
  if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
    return { ...(payload as any), data: toSnake((payload as any).data) };
  }
  return payload;
};
