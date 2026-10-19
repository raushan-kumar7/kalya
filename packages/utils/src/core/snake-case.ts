export const toSnakeKey = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export const toSnake = <T>(v: T): T => {
  if (Array.isArray(v)) return v.map(toSnake) as unknown as T;
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [toSnakeKey(k), toSnake(val)])
    ) as unknown as T;
  }
  return v;
};
