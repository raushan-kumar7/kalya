export const toSnakeKey = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export const toSnake = (v: any): any => {
  if (Array.isArray(v)) return v.map(toSnake);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [toSnakeKey(k), toSnake(val)]));
  }
  return v;
};
